import React from 'react';
import { string, func } from 'prop-types';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { useHistory } from 'react-router-dom';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { displayPrice } from '../../util/configHelpers';
import { lazyLoadWithDimensions } from '../../util/uiHelpers';
import { propTypes } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { ensureListing, ensureUser } from '../../util/data';
import { createSlug } from '../../util/urlHelpers';
import { isBookingProcessAlias } from '../../transactions/transaction';
import {
  AspectRatioWrapper,
  NamedLink,
  ResponsiveImage,
} from '../../components';
import { useDispatch, useSelector } from 'react-redux';
import css from './ListingCard.module.css';
import { updateProfile } from '../../containers/ProfileSettingsPage/ProfileSettingsPage.duck';
import { createResourceLocatorString } from '../../util/routes';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { wishlistListingSuccess } from '../../containers/MyWishlistPage/MyWishlistPage.duck';
import { types as sdkTypes } from '../../util/sdkLoader';
import routeConfiguration from '../../routing/routeConfiguration';
import { getLabel } from '../../util/dataExtractor';
import { listingConditions } from '../../config/configListing';

const { UUID } = sdkTypes;

/* Function to format price data */
const priceData = (price, currency, intl) => {
  const formatMoney = (intl, amount) => {
    return new Intl.NumberFormat(intl.locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (price && price.currency === currency) {
    const formattedPrice = formatMoney(intl, price.amount / 100);
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

/* Lazy load image component */
const LazyImage = lazyLoadWithDimensions(ResponsiveImage, { loadAfterInitialRendering: 3000 });

/* Component to conditionally display price */
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
    <div className={css.priceContainer}>
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
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const id = currentListing.id.uuid;
  const { title = '', price, publicData } = currentListing.attributes;

  const { condition } = publicData || {};
  const slug = createSlug(title || '');
  const author = ensureUser(listing.author);
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
          const result = await dispatch.updateProfile(profile);
          if (result) {
            dispatch(fetchCurrentUser());
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={classes}>
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
          <div className={css.title}>
            {title?.length > 25 ? title?.slice(0, 25) + '…' : title}
          </div>
          <div className={css.cardFooter}>
            <PriceMaybe
              className={css.price}
              price={price}
              publicData={publicData}
              config={config}
              intl={intl}
            />
            {condition && <span className={css.conditionTag}>{getLabel(listingConditions, condition)}</span>}
            <button className={css.buyNowBtn}>
              <FormattedMessage id="ListingCard.buyNow" />
            </button>
          </div>
        </div>
      </NamedLink>
    </div>
  );
};

ListingCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: null,
};

ListingCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  intl: intlShape.isRequired,
  listing: propTypes.listing.isRequired,

  // Responsive image sizes hint
  renderSizes: string,

  setActiveListing: func,
};

export default injectIntl(ListingCardComponent);
