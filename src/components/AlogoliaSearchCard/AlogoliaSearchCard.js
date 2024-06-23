import React, { useEffect, useState } from 'react';
import { createSlug } from '../../util/urlHelpers';
import { FormattedMessage } from '../../util/reactIntl';
import css from './AlogoliaSearchCard.module.css';
import IconCollection from '../IconCollection/IconCollection';
import NamedLink from '../NamedLink/NamedLink';
import { checkCountLimit, checkPriceLimit, getLabel } from '../../util/dataExtractor';
import { listingColors, listingConditions } from '../../config/configListing';
import { listingBrands } from '../../config/configBrand';
import { listingFieldTypes } from '../../config/configTypes';
import Overlay from '../../containers/ManageListingsPage/ManageListingCard/Overlay';
import { fetchAuthorData } from '../../containers/AlgoliaSearchPage/AlgoliaSearchPage.duck';
import { createResourceLocatorString } from '../../util/routes';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useDispatch } from 'react-redux';

const AlogoliaSearchCard = props => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { hit, currentUser, onUpdateProfile, routeConfiguration, location } = props;
  const slug = createSlug(hit?.title);
  const [authorData, setAuthorData] = useState(null);

  const { title, listingImagesUrl, price, condition, brand, type, color, objectID, size, user } =
    hit || {};

  const isOwnListing = !!currentUser?.id && user?.userId === currentUser?.id?.uuid;
  const { listingsSoldPrice, listingsSoldCount, currentPlanData, freePlanData } =
    (!!authorData?.id && authorData.attributes.profile.publicData) || {};

  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchAuthorData({ userId: user?.userId })).then(res => {
        setAuthorData(res);
      });
    }
  }, [!!user?.userId]);

  const { wishListItems = [] } =
    (!!currentUser?.id && currentUser.attributes.profile.protectedData) || {};
  const likeIndex = wishListItems && wishListItems.findIndex(e => e == objectID);

  const handleFavouriteItems = async () => {
    if (isOwnListing) {
      return null;
    }
    if (!currentUser?.id) {
      const state = { from: `${location.pathname}${location.search}${location.hash}` };
      history.push(createResourceLocatorString('SignupPage', routeConfiguration, {}, {}), state);
    } else {
      if (likeIndex > -1) {
        wishListItems.splice(likeIndex, 1);
      } else {
        wishListItems.push(objectID);
      }
      const profile = {
        protectedData: {
          wishListItems,
        },
      };
      await onUpdateProfile(profile);
    }
  };

  const isExceedPriceLimit = checkPriceLimit(listingsSoldPrice, freePlanData, currentPlanData);
  const isExceedCountLimit = checkCountLimit(listingsSoldCount, freePlanData, currentPlanData);

  return (
    <div className={css.root}>
      <NamedLink
        name="ListingPage"
        params={{ id: objectID, slug: createSlug(title) }}
        className={css.link}
        isSearchPage={true}
      >
        <div>
          {listingImagesUrl?.length > 0 ? (
            <div className={css.imageWrapper}>
              {isOwnListing ? <p className={css.onproduct}>Own Product</p> : null}
              <img src={listingImagesUrl[0]?.url} alt="listing-img" />
            </div>
          ) : (
            <div className={css.imageWrapper}>
              <IconCollection icon={'NoImage'} />{' '}
            </div>
          )}
          <p className={css.title}>{title}</p>
        </div>
      </NamedLink>
      {/* {loginRequriedModal} */}
      {!isOwnListing && <div
        onClick={e => handleFavouriteItems(e)} // Invoke handleFavouriteItems when likeIcon is clicked
        className={css.likeIcon}
      >
        {likeIndex == -1 ? (
          <span>
            <IconCollection icon="likeIcon" />
          </span>
        ) : (
          <span>
            <IconCollection icon="disLikeIcon" />
          </span>
        )}
      </div>}
      <div className={css.category}>
        <span>{condition && getLabel(listingConditions, condition)}</span>{' '}
        <span>{color && getLabel(listingColors, color)}</span>{' '}
        <span>
          {brand ? getLabel(listingBrands, brand) : type ? getLabel(listingFieldTypes, type) : null}
        </span>
      </div>
      <div className={css.emptySpace}></div>
      <div className={css.cardFooter}>
        <div className={css.priceWrapper}>
          <p>£{price?.amount / 100}.00</p>
          {size && (
            <span>
              <FormattedMessage id="ListingCard.size" values={{ size: size?.label ?? size }} />
            </span>
          )}
        </div>
        <NamedLink className={css.linkbuyNow} name="ListingPage" params={{ id: objectID, slug }}>
          <FormattedMessage id="ListingCard.buyNow" />
        </NamedLink>
      </div>
      {!!authorData?.id && (
        <div>
          {((!currentPlanData?.isActive && !freePlanData?.isFreePlanActive) ||
            ((isExceedPriceLimit || isExceedCountLimit) &&
              (currentPlanData?.isActive || freePlanData?.isFreePlanActive))) && (
            <Overlay message={''}>
              <div className={css.openListingButton}>
                <FormattedMessage id="AlgoliaSearchCard.openListing" />
              </div>
            </Overlay>
          )}
        </div>
      )}
    </div>
  );
};

export default AlogoliaSearchCard;
