import React from 'react';
import { string, func, bool } from 'prop-types';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { useHistory } from 'react-router-dom';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { displayPrice } from '../../util/configHelpers';
import { lazyLoadWithDimensions } from '../../util/uiHelpers';
import { propTypes } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { ensureListing, ensureUser } from '../../util/data';
import { richText } from '../../util/richText';
import { createSlug } from '../../util/urlHelpers';
import { isBookingProcessAlias } from '../../transactions/transaction';
import {
  AspectRatioWrapper,
  NamedLink,
  PrimaryButtonInline,
  ResponsiveImage,
} from '../../components';
import { useDispatch, useSelector } from 'react-redux';
import css from './ListingCard.module.css';
import { checkCountLimit, checkPriceLimit, getLabel } from '../../util/dataExtractor';
import { listingColors, listingConditions, listingSizes } from '../../config/configListing';
import { listingBrands } from '../../config/configBrand';
import { listingFieldTypes } from '../../config/configTypes';
import routeConfiguration from '../../routing/routeConfiguration';
import { updateProfile } from '../../containers/ProfileSettingsPage/ProfileSettingsPage.duck';
import { createResourceLocatorString } from '../../util/routes';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { wishlistListingSuccess } from '../../containers/MyWishlistPage/MyWishlistPage.duck';
import { types as sdkTypes } from '../../util/sdkLoader';
import Overlay from '../../containers/ManageListingsPage/ManageListingCard/Overlay';
const MIN_LENGTH_FOR_LONG_WORDS = 10;

const { UUID} = sdkTypes;

