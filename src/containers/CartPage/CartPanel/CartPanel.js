import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../../context/configurationContext';

import { FormattedMessage, injectIntl } from '../../../util/reactIntl';
import { displayPrice } from '../../../util/configHelpers';
import { lazyLoadWithDimensions } from '../../../util/uiHelpers';
import { formatMoney } from '../../../util/currency';
import { ensureListing, ensureUser } from '../../../util/data';
import { richText } from '../../../util/richText';
import { createSlug } from '../../../util/urlHelpers';
import { isBookingProcessAlias } from '../../../transactions/transaction';

import {
  AspectRatioWrapper,
  NamedLink,
  ResponsiveImage,
} from '../../../components';

import css from './CartPanel.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../ProfileSettingsPage/ProfileSettingsPage.duck';
import IconCollection from '../../../components/IconCollection/IconCollection';
import { fetchCurrentUser } from '../../../ducks/user.duck';
import { fetchAuthorListings, searchListings } from '../CartPage.duck';
import { queryUserReviews } from '../../ProfilePage/ProfilePage.duck';
import { types as sdkTypes } from '../../../util/sdkLoader';
const { Money } = sdkTypes;

const MIN_LENGTH_FOR_LONG_WORDS = 10;

const priceData = (price, currency, intl) => {
  if (price && price.currency === currency) {
    const newPrice = new Money(price.amount, price.currency)
    const formattedPrice = formatMoney(intl, newPrice);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTitle: intl.formatMessage(
        { id: 'ListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};

const LazyImage = lazyLoadWithDimensions(ResponsiveImage, { loadAfterInitialRendering: 3000 });

const PriceMaybe = props => {
  const { price, publicData, config, intl, isFavoritesPage } = props;
  const { listingType } = publicData || {};
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);
  if (!showPrice && price) {
    return null;
  }

  const isBookable = isBookingProcessAlias(publicData?.transactionProcessAlias);
  const { formattedPrice, priceTitle } = priceData(price, config.currency, intl);

  return (
    <p className={css.price}>
      <div title={priceTitle}>{formattedPrice}</div>
      {isBookable ? (
        <div className={css.perUnit}>
          <FormattedMessage id="ListingCard.perUnit" values={{ unitType: publicData?.unitType }} />
        </div>
      ) : null}
    </p>
  );
};

export const CartPanelComponent = props => {
  const config = useConfiguration();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDislikeOpen, setIsDislikeOpen] = useState(false);
  const state = useSelector(state => state);
  const { currentUser } = state.user;
  const { updateInProgress } = state.ProfileSettingsPage;
  const {
    className,
    rootClassName,
    intl,
    listing,
    renderSizes,
    setActiveListing,
    isFavoritesPage,
    handleCartListings,
    selectedListings,
    selectedListingId,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const {quantity} = currentListing.currentStock.attributes || 0;
  const id = currentListing.id.uuid;
  const { title = '', price, publicData, state: listingState = '' } = currentListing.attributes;
  const { color, condition, brand } = publicData || {};
  const slug = createSlug(title);
  const author = ensureUser(listing.author);
  const authorId = author.id.uuid;
  useEffect(() => {
    dispatch(queryUserReviews(authorId))
    dispatch(fetchAuthorListings({authorId}))
  }, [])
  const firstImage =
    currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  const setActivePropsMaybe = setActiveListing
    ? {
      onMouseEnter: () => setActiveListing(currentListing.id),
      onMouseLeave: () => setActiveListing(null),
    }
    : null;

  useEffect(() => {
    if (currentUser?.id) {
      setIsModalOpen(false);
    }
  }, [isModalOpen]);
  const { cartItems = [], likeItems = [] } =
    (!!currentUser?.id && currentUser.attributes.profile.protectedData) || {};
  const index = cartItems && cartItems.findIndex(e => e == id);
  const likeIndex = likeItems && likeItems.findIndex(e => e == id);

  const { wishListItems = [] } =
    (!!currentUser?.id && currentUser.attributes.profile.protectedData) || {};

  const indexWishlist = wishListItems && wishListItems.findIndex(e => e == currentListing.id.uuid);

  const handlecartItems = () => {
    if (!currentUser?.id) {
      setIsModalOpen(true);
    } else {
      if (index > -1) {
        cartItems.splice(index, 1);
      } else {
        cartItems.push(id);
      }
      const profile = {
        protectedData: {
          cartItems,
        },
      };
      dispatch(updateProfile(profile));

      dispatch(searchListings(cartItems, "", config));
    }
  };

  const handleFavouriteItems = async () => {
    try {
      if (!currentUser) {
        const state = { from: `${location.pathname}${location.search}${location.hash}` };
        history.push(createResourceLocatorString('SignupPage', routeConfiguration, {}, {}), state);
      } else {
        if (indexWishlist > -1) {
          wishListItems.splice(indexWishlist, 1);
          const addedwishListItems = Array.from(new Set(wishListItems));
          const profile = {
            protectedData: {
              wishListItems: addedwishListItems,
            },
          };
          const result = await dispatch(updateProfile(profile));
          if (result) {
            dispatch(fetchCurrentUser());
          }
        } else {
          wishListItems.push(currentListing.id.uuid);
          const addedwishListItems = Array.from(new Set(wishListItems));
          const profile = {
            protectedData: {
              wishListItems: addedwishListItems,
            },
          };
          const result = await dispatch(updateProfile(profile));
          if (result) {
            dispatch(fetchCurrentUser());
          }
        }
      }

      handlecartItems();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDislike = () => {
    setIsDislikeOpen(true);
  };

  return (
    <>
      <span
        onClick={() => {
          handleCartListings(id);
        }}
      >
        {/* {selectedListings === authorId || selectedListingId?.includes(id) ? (
          <IconCollection icon="checkIcon" />
        ) : (
          <IconCollection icon="uncheckIcon" />
        )} */}
      </span>

      
      
      <NamedLink className={classes} name="ListingPage" params={{ id, slug }}>
        <AspectRatioWrapper
          className={css.aspectRatioWrapper}
          width={aspectWidth}
          height={aspectHeight}
          {...setActivePropsMaybe}
        >
          <LazyImage
            rootClassName={css.rootForImage}
            alt={title}
            image={firstImage}
            variants={variants}
            sizes={renderSizes}
            listingImagesUrl={publicData?.listingImagesUrl && publicData?.listingImagesUrl[0]?.url}
            likeIndex={likeIndex}
            isListingCard={true}
            handleDislike={handleDislike}
            isFavoritesPage={isFavoritesPage}
          />
        </AspectRatioWrapper>
        <div className={css.info}>
        
          <div className={css.mainInfo}>
            <div className={css.infoLeft}>
            <div className={css.titleBox}>
              <div className={css.title}>
                {richText(title, {
                  longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
                  longWordClass: css.longWord,
                })}

                </div>
                {listingState === 'closed' ? <div className={css.soldOutText}><FormattedMessage id="CartPanel.unavailable" /></div> : !quantity ? <div className={css.soldOutText}><FormattedMessage id="CartPanel.soldOut" /></div> : null}
              </div>
              <div className={css.priceWrapper}>
                <PriceMaybe price={price} publicData={publicData} config={config} intl={intl} />
              </div>
              <div className={css.lineItem}><span><FormattedMessage id="CartPanel.brand" /></span> <b>{brand}</b></div>
              <div className={css.lineItem}><span><FormattedMessage id="CartPanel.condition" /></span> <b>{condition}</b></div>
              <div className={css.lineRow}>
                <div className={css.lineItem}><span><FormattedMessage id="CartPanel.color" /></span> <b>{color}</b></div>
                <div
                 onClick={(e) => {
                  handleFavouriteItems();
                  e.preventDefault();
                } }
                 
                 className={css.saveWishlist}>
                 <FormattedMessage id="CartPanel.saveToWishlist" />
                 </div>
              </div>

            </div>
                

            <div className={css.cardFooter}>
              <div className={css.bagButton}>
                {index > -1 ? (
                  <span
                    onClick={e => {
                      e.preventDefault();
                      handlecartItems();
                    }}
                  >
                    <IconCollection icon="deleteIcon" />
                    {/* <FormattedMessage id="CartPanel.removeFromBag" /> */}
                  </span>
                ) : (
                  null
                  // <span
                  //   onClick={e => {
                  //     e.preventDefault();
                  //     handlecartItems();
                  //   }}
                  // >
                  //   {/* <IconCollection icon={'addToBag'} /> */}
                  //   <FormattedMessage id="CartPanel.addToBag" />
                  // </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </NamedLink>
    </>
  );
};

export default injectIntl(CartPanelComponent);
