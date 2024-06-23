import React, { useState } from 'react';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import {
  array,
  arrayOf,
  bool,
  func,
  node,
  number,
  object,
  oneOfType,
  shape,
  string,
} from 'prop-types';
import loadable from '@loadable/component';
import classNames from 'classnames';
import omit from 'lodash/omit';

import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import {
  displayDeliveryPickup,
  displayDeliveryShipping,
  displayPrice,
} from '../../util/configHelpers';
import {
  propTypes,
  LISTING_STATE_CLOSED,
  LINE_ITEM_NIGHT,
  LINE_ITEM_DAY,
  LINE_ITEM_ITEM,
  LINE_ITEM_HOUR,
  STOCK_MULTIPLE_ITEMS,
  STOCK_INFINITE_MULTIPLE_ITEMS,
  USER_TYPE_BUSINESS,
} from '../../util/types';
import { formatMoney } from '../../util/currency';
import { parse, stringify } from '../../util/urlHelpers';
import { userDisplayNameAsString } from '../../util/data';
import {
  INQUIRY_PROCESS_NAME,
  getSupportedProcessesInfo,
  isBookingProcess,
  isPurchaseProcess,
  resolveLatestProcessName,
} from '../../transactions/transaction';

import Bitcoin from '../../assets/Bitcoin.png';

import {
  ModalInMobile,
  PrimaryButton,
  AvatarSmall,
  H1,
  H2,
  Reviews,
  Modal,
  Button,
} from '../../components';
import StarRatings from 'react-star-ratings';
import css from './OrderPanel.module.css';
import IconCollection from '../IconCollection/IconCollection';
import { checkCountLimit, checkPriceLimit, getLabel } from '../../util/dataExtractor';
import { listingConditions, listingSubCategories } from '../../config/configListing';
import { types as sdkTypes } from '../../util/sdkLoader';

import aa from 'search-insights';
import { reportUserEmailToAdmin } from '../../util/api';

const BookingTimeForm = loadable(() =>
  import(/* webpackChunkName: "BookingTimeForm" */ './BookingTimeForm/BookingTimeForm')
);
const BookingDatesForm = loadable(() =>
  import(/* webpackChunkName: "BookingDatesForm" */ './BookingDatesForm/BookingDatesForm')
);
const InquiryWithoutPaymentForm = loadable(() =>
  import(
    /* webpackChunkName: "InquiryWithoutPaymentForm" */ './InquiryWithoutPaymentForm/InquiryWithoutPaymentForm'
  )
);
const ProductOrderForm = loadable(() =>
  import(/* webpackChunkName: "ProductOrderForm" */ './ProductOrderForm/ProductOrderForm')
);

// This defines when ModalInMobile shows content as Modal
const MODAL_BREAKPOINT = 1023;
const TODAY = new Date();

const { UUID, Money } = sdkTypes;

aa('init', {
  appId: process.env.REACT_APP_ALGOLIA_APP_ID,
  apiKey: process.env.REACT_APP_ALGOLIA_API_KEY,
});

const priceData = (price, currency, intl) => {
  if (price && price.currency === currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: `(${price.currency})`,
      priceTitle: `Unsupported currency (${price.currency})`,
    };
  }
  return {};
};

const openOrderModal = (isOwnListing, isClosed, history, location) => {
  if (isOwnListing || isClosed) {
    window.scrollTo(0, 0);
  } else {
    const { pathname, search, state } = location;
    const searchString = `?${stringify({ ...parse(search), orderOpen: true })}`;
    history.push(`${pathname}${searchString}`, state);
  }
};

const closeOrderModal = (history, location) => {
  const { pathname, search, state } = location;
  const searchParams = omit(parse(search), 'orderOpen');
  const searchString = `?${stringify(searchParams)}`;
  history.push(`${pathname}${searchString}`, state);
};

const handleSubmit = (
  isOwnListing,
  isClosed,
  isInquiryWithoutPayment,
  onSubmit,
  history,
  location
) => {
  // TODO: currently, inquiry-process does not have any form to ask more order data.
  // We can submit without opening any inquiry/order modal.
  return isInquiryWithoutPayment
    ? () => onSubmit({})
    : () => openOrderModal(isOwnListing, isClosed, history, location);
};