const priceData = (price, currency, intl) => {
  // Assuming formatMoney is a function that formats the price correctly
  const formatMoney = (intl, amount) => {
    return new Intl.NumberFormat(intl.locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (price && price.currency === currency) {
    const formattedPrice = formatMoney(intl, price.amount/100);
    return { formattedPrice, priceTitle: formattedPrice };
  }

  if (price) {
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
  const { price, publicData, config, intl } = props;
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
    <div className={css.price}>
      <div className={css.priceValue} title={priceTitle}>
        {formattedPrice}
      </div>
      {isBookable ? (
        <div className={css.perUnit}>
          <FormattedMessage id="ListingCard.perUnit" values={{ unitType: publicData?.unitType }} />
        </div>
      ) : null}
    </div>
  );
};

export const ListingCardComponent = props => {
  const config = useConfiguration();
  const dispatch = useDispatch();
  const routeConfiguration = useRouteConfiguration();
  const history = useHistory();
  const state = useSelector(state => state);
  const { currentUser } = state.user;
  const {
    className,
    rootClassName,
    intl,
    listing,
    renderSizes,
    setActiveListing,
    showAuthorInfo,
    isWhishlist,
    isProfile,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const id = currentListing.id.uuid;
  const { title = '', price, publicData } = currentListing.attributes;
  const stockQuantity = currentListing?.currentStock?.attributes?.quantity;

  const { color, condition, size, brand, type } = publicData || {};
  const slug = createSlug(title || '');
  const author = ensureUser(listing.author);
  const authorName = author.attributes.profile.displayName;
  const firstImage =
    currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

  const {
    listingsSoldPrice,
    listingsSoldCount,
    currentPlanData,
    freePlanData,
    businessListingUnavailable,
  } = (!!author?.id && author.attributes.profile.publicData) || {};

  const isExceedPriceLimit = checkPriceLimit(listingsSoldPrice, freePlanData, currentPlanData);
  const isExceedCountLimit = checkCountLimit(listingsSoldCount, freePlanData, currentPlanData);

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
  const { wishListItems = [] } =
    (!!currentUser?.id && currentUser.attributes.profile.protectedData) || {};

  const index = wishListItems && wishListItems.findIndex(e => e == currentListing.id.uuid);

  const handleFavouriteItems = async () => {
    try {
      if (!currentUser) {
        const state = { from: `${location.pathname}${location.search}${location.hash}` };
        history.push(createResourceLocatorString('SignupPage', routeConfiguration, {}, {}), state);
      } else {
        if (index > -1) {
          wishListItems.splice(index, 1);
          const addedwishListItems = Array.from(new Set(wishListItems));

          const profile = {
            protectedData: {
              wishListItems: addedwishListItems,
            },
          };
          const result = await dispatch(updateProfile(profile));
          if (result) {
            const modifiedId = addedwishListItems?.map(elm => new UUID(elm));

            dispatch(wishlistListingSuccess(modifiedId));
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
    } catch (error) {
      console.error(error);
    }
  };

  // Check if stockQuantity exists and is greater than zero
  if (isWhishlist && stockQuantity === 0) {
    // If stockQuantity does not exist or is zero, return null to prevent rendering
    return null;
  }

  return (
    <>
      {isWhishlist ? (
        <div className={classes}>
          {/* {stockQuantity ===0 && <div className={css.stockQuantity}></div>} */}
          <NamedLink name="ListingPage" params={{ id, slug }} className={css.link}>
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
                isListingCard={true}
                handleFavouriteItems={handleFavouriteItems}
                index={index}
              />
            </AspectRatioWrapper>
            <div className={css.info}>
              {/* {stockQuantity ===0?<div className={css.soldOutText}>Sold Out</div>:null} */}
              <div className={css.title}>
                {title?.length > 25 ? title?.slice(0, 25) + '…' : title}
              </div>
              <div className={css.category}>
                <span>{condition && getLabel(listingConditions, condition)}</span>{' '}
                <span>{color && getLabel(listingColors, color)}</span>{' '}
                <span>
                  {brand
                    ? getLabel(listingBrands, brand)
                    : type
                    ? getLabel(listingFieldTypes, type)
                    : null}
                </span>
              </div>
              <div className={css.cardFooter}>
                <PriceMaybe
                  className={css.price}
                  price={price}
                  publicData={publicData}
                  config={config}
                  intl={intl}
                />
                <button className={css.buyNowBtn}>
                  <FormattedMessage id="ListingCard.buyNow" />
                </button>
              </div>
            </div>
          </NamedLink>
          {/* <div>
            {(isExceedPriceLimit ||
              isExceedCountLimit ||
              (!currentPlanData?.isActive && !freePlanData?.isFreePlanActive)) && (
              <Overlay message={''}>
                <div className={css.openListingButton}>
                  <FormattedMessage id="AlgoliaSearchCard.openListing" />
                </div>
              </Overlay>
            )}
          </div>
          <div>
            {businessListingUnavailable && (
              <Overlay message={''}>
                <PrimaryButtonInline className={css.openListingButton}>
                  <FormattedMessage id="ManageListingCard.openListing" />
                </PrimaryButtonInline>
              </Overlay>
            )}
          </div> */}
        </div>
      ) : isProfile ? (
        <div className={!stockQuantity ? css.notClickable : classes}>
          {!stockQuantity && <div className={css.stockQuantity}></div>}
          <NamedLink name="ListingPage" params={{ id, slug }}>
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
                isListingCard={true}
                handleFavouriteItems={handleFavouriteItems}
                index={index}
              />
            </AspectRatioWrapper>
            <div className={css.info}>
              {!stockQuantity ? <div className={css.soldOutText}>Sold Out</div> : null}
              <div className={css.title}>
                {title.length > 25 ? title.slice(0, 25) + '…' : title}
              </div>
              <div className={css.category}>
                <span>{condition && getLabel(listingConditions, condition)}</span>{' '}
                <span>{color && getLabel(listingColors, color)}</span>{' '}
                <span>
                  {brand
                    ? getLabel(listingBrands, brand)
                    : type
                    ? getLabel(listingFieldTypes, type)
                    : null}
                </span>
              </div>
              <div className={css.cardFooter}>
                {!stockQuantity ? null : (
                  <PriceMaybe
                    className={css.price}
                    price={price}
                    publicData={publicData}
                    config={config}
                    intl={intl}
                  />
                )}
                <button className={!stockQuantity ? css.seeSimilarBtn : css.buyNowBtn}>
                  {!stockQuantity ? (
                    <FormattedMessage id="ListingCard.soldOut" />
                  ) : (
                    <FormattedMessage id="ListingCard.buyNow" />
                  )}
                </button>
              </div>
            </div>
          </NamedLink>
          {/* <div>
            {(isExceedPriceLimit || isExceedCountLimit || !currentPlanData?.isActive) && (
              <Overlay message={''}>
                <div className={css.openListingButton}>
                  <FormattedMessage id="AlgoliaSearchCard.openListing" />
                </div>
              </Overlay>
            )}
          </div>
          <div>
            {businessListingUnavailable && (
              <Overlay message={''}>
                <PrimaryButtonInline className={css.openListingButton}>
                  <FormattedMessage id="ManageListingCard.openListing" />
                </PrimaryButtonInline>
              </Overlay>
            )}
          </div> */}
        </div>
      ) : (
        <div className={css.cardRoot}>
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
              isListingCard={true}
              handleFavouriteItems={handleFavouriteItems}
              index={index}
            />
          </AspectRatioWrapper>
          <div className={css.info}>
            <div>
              <div className={css.title}>
                {title?.length > 25 ? title?.slice(0, 25) + '…' : title}
              </div>
              <div className={css.category}>
                <span>{condition && getLabel(listingConditions, condition)}</span>{' '}
                <span>{color && getLabel(listingColors, color)}</span>{' '}
                <span>
                  {brand
                    ? getLabel(listingBrands, brand)
                    : type
                    ? getLabel(listingFieldTypes, type)
                    : null}
                </span>
              </div>
            </div>
            <div className={css.cardFooter}>
              <PriceMaybe
                className={css.price}
                price={price}
                publicData={publicData}
                config={config}
                intl={intl}
              />
              <NamedLink className={css.link} name="ListingPage" params={{ id, slug }}>
                <button className={css.buyNowBtn}>
                  <FormattedMessage id="ListingCard.buyNow" />
                </button>
              </NamedLink>
            </div>
          </div>
          {/* <div>
            {(isExceedPriceLimit || isExceedCountLimit || !currentPlanData?.isActive) && (
              <Overlay message={''}>
                <div className={css.openListingButton}>
                  <FormattedMessage id="AlgoliaSearchCard.openListing" />
                </div>
              </Overlay>
            )}
          </div>
          <div>
            {businessListingUnavailable && (
              <Overlay message={''}>
                <PrimaryButtonInline className={css.openListingButton}>
                  <FormattedMessage id="ManageListingCard.openListing" />
                </PrimaryButtonInline>
              </Overlay>
            )}
          </div> */}
        </div>
      )}
    </>
  );
};

ListingCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: null,
  showAuthorInfo: true,
};

ListingCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  intl: intlShape.isRequired,
  listing: propTypes.listing.isRequired,
  showAuthorInfo: bool,

  // Responsive image sizes hint
  renderSizes: string,

  setActiveListing: func,
};

export default injectIntl(ListingCardComponent);
