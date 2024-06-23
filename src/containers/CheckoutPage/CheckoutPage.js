import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';

// Import contexts and util modules
import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { userDisplayNameAsString } from '../../util/data';
import { INQUIRY_PROCESS_NAME, resolveLatestProcessName } from '../../transactions/transaction';

// Import global thunk functions
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { confirmCardPayment, retrievePaymentIntent } from '../../ducks/stripe.duck';
import { savePaymentMethod } from '../../ducks/paymentMethods.duck';

// Import shared components
import { NamedRedirect, Page } from '../../components';

// Session helpers file needs to be imported before CheckoutPageWithPayment and CheckoutPageWithInquiryProcess
import { storeData, clearData, handlePageData } from './CheckoutPageSessionHelpers';

// Import modules from this directory
import {
  initiateOrder,
  setInitialValues,
  speculateTransaction,
  stripeCustomer,
  confirmPayment,
  sendMessage,
  initiateInquiryWithoutPayment,
  cryptoWalletPayment,
  makeAnOffer,
  discountOffer,
} from './CheckoutPage.duck';

import CustomTopbar from './CustomTopbar';
import CheckoutPageWithPayment, {
  loadInitialDataForStripePayments,
} from './CheckoutPageWithPayment';
import CheckoutPageWithInquiryProcess from './CheckoutPageWithInquiryProcess';
import { fetchTransactionLineItems } from '../ListingPage/ListingPage.duck';

const STORAGE_KEY = 'CheckoutPage';

const onSubmitCallback = () => {
  clearData(STORAGE_KEY);
};

const getProcessName = pageData => {
  const { transaction, listing } = pageData || {};
  const processName = transaction?.id
    ? transaction?.attributes?.processName
    : listing?.id
      ? listing?.attributes?.publicData?.transactionProcessAlias?.split('/')[0]
      : null;
  return resolveLatestProcessName(processName);
};

