import React from 'react';
import { node, object, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { createSlug } from '../../util/urlHelpers';
import { formatMoney } from '../../util/currency';

import {
  AspectRatioWrapper,
  AvatarMedium,
  H4,
  H6,
  NamedLink,
  ResponsiveImage,
} from '../../components';

import css from './CheckoutPage.module.css';
const { types } = require('sharetribe-flex-sdk');
const { Money } = types;

const DetailsSideCard = props => {
  const {
    listing,
    listingTitle,
    author,
    firstImage,
    layoutListingImageConfig,
    speculateTransactionErrorMessage,
    showPrice,
    processName,
    breakdown,
    intl,
    cartItems,
    transaction,
    setIsVerify,
    isVerify,
    fetchSpeculatedTransaction,
    pageData,
    selectedRate,
  } = props;
  const { price, publicData } = listing?.attributes || {};
  const unitType = publicData.unitType || 'unknown';
  const { category } = publicData || {};

  const { aspectWidth = 1, aspectHeight = 1, variantPrefix = 'listing-card' } =
    layoutListingImageConfig || {};
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];
  const { buyerShippingAddress } = !!transaction?.id && transaction.attributes.protectedData || {};

  const totalPrice =
    cartItems?.length > 0 && cartItems.reduce((accumulator, obj) => accumulator + obj.price, 0);


  return (
    <div className={css.detailsContainerDesktop}>
      {cartItems?.length > 0 ? (
        <div className={css.multipleCarts}>
          {/* <h3 className={css.orderSummaryTitle}>
          <FormattedMessage id="CheckoutPageWithInquiryProcess.order" />
        </h3> */}
          {cartItems?.map(data => {
            const money = new Money(data?.price * 100, "GBP")
            const formattedMoney = formatMoney(intl, money)
            // const firstCartImage = data?.images?.length > 0 ? data.images[0] : null;
            // const variantsCart = firstCartImage
            //   ? Object.keys(firstCartImage?.attributes?.variants).filter(k =>
            //       k.startsWith(variantPrefix)
            //     )
            //   : [];
            return (
              <div className={css.imageCard}>
                {/* <AspectRatioWrapper
                width={aspectWidth}
                height={aspectHeight}
                className={css.detailsAspectWrapper}
              >
                <ResponsiveImage
                  rootClassName={css.rootForImage}
                  alt={listingTitle}
                  image={firstCartImage}
                  variants={variantsCart}
                />
              </AspectRatioWrapper> */}
                <div className={css.detailsHeadings}>
                  <H6 as="h2">
                    <NamedLink
                      name="ListingPage"
                      params={{ id: listing?.id?.uuid, slug: createSlug(listingTitle) }}
                    >
                      {data?.title}
                    </NamedLink>
                  </H6>
                  <div className={css.priceContainer}>
                    <div className={css.perUnit}>Price : {formattedMoney}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <AspectRatioWrapper
            width={aspectWidth}
            height={aspectHeight}
            className={css.detailsAspectWrapper}
          >
            <ResponsiveImage
              rootClassName={css.rootForImage}
              alt={listingTitle}
              image={firstImage}
              variants={variants}
            />
          </AspectRatioWrapper>
          <div className={css.listingDetailsWrapper}>
            <div className={css.avatarWrapper}>
              <AvatarMedium user={author} disableProfileLink />
            </div>
            <div className={css.detailsHeadings}>
              <H4 as="h2">
                <NamedLink
                  name="ListingPage"
                  params={{ id: listing?.id?.uuid, slug: createSlug(listingTitle) }}
                >
                  {listingTitle}
                </NamedLink>
              </H4>
              {showPrice ? (
                <div className={css.priceContainer}>
                  <p className={css.price}>{formatMoney(intl, price)}</p>
                  <div className={css.perUnit}>
                    <FormattedMessage
                      id="CheckoutPageWithInquiryProcess.perUnit"
                      values={{ unitType }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            {speculateTransactionErrorMessage}
          </div>
        </div>
      )}

      {!!breakdown ? (
        <div className={css.orderBreakdownHeader}>
          <H6 as="h3" className={css.orderBreakdownTitle}>
            <FormattedMessage id={`CheckoutPage.${processName}.orderBreakdown`} />
          </H6>
          <hr className={css.totalDivider} />
        </div>
      ) : null}
      {breakdown}

      {(price?.amount / 100 >= 750 || totalPrice >= 750) && (['electronics', 'home', 'watches', 'tech'].includes(category)) && <div>
        <span className={css.checkboxWrapper}>
          <input
            id="quality"
            type="checkbox"
            checked={isVerify}
            onChange={(e) => {
              setIsVerify((prev) => {
                const newIsVerify = !prev;

                const { orderData } = pageData || {};
                const { cartItems } = orderData?.otherOrderData || {};
                const offerPrice = (pageData?.orderData?.offerPrice?.amount || 0) / 100;
                const planName = pageData?.listing?.author?.attributes?.profile?.publicData?.currentPlanData?.planName || '';

                const deliveryMethodMaybe = { deliveryMethod: 'shipping' };

                fetchSpeculatedTransaction({
                  orderData: {
                    stockReservationQuantity: 1,
                    ...deliveryMethodMaybe,
                    offerPrice,
                    cartItems,
                    planName,
                    selectedRate,
                    isVerify: newIsVerify
                  },
                  listingId: pageData?.listing?.id,
                  isOwnListing: false,
                });

                return newIsVerify;
              });
            }}
          />
          <label for="quality"><FormattedMessage id="CheckoutPageWithInquiryProcess.verifyNote" /></label>

        </span>
      </div>}

    </div>
  );
};

DetailsSideCard.defaultProps = {
  speculateTransactionErrorMessage: null,
  breakdown: null,
};

DetailsSideCard.propTypes = {
  listing: propTypes.listing.isRequired,
  listingTitle: string.isRequired,
  author: propTypes.user.isRequired,
  firstImage: propTypes.image.isRequired,
  layoutListingImageConfig: object.isRequired,
  speculateTransactionErrorMessage: node,
  processName: string.isRequired,
  breakdown: node,
};

export default DetailsSideCard;