const dateFormattingOptions = { month: 'short', day: 'numeric', weekday: 'short' };

const PriceMaybe = props => {
  const {
    price: formatPrice = {},
    publicData,
    validListingTypes,
    intl,
    marketplaceCurrency,
    showCurrencyMismatch = false,
  } = props;

  const { amount, currency } = formatPrice || null;
  const price = new Money(amount, currency);
  const { listingType, unitType } = publicData || {};

  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);
  if (!showPrice || !price) {
    return null;
  }

  // Get formatted price or currency code if the currency does not match with marketplace currency
  const { formattedPrice, priceTitle } = priceData(price, marketplaceCurrency, intl);
  // TODO: In CTA, we don't have space to show proper error message for a mismatch of marketplace currency
  //       Instead, we show the currency code in place of the price
  return showCurrencyMismatch ? (
    <div className={css.priceContainerInCTA}>
      <div className={css.priceValue} title={priceTitle}>
        {formattedPrice}
      </div>
      <div className={css.perUnitInCTA}>
        <FormattedMessage id="OrderPanel.perUnit" values={{ unitType }} />
      </div>
    </div>
  ) : (
    <div className={css.priceContainer}>
      <p className={css.price}>{formatMoney(intl, price)}</p>
      <div className={css.perUnit}>
        <FormattedMessage id="OrderPanel.perUnit" values={{ unitType }} />
      </div>
    </div>
  );
};

const calculateAverage = reviews => {
  if (reviews?.length === 0) {
    return 0;
  }
  const sum =
    reviews &&
    reviews?.reduce((accumulator, currentValue) => accumulator + currentValue.attributes.rating, 0);
  const average = sum / reviews?.length;
  return average;
};