const EnhancedCheckoutPage = props => {
  const [pageData, setPageData] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [authorData, setAuthorData] = useState([]);
  const [authorStripeData, setAuthorStripeData] = useState(null);
  const [shipingRates, setShippingRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [isVerify, setIsVerify] = useState(false);
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useDispatch();

  const handlePaymentWithCrypto = async ({
    buyerEmail,
    price,
    orderId,
    listingId,
    listingTitle,
  }) => {
    try {
      const data = dispatch(
        cryptoWalletPayment({ listingId, orderId, buyerEmail, price, listingTitle })
      );
      return data;
    } catch (error) { }
  };

  const handleAuthorData = data => {
    setAuthorData(data);
  };

  const handleAuthorStripeData = data => {
    setAuthorStripeData(data);
  };

  const fetchShippingRates = data => {
    setShippingRates(data);
  };
  useEffect(() => {
    const {
      orderData,
      listing,
      transaction,
      fetchSpeculatedTransaction,
      fetchStripeCustomer,
      discount,
    } = props;
    const initialData = { orderData, listing, transaction };
    const data = handlePageData(initialData, STORAGE_KEY, history);
    setPageData(data || {});
    setIsDataLoaded(true);

    // This is for processes using payments with Stripe integration
    if (getProcessName(data) !== INQUIRY_PROCESS_NAME) {
      // Fetch StripeCustomer and speculateTransition for transactions that include Stripe payments
      loadInitialDataForStripePayments({
        pageData: data || {},
        fetchSpeculatedTransaction,
        fetchStripeCustomer,
        config,
        // shippingAddress,
        handleAuthorData,
        handleAuthorStripeData,
        selectedRate,
        discountOffer,
      });
    }
  }, []);
  const {
    currentUser,
    params,
    scrollingDisabled,
    speculateTransactionInProgress,
    onInquiryWithoutPayment,
    lineItems,
    onDiscountOffer,
    discount,
  } = props;
  const processName = getProcessName(pageData);
  const isInquiryProcess = processName === INQUIRY_PROCESS_NAME;

  // Handle redirection to ListingPage, if this is own listing or if required data is not available
  const listing = pageData?.listing;
  const isOwnListing = currentUser?.id && listing?.author?.id?.uuid === currentUser?.id?.uuid;
  const hasRequiredData = !!(listing?.id && listing?.author?.id && processName);
  const shouldRedirect = isDataLoaded && !(hasRequiredData && !isOwnListing);

  // Redirect back to ListingPage if data is missing.
  // Redirection must happen before any data format error is thrown (e.g. wrong currency)
  if (shouldRedirect) {
    // eslint-disable-next-line no-console
    console.error('Missing or invalid data for checkout, redirecting back to listing page.', {
      listing,
    });
    return <NamedRedirect name="ListingPage" params={params} />;
  }

  const listingTitle = listing?.attributes?.title;
  const authorDisplayName = userDisplayNameAsString(listing?.author, '');
  const title = processName
    ? intl.formatMessage(
      { id: `CheckoutPage.${processName}.title` },
      { listingTitle, authorDisplayName }
    )
    : 'Checkout page is loading data';

  return processName && isInquiryProcess ? (
    <CheckoutPageWithInquiryProcess
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      processName={processName}
      pageData={pageData}
      listingTitle={listingTitle}
      title={title}
      onInquiryWithoutPayment={onInquiryWithoutPayment}
      onSubmitCallback={onSubmitCallback}
      {...props}
    />
  ) : processName && !isInquiryProcess && !speculateTransactionInProgress ? (
    <CheckoutPageWithPayment
      config={config}
      handlePaymentWithCrypto={handlePaymentWithCrypto}
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      processName={processName}
      sessionStorageKey={STORAGE_KEY}
      pageData={pageData}
      setPageData={setPageData}
      listingTitle={listingTitle}
      title={title}
      onSubmitCallback={onSubmitCallback}
      authorData={authorData}
      authorStripeData={authorStripeData}
      lineItems={lineItems}
      fetchShippingRates={fetchShippingRates}
      shipingRates={shipingRates}
      selectedRate={selectedRate}
      onDiscountOffer={onDiscountOffer}
      setSelectedRate={setSelectedRate}
      setIsVerify={setIsVerify}
      isVerify={isVerify}
      {...props}
    />
  ) : (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <CustomTopbar intl={intl} linkToExternalSite={config?.topbar?.logoLink} />
    </Page>
  );
};

const mapStateToProps = state => {
  const {
    listing,
    orderData,
    stripeCustomerFetched,
    speculateTransactionInProgress,
    speculateTransactionError,
    speculatedTransaction,
    transaction,
    initiateInquiryError,
    initiateOrderError,
    confirmPaymentError,
    discount,
  } = state.CheckoutPage;
  const { lineItems } = state.ListingPage;
  const { currentUser } = state.user;
  const { confirmCardPaymentError, paymentIntent, retrievePaymentIntentError } = state.stripe;
  return {
    lineItems,
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    stripeCustomerFetched,
    orderData,
    speculateTransactionInProgress,
    speculateTransactionError,
    speculatedTransaction,
    transaction,
    listing,
    initiateInquiryError,
    initiateOrderError,
    confirmCardPaymentError,
    confirmPaymentError,
    paymentIntent,
    retrievePaymentIntentError,
    discount,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatch,
  fetchSpeculatedTransaction: ({ orderData, listingId, isOwnListing }) =>
    dispatch(fetchTransactionLineItems({ orderData, listingId, isOwnListing })),
  fetchStripeCustomer: () => dispatch(stripeCustomer()),
  onInquiryWithoutPayment: (params, processAlias, transitionName) =>
    dispatch(initiateInquiryWithoutPayment(params, processAlias, transitionName)),
  onInitiateOrder: (params, processAlias, transactionId, transitionName, isPrivileged, planName) =>
    dispatch(
      initiateOrder(params, processAlias, transactionId, transitionName, isPrivileged, planName)
    ),
  onMakeAnOffer: (params, processAlias, offerPrice, transitions, planName) =>
    dispatch(makeAnOffer(params, processAlias, offerPrice, transitions, planName)),
  onDiscountOffer: params => dispatch(discountOffer(params)),
  onRetrievePaymentIntent: params => dispatch(retrievePaymentIntent(params)),
  onConfirmCardPayment: params => dispatch(confirmCardPayment(params)),
  onConfirmPayment: params => dispatch(confirmPayment(params)),
  onSendMessage: params => dispatch(sendMessage(params)),
  onSavePaymentMethod: (stripeCustomer, stripePaymentMethodId) =>
    dispatch(savePaymentMethod(stripeCustomer, stripePaymentMethodId)),
});

const CheckoutPage = compose(connect(mapStateToProps, mapDispatchToProps))(EnhancedCheckoutPage);

CheckoutPage.setInitialValues = (initialValues, saveToSessionStorage = false) => {
  if (saveToSessionStorage) {
    const { listing, orderData } = initialValues;
    storeData(orderData, listing, null, STORAGE_KEY);
  }

  return setInitialValues(initialValues);
};

CheckoutPage.displayName = 'CheckoutPage';

export default CheckoutPage;
