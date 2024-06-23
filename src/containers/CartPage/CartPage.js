import React, { useState } from 'react';
import { compose } from 'redux';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, injectIntl } from '../../util/reactIntl';
import { ensureCurrentUser, ensureUser } from '../../util/data';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import {
  H3,
  Page,
  LayoutSingleColumn,
  ListingCard,
  Button,
  AvatarMedium,
  PaginationLinks,
  H5,
} from '../../components';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

// import { updateProfile, uploadImage } from './FavoritesPage.duck';
import css from './CartPage.module.css';
import { getListingsById, getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import CartPanel from './CartPanel/CartPanel';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { initializeCardPaymentData } from '../../ducks/stripe.duck';
import { createResourceLocatorString, findRouteByRouteName } from '../../util/routes';
import { createSlug } from '../../util/urlHelpers';
import IconCollection from '../../components/IconCollection/IconCollection';
import { formatMoney } from '../../util/currency';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { updateProfile } from '../ProfileSettingsPage/ProfileSettingsPage.duck';
import StarRatings from 'react-star-ratings';
const { types } = require('sharetribe-flex-sdk');
const { Money } = types;

const getTotalPriceArray = (cl, cartItems) => {
  if (!cl || !cartItems?.length) {
    return [];
  }
  const matchedListingsArr = cartItems
    .map(itemId => cl.find(c => c.id.uuid === itemId))
    .filter(item => item !== undefined);
  return matchedListingsArr;
};

const getTotalPrice = (cl, cartItems, intl) => {
  const matchedListings = getTotalPriceArray(cl, cartItems);
  if (!matchedListings?.length) return
  const currency = matchedListings?.[0]?.attributes?.price?.currency;
  const linePrices = matchedListings.map(item => (item.attributes?.price?.amount) * 1);
  const sum = linePrices.reduce((partialSum, price) => partialSum + price, 0);
  const moneyObject = new Money(sum, currency);
  const totalFormattedPrice = formatMoney(intl, moneyObject)

  return totalFormattedPrice;
};

export const CartPage = props => {
  const { scrollingDisabled, intl, authorListings } = props;
  const [selectedListings, setSelectedListings] = useState(null);
  const [selectedListingId, setSelectedListingId] = useState([]);
  const state = useSelector(state => state);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const routeConfiguration = useRouteConfiguration();
  const { currentUser } = state.user;
  const { userListingRefs, queryParams, queryInProgress, pagination } = state.CartPage;


  const { reviews } = state.ProfilePage;
  const cartlistings = !!userListingRefs && getMarketplaceEntities(state, userListingRefs);

  const { cartItems } = currentUser?.attributes?.profile?.protectedData || {};



  const groupBy = (listings, keySelector) => {
    return (
      listings &&
      listings.reduce((grouped, value) => {
        const key = keySelector(value);
        (grouped[key] || (grouped[key] = [])).push(value);
        return grouped;
      }, {})
    );
  };

  const combinedObjListings = groupBy(cartlistings, l => l.author.id.uuid);

  const arrKeys = Object.keys(combinedObjListings);

  const combinedListings = arrKeys.map(item => combinedObjListings[item]);


  const objectsWithZeroQuantity = i => {
    return combinedListings[i].find(obj => obj?.currentStock?.attributes?.quantity === 0);
  };

  const hasPaginationInfo = !!pagination && pagination.totalItems != null;
  const listingsAreLoaded = !queryInProgress && hasPaginationInfo;

  const page = queryParams ? queryParams.page : 1;
  const paginationLinks =
    listingsAreLoaded && cartlistings && cartlistings.length > 24 ? (
      <PaginationLinks
        className={css.pagination}
        pageName="CartPage"
        pageSearchParams={{ page }}
        pagination={pagination}
      />
    ) : null;

  const handleSubmit = (combinedListings, ind) => {
    const cartListings = combinedListings && combinedListings[ind] && combinedListings[ind].flat();
    const selectedListing =
      cartListings && cartListings.filter(st => selectedListingId.includes(st.id.uuid));

    const vendorListing =
      selectedListingId?.length > 0 ? selectedListing[0] : cartListings && cartListings[0];
    const bookingDatesMaybe = {};

    let cartData = [];
    (selectedListingId?.length > 0
      ? selectedListing && selectedListing
      : cartListings && cartListings
    ).forEach(item => {
      const currentStock = item && item.currentStock;
      const price = item && item.attributes && item.attributes.price;
      const title = item && item.attributes && item.attributes.title;
      const { weight } = item && item.attributes && item.attributes.publicData || {};
      const images = item && item.images;
      const authorId = item && item.author && item.author.id && item.author.id.uuid;
      const quantity = currentStock && currentStock.attributes && currentStock.attributes.quantity;
      const currency = price && price.currency;
      return cartData.push({
        listingId: item.id.uuid,
        stockCount: 1,
        oldStock: quantity,
        price: price?.amount / 100,
        title,
        authorId,
        currency,
        weight
        // images,
      });
    });
    const initialValues = {
      listing: vendorListing,
      orderData: {
        ...bookingDatesMaybe,
        quantity: 1,
        deliveryMethod: 'shipping',
        otherOrderData: {
          cartItems: cartData,
        },
      },
      confirmPaymentError: null,
    };

    const saveToSessionStorage = currentUser;

    // Customize checkout page state with current listing and selected orderData
    const { setInitialValues } = findRouteByRouteName('CheckoutPage', routeConfiguration);
    dispatch(setInitialValues(initialValues, saveToSessionStorage));
    // Clear previous Stripe errors from store if there is any
    dispatch(initializeCardPaymentData());

    // Redirect to CheckoutPage
    history.push(
      createResourceLocatorString(
        'CheckoutPage',
        routeConfiguration,
        {
          id: vendorListing?.id?.uuid,
          slug: createSlug(vendorListing?.attributes?.title),
        },
        {}
      )
    );
  };

  const handleCartListings = id => {
    setSelectedListingId(prevIds => {
      if (prevIds?.includes(id)) {
        return prevIds?.filter(prevId => prevId !== id); // Remove the ID if it already exists
      } else {
        return [...prevIds, id]; // Add the ID if it doesn't exist
      }
    });
  };

  const calculateAverage = (reviewsArray, authorId) => {
    const { reviews = [] } = reviewsArray.find((elm) => elm.userId === authorId) || {};
    if (reviews?.length === 0) {
      return 0;
    }
    const sum =
      reviews &&
      reviews?.reduce((accumulator, currentValue) => accumulator + currentValue.attributes.rating, 0);
    const average = sum / reviews?.length;
    return average;
  };

  const reviewsLength = (reviewsArray, authorId) => {
    // Find the user's reviews in the reviewsArray based on authorId
    const userReviews = reviewsArray.find((elm) => elm.userId === authorId);

    // If userReviews is not found or it doesn't have a reviews array, return 0
    if (!userReviews || !userReviews.reviews) {
      return 0;
    }
    // Otherwise, return the length of the reviews array
    return userReviews.reviews.length;
  }

  return (
    <Page className={css.root} title={'Cart Page'} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer currentPage="FavoritesPage" />
          </>
        }
        footer={<FooterContainer />}
      >
        <div className={css.content}>
          <div className={css.headingContainer}>
            <H3 as="h1" className={css.heading}>
              <FormattedMessage id="CartPage.heading" />
            </H3>
            {/* <FormattedMessage
              id="CartPage.shopping"
              values={{ count: cartlistings?.length, seller: combinedListings?.length }}
            /> */}
            <div className={css.listingCards}>
              {combinedListings.length > 0 ? (
                combinedListings.map((cl, i) => {
                  const titleAndPriceInfo = cl.map(itm => {
                    const title = itm.attributes.title;
                    const price = new Money(itm?.attributes?.price?.amount, "GBP")
                    const formattedPrice = formatMoney(intl, price);
                    return (
                      <div className={css.itemRow} key={itm.id.uuid}>
                        <label>{title.length > 25 ? `${title.slice(0, 25)}…` : title}</label>
                        <span>{formattedPrice}</span>
                      </div>
                    );
                  });

                  const state = cl[0]?.attributes?.state || '';

                  const author = ensureUser(cl[0].author);
                  const userName = author?.attributes?.profile?.publicData?.userName;
                  const authorId = author.id.uuid;
                  const totalSum = getTotalPrice(cl, cartItems, intl);

                  return (
                    <div key={i} className={css.cartCard}>
                      <div className={css.cardLeftItem}>
                        <div className={css.venderCards}>
                          <div
                            onClick={() => {
                              setSelectedListings(prevId => (prevId === authorId ? null : authorId));
                            }}
                            className={css.cartName}
                          >
                            <AvatarMedium user={author} className={css.avatarMd} />
                            <div className={css.reviewRattingContainer}>
                              <div className={css.authorName}>{userName}</div>
                              <div className={css.ratings}>
                                <StarRatings
                                  svgIconViewBox="0 0 40 37"
                                  svgIconPath="M20 0L26.113 11.5862L39.0211 13.8197L29.891 23.2138L31.7557 36.1803L20 30.4L8.2443 36.1803L10.109 23.2138L0.97887 13.8197L13.887 11.5862L20 0Z"
                                  starRatedColor="#ffb802"
                                  rating={reviews?.length ? calculateAverage(reviews, authorId) : 0}
                                  starDimension="16px"
                                  starSpacing="2px"
                                />
                                <FormattedMessage
                                  id={authorListings[authorId] > 1 ? 'OrderPanel.reviews' : 'OrderPanel.oneReview'}
                                  values={{
                                    reviews: reviews?.length ? reviewsLength(reviews, authorId) : 0,
                                    listing: authorListings[authorId]
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            {cl.map((l, ids) => (
                              <CartPanel
                                className={css.cartPanel}
                                key={ids}
                                history={history}
                                location={location}
                                listing={l}
                                currentUser={currentUser}
                                setActiveListing={() => { }}
                                showAuthorInfo={true}
                                handleCartListings={handleCartListings}
                                selectedListings={selectedListings}
                                selectedListingId={selectedListingId}
                              />
                            ))}
                          </div>
                        </div>
                        <div className={css.checkoutSection}>
                          {/* <div
                            className={css.checkoutButton}
                            onClick={() => {
                              if (!objectsWithZeroQuantity(i)) {
                                handleSubmit(combinedListings, i);
                              }
                            }}
                          >
                            <Button>
                              <FormattedMessage id="CartPage.checkout" />
                            </Button>
                          </div> */}
                        </div>
                      </div>
                      <div className={css.rightPanel}>
                        <h4 className={css.estimateTotal}><FormattedMessage id="CartPage.estimatedTotal" /></h4>
                        <p className={css.estimateText}><FormattedMessage id="CartPage.shippingAndTaxes" /></p>
                        <div className={css.items}>{titleAndPriceInfo}</div>
                        <div className={css.subTotal}>
                          <span><FormattedMessage id="CartPage.subTotal" /></span>
                          <b>{totalSum}</b>
                        </div>
                        <div className={css.checkoutSection}>
                          {state === 'closed' ? (
                            <div className={css.checkoutButton}>
                              <Button
                                disabled={objectsWithZeroQuantity(i)}
                                className={objectsWithZeroQuantity(i) ? css.disabledButton : ''}
                              >
                                <FormattedMessage id="CartPage.checkout" />
                              </Button>
                            </div>
                          ) : (
                            <div className={css.checkoutButton} onClick={() => {
                              if (!objectsWithZeroQuantity(i)) {
                                handleSubmit(combinedListings, i);
                              }
                            }}>
                              <Button>
                                <FormattedMessage id="CartPage.checkout" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <H5><FormattedMessage id="CartPage.emptyCart" /></H5>
              )}
            </div>
          </div>
          {paginationLinks}
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

const mapStateToProps = state => {

  const { authorListings } = state.CartPage;

  return {
    authorListings,
    scrollingDisabled: isScrollingDisabled(state),

  };
};
const CheckoutPage = compose(
  connect(
    mapStateToProps,

  )
)(CartPage);

export default injectIntl(CheckoutPage);