const OrderPanel = props => {
  const {
    rootClassName,
    className,
    titleClassName,
    listing,
    validListingTypes,
    lineItemUnitType: lineItemUnitTypeMaybe,
    isOwnListing,
    onSubmit,
    title,
    titleDesktop,
    author,
    authorLink,
    onManageDisableScrolling,
    onFetchTimeSlots,
    monthlyTimeSlots,
    history,
    location,
    intl,
    onFetchTransactionLineItems,
    onContactUser,
    lineItems,
    marketplaceCurrency,
    dayCountAvailableForBooking,
    marketplaceName,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    payoutDetailsWarning,
    handleAuthorModal,
    reviews,
    handleCartItems,
    index,
    handleMakeAnOfferModal,
    authorListings,
    currentUser,
  } = props;
  const queryId = typeof window !== 'undefined' && window.localStorage.getItem('queryId');

  const handleAddToCart = () => {
    const { listing } = props;
    const { price } = listing;

    try {
      if (queryId) {
        aa('convertedObjectIDsAfterSearch', {
          userToken: currentUser?.id?.uuid, // Replace with dynamic user token if needed
          eventName: 'Product Added to Cart after Search',
          index: 'Stoado-DEV', // Replace with the actual index name
          objectIDs: [listing?.id?.uuid],
          queryId: queryId,
        });

        // Clear queryId from localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('queryId');
        }
      } else {
        aa('convertedObjectIDs', {
          userToken: currentUser?.id?.uuid, // Replace with dynamic user token if needed
          eventName: 'Product Added to Cart',
          index: 'Stoado-DEV', // Replace with the actual index name
          objectIDs: [listing?.id?.uuid],
        });
      }

      // Add to cart logic here
      // For example:
      // handleCartItems();
    } catch (error) {
      console.error('Error triggering analytics event:', error);
    }

    // Add to cart logic here
    // For example:
    // handleCartItems();
  };

  const publicData = listing?.attributes?.publicData || {};
  const {
    listingType,
    unitType,
    transactionProcessAlias = '',
    subCategory,
    condition,
    receiveOffers,
  } = publicData || {};
  const processName = resolveLatestProcessName(transactionProcessAlias.split('/')[0]);
  const lineItemUnitType = lineItemUnitTypeMaybe || `line-item/${unitType}`;

  const price = listing?.attributes?.price;
  const isPaymentProcess = processName !== INQUIRY_PROCESS_NAME;

  const showPriceMissing = isPaymentProcess && !price;
  const PriceMissing = () => {
    return (
      <p className={css.error}>
        <FormattedMessage id="OrderPanel.listingPriceMissing" />
      </p>
    );
  };
  const showInvalidCurrency = isPaymentProcess && price?.currency !== marketplaceCurrency;
  const InvalidCurrency = () => {
    return (
      <p className={css.error}>
        <FormattedMessage id="OrderPanel.listingCurrencyInvalid" />
      </p>
    );
  };

  const timeZone = listing?.attributes?.availabilityPlan?.timezone;
  const isClosed = listing?.attributes?.state === LISTING_STATE_CLOSED;

  const isBooking = isBookingProcess(processName);
  const shouldHaveBookingTime = isBooking && [LINE_ITEM_HOUR].includes(lineItemUnitType);
  const showBookingTimeForm = shouldHaveBookingTime && !isClosed && timeZone;

  const shouldHaveBookingDates =
    isBooking && [LINE_ITEM_DAY, LINE_ITEM_NIGHT].includes(lineItemUnitType);
  const showBookingDatesForm = shouldHaveBookingDates && !isClosed && timeZone;

  // The listing resource has a relationship: `currentStock`,
  // which you should include when making API calls.
  const isPurchase = isPurchaseProcess(processName);
  const currentStock = listing.currentStock?.attributes?.quantity;
  const isOutOfStock = isPurchase && lineItemUnitType === LINE_ITEM_ITEM && currentStock === 0;

  // Show form only when stock is fully loaded. This avoids "Out of stock" UI by
  // default before all data has been downloaded.
  const showProductOrderForm = isPurchase && typeof currentStock === 'number';

  const showInquiryForm = processName === INQUIRY_PROCESS_NAME;

  const supportedProcessesInfo = getSupportedProcessesInfo();
  const isKnownProcess = supportedProcessesInfo.map(info => info.name).includes(processName);

  const { pickupEnabled, shippingEnabled } = listing?.attributes?.publicData || {};

  const listingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const displayShipping = displayDeliveryShipping(listingTypeConfig);
  const displayPickup = displayDeliveryPickup(listingTypeConfig);
  const allowOrdersOfMultipleItems = [STOCK_MULTIPLE_ITEMS, STOCK_INFINITE_MULTIPLE_ITEMS].includes(
    listingTypeConfig?.stockType
  );

  const showClosedListingHelpText = listing.id && isClosed;
  const isOrderOpen = !!parse(location.search).orderOpen;

  const subTitleText = showClosedListingHelpText
    ? intl.formatMessage({ id: 'OrderPanel.subTitleClosedListing' })
    : null;

  const authorDisplayName = userDisplayNameAsString(author, '');
  const {
    userName,
    userType,
    listingsSoldPrice,
    listingsSoldCount,
    currentPlanData,
    freePlanData,
    businessListingUnavailable,
  } = (!!author?.id && author.attributes.profile.publicData) || {};

  const isExceedPriceLimit = checkPriceLimit(listingsSoldPrice, freePlanData, currentPlanData);
  const isExceedCountLimit = checkCountLimit(listingsSoldCount, freePlanData, currentPlanData);

  const classes = classNames(rootClassName || css.root, className);
  const titleClasses = classNames(titleClassName || css.orderTitle);

  const hasStock = currentStock && currentStock > 0;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDescriptionChange = event => {
    setDescription(event.target.value);
  };

  const onHandleSubmit = event => {
    if (event) {
      reportUserEmailToAdmin({
        reporterUserId: currentUser?.id?.uuid,
        sellerUserId: listing?.author?.id?.uuid,
        listingId: listing?.id?.uuid,
        textBox: description,
        reporterUserName: currentUser?.attributes?.profile?.publicData?.userName,
        reportedUserName: listing?.author?.attributes?.profile?.publicData?.userName,
      });
    }
  };

  return (
    <div className={classes}>
      {/* <div className={css.sideBarButtonGroup}>
        <span className={css.reportUser}>
          <FormattedMessage id="OrderPanel.reportUser" />
        </span>{' '}
        <span
          onClick={() => {
            handleAuthorModal();
          }}
          className={css.messageSeller}
        >
          <IconCollection icon="messageIcon" />
          <FormattedMessage id="OrderPanel.messageSeller" />
        </span>{' '}
        <span className={css.productShare}>
          <IconCollection icon="shareIcon" />
          <FormattedMessage id="OrderPanel.share" />
        </span>{' '}
      </div> */}
      <div className={css.sideBarButtonGroup}>
        <div>
          <span className={css.reportUser} onClick={openModal}>
            <FormattedMessage id="OrderPanel.reportUser" />
          </span>
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            onManageDisableScrolling={onManageDisableScrolling}
            contentLabel="Report User"
            className={css.reportUserModal}
          >
            <h2 className={css.reportUserTitle}>Report This User</h2>
            <form onSubmit={onHandleSubmit}>
              <label className={css.label}>Your reason for reporting:</label>
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Enter your description"
                required
              />
              <div className={css.reportText}>
                We take reporting seriously and will review the situation ASAP.
              </div>
              <div>
                <Button type="submit" className={css.ReportSubmitbutton}>
                  Report User
                </Button>
              </div>
            </form>
          </Modal>
        </div>{' '}
        <span
          onClick={() => {
            if (!isOwnListing) {
              handleAuthorModal();
            }
          }}
          className={css.messageSeller}
        >
          <IconCollection icon="messageIcon" />
          <FormattedMessage id="OrderPanel.messageSeller" />
        </span>{' '}
        <span className={css.productShare}>
          <IconCollection icon="shareIcon" />
          <FormattedMessage id="OrderPanel.share" />
        </span>{' '}
      </div>
      <ModalInMobile
        containerClassName={css.modalContainer}
        id="OrderFormInModal"
        isModalOpenOnMobile={isOrderOpen}
        onClose={() => closeOrderModal(history, location)}
        showAsModalMaxWidth={MODAL_BREAKPOINT}
        onManageDisableScrolling={onManageDisableScrolling}
        usePortal
      >
        <div className={css.modalHeading}>
          <H1 className={css.heading}>{title}</H1>
        </div>
        <div className={css.orderHeading}>
          {titleDesktop ? titleDesktop : <H2 className={titleClasses}>{title}</H2>}
          {subTitleText ? <div className={css.orderHelp}>{subTitleText}</div> : null}
        </div>
        <div className={css.priceAndQuantity}>
          <PriceMaybe
            price={price}
            publicData={publicData}
            validListingTypes={validListingTypes}
            intl={intl}
            marketplaceCurrency={marketplaceCurrency}
          />

          <span>| </span>
          <FormattedMessage id="OrderPanel.quantity" values={{ currentStock }} />
        </div>
        <div className={css.siderCategoryGroup}>
          <span
            onClick={() => {
              history.push(`/s?refinementList=${subCategory}`);
            }}
          >
            {getLabel(listingSubCategories, subCategory)}
          </span>{' '}
          <span>{getLabel(listingConditions, condition)}</span>{' '}
        </div>
        <div className={css.author}>
          <div className={css.providerAvatarWrapper}>
            <AvatarSmall user={author} className={css.providerAvatar} />
            {userType === USER_TYPE_BUSINESS && (
              <span className={css.badge}>
                <IconCollection icon="badgeIcon" />
              </span>
            )}
          </div>
          <div>
            <div>
              <span className={css.providerNameLinked}>
                <FormattedMessage
                  id="OrderPanel.author"
                  values={{ name: userName || authorLink }}
                />
              </span>
              <span className={css.providerNamePlain}>
                <FormattedMessage
                  id="OrderPanel.author"
                  values={{ name: userName || authorDisplayName }}
                />
              </span>
            </div>
            <div className={css.reviewRattingContainer}>
              <StarRatings
                svgIconViewBox="0 0 40 37"
                svgIconPath="M20 0L26.113 11.5862L39.0211 13.8197L29.891 23.2138L31.7557 36.1803L20 30.4L8.2443 36.1803L10.109 23.2138L0.97887 13.8197L13.887 11.5862L20 0Z"
                starRatedColor="#ffb802"
                rating={reviews?.length ? calculateAverage(reviews) : 0}
                starDimension="16px"
                starSpacing="2px"
              />

              <span className={css.reviewsListingContainer}>
                <FormattedMessage
                  id="OrderPanel.reviews"
                  values={{ reviews: reviews?.length, listing: authorListings }}
                />
              </span>
            </div>
          </div>
        </div>
        {showPriceMissing ? (
          <PriceMissing />
        ) : showInvalidCurrency ? (
          <InvalidCurrency />
        ) : showBookingTimeForm ? (
          <BookingTimeForm
            className={css.bookingForm}
            formId="OrderPanelBookingTimeForm"
            lineItemUnitType={lineItemUnitType}
            onSubmit={onSubmit}
            price={price}
            marketplaceCurrency={marketplaceCurrency}
            dayCountAvailableForBooking={dayCountAvailableForBooking}
            listingId={listing.id}
            isOwnListing={isOwnListing}
            monthlyTimeSlots={monthlyTimeSlots}
            onFetchTimeSlots={onFetchTimeSlots}
            startDatePlaceholder={intl.formatDate(TODAY, dateFormattingOptions)}
            endDatePlaceholder={intl.formatDate(TODAY, dateFormattingOptions)}
            timeZone={timeZone}
            marketplaceName={marketplaceName}
            onFetchTransactionLineItems={onFetchTransactionLineItems}
            lineItems={lineItems}
            fetchLineItemsInProgress={fetchLineItemsInProgress}
            fetchLineItemsError={fetchLineItemsError}
            payoutDetailsWarning={payoutDetailsWarning}
          />
        ) : showBookingDatesForm ? (
          <BookingDatesForm
            className={css.bookingForm}
            formId="OrderPanelBookingDatesForm"
            lineItemUnitType={lineItemUnitType}
            onSubmit={onSubmit}
            price={price}
            marketplaceCurrency={marketplaceCurrency}
            dayCountAvailableForBooking={dayCountAvailableForBooking}
            listingId={listing.id}
            isOwnListing={isOwnListing}
            monthlyTimeSlots={monthlyTimeSlots}
            onFetchTimeSlots={onFetchTimeSlots}
            timeZone={timeZone}
            marketplaceName={marketplaceName}
            onFetchTransactionLineItems={onFetchTransactionLineItems}
            lineItems={lineItems}
            fetchLineItemsInProgress={fetchLineItemsInProgress}
            fetchLineItemsError={fetchLineItemsError}
            payoutDetailsWarning={payoutDetailsWarning}
          />
        ) : showProductOrderForm ? (
          <ProductOrderForm
            formId="OrderPanelProductOrderForm"
            onSubmit={onSubmit}
            price={price}
            marketplaceCurrency={marketplaceCurrency}
            currentStock={currentStock}
            allowOrdersOfMultipleItems={allowOrdersOfMultipleItems}
            pickupEnabled={pickupEnabled && displayPickup}
            shippingEnabled={shippingEnabled && displayShipping}
            displayDeliveryMethod={displayPickup || displayShipping}
            listingId={listing.id}
            isOwnListing={isOwnListing}
            marketplaceName={marketplaceName}
            onFetchTransactionLineItems={onFetchTransactionLineItems}
            onContactUser={onContactUser}
            lineItems={lineItems}
            fetchLineItemsInProgress={fetchLineItemsInProgress}
            fetchLineItemsError={fetchLineItemsError}
            payoutDetailsWarning={payoutDetailsWarning}
            listing={listing}
          />
        ) : showInquiryForm ? (
          <InquiryWithoutPaymentForm formId="OrderPanelInquiryForm" onSubmit={onSubmit} />
        ) : !isKnownProcess ? (
          <p className={css.errorSidebar}>
            <FormattedMessage id="OrderPanel.unknownTransactionProcess" />
          </p>
        ) : null}
        {isExceedPriceLimit ||
        isExceedCountLimit ||
        (!currentPlanData?.isActive && !freePlanData?.isFreePlanActive) ||
        businessListingUnavailable ? null : (
          <div className={css.sideBarCardButtonGroup}>
            {/* Add to Cart Button */}
            {hasStock && !isOwnListing ? (
              <span
                onClick={() => {
                  handleCartItems();
                  handleAddToCart();
                }}
                className={classNames(index > -1 ? css.smallFont : null, css.addToCartButton)}
              >
                {index > -1 ? (
                  <FormattedMessage id="OrderPanel.removeToCart" />
                ) : (
                  <FormattedMessage id="OrderPanel.addToCart" />
                )}
              </span>
            ) : (
              <span className={css.addToCartButtonDisable}>
                {index > -1 ? (
                  <FormattedMessage id="OrderPanel.removeToCart" />
                ) : (
                  <FormattedMessage id="OrderPanel.addToCart" />
                )}
              </span>
            )}

            {/* Make an Offer Button */}
            {receiveOffers === 'yes' && hasStock && !isOwnListing ? (
              <span
                onClick={handleMakeAnOfferModal}
                className={classNames(index > -1 ? css.smallFont : null, css.makeAnOfferButton)}
              >
                <FormattedMessage id="OrderPanel.makeAnOffer" />
              </span>
            ) : (
              <span className={css.makeAnOfferButtonDisable}>
                <FormattedMessage id="OrderPanel.makeAnOffer" />
              </span>
            )}
          </div>
        )}
        <div className={css.logos}>
          <IconCollection icon="ICON_VISA" />
          <IconCollection icon="ICON_MASTERCARD" />
          <IconCollection icon="ICON_AMEX" />
          <img src={Bitcoin} alt="Bitcoin" />
        </div>
      </ModalInMobile>
      <div className={css.openOrderForm}>
        <PriceMaybe
          price={price}
          publicData={publicData}
          validListingTypes={validListingTypes}
          intl={intl}
          marketplaceCurrency={marketplaceCurrency}
          showCurrencyMismatch
        />

        {isClosed ? (
          <div className={css.closedListingButton}>
            <FormattedMessage id="OrderPanel.closedListingButtonText" />
          </div>
        ) : (
          <PrimaryButton
            onClick={handleSubmit(
              isOwnListing,
              isClosed,
              showInquiryForm,
              onSubmit,
              history,
              location
            )}
            disabled={isOutOfStock}
            className={css.primaryBtn}
          >
            {isBooking ? (
              <FormattedMessage id="OrderPanel.ctaButtonMessageBooking" />
            ) : isOutOfStock ? (
              <FormattedMessage id="OrderPanel.ctaButtonMessageNoStock" />
            ) : isPurchase ? (
              <FormattedMessage id="OrderPanel.ctaButtonMessagePurchase" />
            ) : (
              <FormattedMessage id="OrderPanel.ctaButtonMessageInquiry" />
            )}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

OrderPanel.defaultProps = {
  rootClassName: null,
  className: null,
  titleClassName: null,
  isOwnListing: false,
  authorLink: null,
  payoutDetailsWarning: null,
  titleDesktop: null,
  subTitle: null,
  monthlyTimeSlots: null,
  lineItems: null,
  fetchLineItemsError: null,
};

OrderPanel.propTypes = {
  rootClassName: string,
  className: string,
  titleClassName: string,
  listing: oneOfType([propTypes.listing, propTypes.ownListing]),
  validListingTypes: arrayOf(
    shape({
      listingType: string.isRequired,
      transactionType: shape({
        process: string.isRequired,
        alias: string.isRequired,
        unitType: string.isRequired,
      }).isRequired,
    })
  ).isRequired,
  isOwnListing: bool,
  author: oneOfType([propTypes.user, propTypes.currentUser]).isRequired,
  authorLink: node,
  payoutDetailsWarning: node,
  onSubmit: func.isRequired,
  title: oneOfType([node, string]).isRequired,
  titleDesktop: node,
  subTitle: oneOfType([node, string]),
  onManageDisableScrolling: func.isRequired,

  onFetchTimeSlots: func.isRequired,
  monthlyTimeSlots: object,
  onFetchTransactionLineItems: func.isRequired,
  onContactUser: func,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,
  marketplaceCurrency: string.isRequired,
  dayCountAvailableForBooking: number.isRequired,
  marketplaceName: string.isRequired,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

export default compose(withRouter, injectIntl)(OrderPanel);
