import pick from 'lodash/pick';
import {
  addOrUpdateDiscounts,
  addOrUpdateOrderNumber,
  cryptoPayment,
  fetchOrderNumber,
  fetchRedeemedVouchers,
  getAuthToken,
  getShippingRates,
  getUpdateUser,
  initiatePrivileged,
  onApplyDiscountCoupoun,
  transitionPrivileged,
  updateRedeemedVoucher,
  updateRedeemedVouchersHistoryPoints,
} from '../../util/api';
import { denormalisedResponseEntities } from '../../util/data';
import { storableError } from '../../util/errors';
import * as log from '../../util/log';
import { fetchCurrentUserHasOrdersSuccess, fetchCurrentUser } from '../../ducks/user.duck';

import {
  checkCountLimit,
  checkPriceLimit,
  extractSoldStats,
  filterCartItems,
  getTotalCount,
  getTotalPrice,
} from '../../util/dataExtractor';
import { transitions } from '../../transactions/transactionProcessPurchase';

// ================ Action types ================ //

export const SET_INITIAL_VALUES = 'app/CheckoutPage/SET_INITIAL_VALUES';

export const INITIATE_ORDER_REQUEST = 'app/CheckoutPage/INITIATE_ORDER_REQUEST';
export const INITIATE_ORDER_SUCCESS = 'app/CheckoutPage/INITIATE_ORDER_SUCCESS';
export const INITIATE_ORDER_ERROR = 'app/CheckoutPage/INITIATE_ORDER_ERROR';

export const CONFIRM_PAYMENT_REQUEST = 'app/CheckoutPage/CONFIRM_PAYMENT_REQUEST';
export const CONFIRM_PAYMENT_SUCCESS = 'app/CheckoutPage/CONFIRM_PAYMENT_SUCCESS';
export const CONFIRM_PAYMENT_ERROR = 'app/CheckoutPage/CONFIRM_PAYMENT_ERROR';

export const DISCOUNT_OFFER_SUCCESS = 'app/CheckoutPage/DISCOUNT_OFFER_SUCCESS';
export const REDEEMED_VOUCHER_SUCCESS = 'app/CheckoutPage/REDEEMED_VOUCHER_SUCCESS';
export const REDEEMED_SELLING_VOUCHER_SUCCESS = 'app/CheckoutPage/REDEEMED_SELLING_VOUCHER_SUCCESS';

export const SPECULATE_TRANSACTION_REQUEST = 'app/CheckoutPage/SPECULATE_TRANSACTION_REQUEST';
export const SPECULATE_TRANSACTION_SUCCESS = 'app/CheckoutPage/SPECULATE_TRANSACTION_SUCCESS';
export const SPECULATE_TRANSACTION_ERROR = 'app/CheckoutPage/SPECULATE_TRANSACTION_ERROR';

export const STRIPE_CUSTOMER_REQUEST = 'app/CheckoutPage/STRIPE_CUSTOMER_REQUEST';
export const STRIPE_CUSTOMER_SUCCESS = 'app/CheckoutPage/STRIPE_CUSTOMER_SUCCESS';
export const STRIPE_CUSTOMER_ERROR = 'app/CheckoutPage/STRIPE_CUSTOMER_ERROR';

export const INITIATE_INQUIRY_REQUEST = 'app/CheckoutPage/INITIATE_INQUIRY_REQUEST';
export const INITIATE_INQUIRY_SUCCESS = 'app/CheckoutPage/INITIATE_INQUIRY_SUCCESS';
export const INITIATE_INQUIRY_ERROR = 'app/CheckoutPage/INITIATE_INQUIRY_ERROR';

// ================ Reducer ================ //

const initialState = {
  listing: null,
  orderData: null,
  speculateTransactionInProgress: false,
  speculateTransactionError: null,
  speculatedTransaction: null,
  transaction: null,
  initiateOrderError: null,
  confirmPaymentError: null,
  stripeCustomerFetched: false,
  initiateInquiryInProgress: false,
  initiateInquiryError: null,
  discount: null,
  redeemedVoucher: [],
  redeemedSellingVoucher:[]
};

export default function checkoutPageReducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SET_INITIAL_VALUES:
      return { ...initialState, ...payload };

    case SPECULATE_TRANSACTION_REQUEST:
      return {
        ...state,
        speculateTransactionInProgress: true,
        speculateTransactionError: null,
        speculatedTransaction: null,
      };
    case SPECULATE_TRANSACTION_SUCCESS:
      return {
        ...state,
        speculateTransactionInProgress: false,
        speculatedTransaction: payload.transaction,
      };
    case SPECULATE_TRANSACTION_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return {
        ...state,
        speculateTransactionInProgress: false,
        speculateTransactionError: payload,
      };

    case INITIATE_ORDER_REQUEST:
      return { ...state, initiateOrderError: null };
    case INITIATE_ORDER_SUCCESS:
      return { ...state, transaction: payload };
    case INITIATE_ORDER_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return { ...state, initiateOrderError: payload };

    case CONFIRM_PAYMENT_REQUEST:
      return { ...state, confirmPaymentError: null };
    case CONFIRM_PAYMENT_SUCCESS:
      return state;
    case CONFIRM_PAYMENT_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return { ...state, confirmPaymentError: payload };

    case DISCOUNT_OFFER_SUCCESS:
      return { ...state, discount: payload };

    case REDEEMED_VOUCHER_SUCCESS:

      return { ...state, redeemedVoucher: payload };
    case REDEEMED_SELLING_VOUCHER_SUCCESS:
      return { ...state, redeemedSellingVoucher: payload };

    case STRIPE_CUSTOMER_REQUEST:
      return { ...state, stripeCustomerFetched: false };
    case STRIPE_CUSTOMER_SUCCESS:
      return { ...state, stripeCustomerFetched: true };
    case STRIPE_CUSTOMER_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return { ...state, stripeCustomerFetchError: payload };

    case INITIATE_INQUIRY_REQUEST:
      return { ...state, initiateInquiryInProgress: true, initiateInquiryError: null };
    case INITIATE_INQUIRY_SUCCESS:
      return { ...state, initiateInquiryInProgress: false };
    case INITIATE_INQUIRY_ERROR:
      return { ...state, initiateInquiryInProgress: false, initiateInquiryError: payload };

    default:
      return state;
  }
}

// ================ Selectors ================ //

// ================ Action creators ================ //

export const setInitialValues = initialValues => ({
  type: SET_INITIAL_VALUES,
  payload: pick(initialValues, Object.keys(initialState)),
});

const initiateOrderRequest = () => ({ type: INITIATE_ORDER_REQUEST });

const initiateOrderSuccess = order => ({
  type: INITIATE_ORDER_SUCCESS,
  payload: order,
});

const initiateOrderError = e => ({
  type: INITIATE_ORDER_ERROR,
  error: true,
  payload: e,
});

const confirmPaymentRequest = () => ({ type: CONFIRM_PAYMENT_REQUEST });

const confirmPaymentSuccess = orderId => ({
  type: CONFIRM_PAYMENT_SUCCESS,
  payload: orderId,
});

const confirmPaymentError = e => ({
  type: CONFIRM_PAYMENT_ERROR,
  error: true,
  payload: e,
});
const discountOfferSuccess = discount => ({
  type: DISCOUNT_OFFER_SUCCESS,
  payload: discount,
});

export const redeemedVoucherSuccess = discount => ({
  type: REDEEMED_VOUCHER_SUCCESS,
  payload: discount,
});
export const redeemedSellingVoucherSuccess = discount => ({
  type: REDEEMED_SELLING_VOUCHER_SUCCESS,
  payload: discount,
});

export const speculateTransactionRequest = () => ({ type: SPECULATE_TRANSACTION_REQUEST });

export const speculateTransactionSuccess = transaction => ({
  type: SPECULATE_TRANSACTION_SUCCESS,
  payload: { transaction },
});

export const speculateTransactionError = e => ({
  type: SPECULATE_TRANSACTION_ERROR,
  error: true,
  payload: e,
});

export const stripeCustomerRequest = () => ({ type: STRIPE_CUSTOMER_REQUEST });
export const stripeCustomerSuccess = () => ({ type: STRIPE_CUSTOMER_SUCCESS });
export const stripeCustomerError = e => ({
  type: STRIPE_CUSTOMER_ERROR,
  error: true,
  payload: e,
});

export const initiateInquiryRequest = () => ({ type: INITIATE_INQUIRY_REQUEST });
export const initiateInquirySuccess = () => ({ type: INITIATE_INQUIRY_SUCCESS });
export const initiateInquiryError = e => ({
  type: INITIATE_INQUIRY_ERROR,
  error: true,
  payload: e,
});

/* ================ Thunks ================ */

export const makeAnOffer = (orderParams, processAlias, offerPrice, planName) => (
  dispatch,
  getState,
  sdk
) => {
  dispatch(initiateOrderRequest());
  const { discount, redeemedVoucher } = getState()?.CheckoutPage || {};
  const { voucherValueType, voucherValue } = redeemedVoucher || {};

  const { deliveryMethod, selectedRate, isVerify, ...otherOrderParams } = orderParams;
  const listingTitle = orderParams?.protectedData?.listingTitle;
  const quantityMaybe = { stockReservationQuantity: 1 };
  // Parameters only for client app's server
  const orderData = deliveryMethod
    ? {
      deliveryMethod,
      offerPrice,
      planName,
      selectedRate,
      isVerify,
      discount: discount?.count,
      voucherValue,
      voucherValueType,
    }
    : { offerPrice, selectedRate, isVerify, discount: discount?.count, voucherValue, voucherValueType };

  // Parameters for Marketplace API
  const transitionParams = {
    ...quantityMaybe,
    ...otherOrderParams,
  };

  const bodyParams = {
    processAlias: processAlias,
    transition: transitions?.MAKE_AN_OFFER,
    params: transitionParams,
  };
  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };
  const handleSucces = response => {
    const txId = response?.data?.data?.id;
    const entities = denormalisedResponseEntities(response);
    const order = entities[0];
    // const providerId = order.provider.id.uuid;
    // const listingId = order.attributes.protectedData.listingId || [];
    // const price = order.attributes.payoutTotal.amount / 100 || 0;
    // const { listingsSoldCount, listingsSoldPrice } = order.provider?.attributes?.profile?.publicData || {};
    // const totalCount = getTotalCount(listingsSoldCount, listingId.length);
    // const totalPrice = getTotalPrice(listingsSoldPrice, price);
    // dispatch(initiateOrderSuccess(order));
    // dispatch(fetchCurrentUserHasOrdersSuccess(true));
    // if (providerId) {
    //   getUpdateUser({
    //     payload: {
    //       publicData: {
    //         listingsSoldCount: totalCount,
    //         listingsSoldPrice: parseFloat(totalPrice).toFixed(2),
    //       },
    //     },
    //     userId: providerId,
    //   });
    // }
    sdk.messages
      .send(
        {
          transactionId: txId,
          content: `You sent an offer of £${offerPrice} for ${listingTitle}`,
        },
        {
          expand: true,
        }
      )
      .then(res => {
        // res.data contains the response data
      });
    return order;
  };

  const handleError = e => {
    dispatch(initiateOrderError(storableError(e)));
    const transactionIdMaybe = {};
    log.error(e, 'initiate-order-failed', {
      ...transactionIdMaybe,
      listingId: orderParams.listingId.uuid,
      ...quantityMaybe,
      ...orderData,
    });
    throw e;
  };

  // initiate privileged
  return initiatePrivileged({ isSpeculative: false, orderData, bodyParams, queryParams })
    .then(handleSucces)
    .catch(handleError);
};

export const discountOffer = params => async (dispatch, getState, sdk) => {
  const { discountCode } = params;
  try {
    // Apply the discount coupon
    const res = await addOrUpdateDiscounts({ findDiscount: { discountCode } });

    const { cashOffOrder, percent } = res?.count;
    const discount = { percent, cashOffOrder };
    dispatch(discountOfferSuccess(res));
    return res;
  } catch (error) {
    console.error('Error applying discount coupon:', error);
    // Optionally dispatch an error action or handle the error appropriately
  }
};

export const initiateOrder = (
  orderParams,
  processAlias,
  transactionId,
  transitionName,
  isPrivilegedTransition,
  planName
) => (dispatch, getState, sdk) => {
  dispatch(initiateOrderRequest());

  // If we already have a transaction ID, we should transition, not
  // initiate.
  const isTransition = !!transactionId;
  const { discount, redeemedVoucher ,redeemedSellingVoucher} = getState()?.CheckoutPage || {};
  const { voucherValueType, voucherValue } = redeemedVoucher || {};
  const { voucherValue: sellingVoucherValue } = redeemedSellingVoucher || {};

  const {
    deliveryMethod,
    quantity = 1,
    bookingDates,
    selectedRate,
    isVerify,
    ...otherOrderParams
  } = orderParams;

  const cartItems = orderParams?.protectedData?.cartItems || {};
  const quantityMaybe = quantity ? { stockReservationQuantity: quantity } : {};
  const bookingParamsMaybe = bookingDates || {};

  // Parameters only for client app's server
  const orderData = deliveryMethod
    ? {
      deliveryMethod,
      cartItems,
      planName,
      selectedRate,
      discount: discount?.count,
      voucherValue,
      voucherValueType,
      isVerify,
      sellingVoucherValue
    }
    : {};

  // Parameters for Marketplace API
  const transitionParams = {
    ...quantityMaybe,
    ...bookingParamsMaybe,
    ...otherOrderParams,
  };

  // tarnsition is conditional

  const bodyParams = isTransition
    ? {
      id: transactionId,
      transition: transitionName,
      params: transitionParams,
    }
    : {
      processAlias,
      transition: transitionName,
      params: transitionParams,
    };
  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  const handleSucces = response => {
    const entities = denormalisedResponseEntities(response);
    const order = entities[0];
    dispatch(initiateOrderSuccess(order));
    dispatch(fetchCurrentUserHasOrdersSuccess(true));
    return order;
  };

  const handleError = e => {
    dispatch(initiateOrderError(storableError(e)));
    const transactionIdMaybe = transactionId ? { transactionId: transactionId.uuid } : {};
    log.error(e, 'initiate-order-failed', {
      ...transactionIdMaybe,
      listingId: orderParams.listingId.uuid,
      ...quantityMaybe,
      ...bookingParamsMaybe,
      ...orderData,
    });
    throw e;
  };

  if (isTransition && isPrivilegedTransition) {
    // transition privileged
    return transitionPrivileged({ isSpeculative: false, orderData, bodyParams, queryParams })
      .then(handleSucces)
      .catch(handleError);
  } else if (isTransition) {
    // transition non-privileged
    return sdk.transactions
      .transition(bodyParams, queryParams)
      .then(handleSucces)
      .catch(handleError);
  } else if (isPrivilegedTransition) {
    // initiate privileged
    return initiatePrivileged({ isSpeculative: false, orderData, bodyParams, queryParams })
      .then(handleSucces)
      .catch(handleError);
  } else {
    // initiate non-privileged
    return sdk.transactions
      .initiate(bodyParams, queryParams)
      .then(handleSucces)
      .catch(handleError);
  }
};

const updateCurrentUserProfile = async (profileData, sdk) => {
  const currentUser = sdk.currentUser;
  try {
    await currentUser.updateProfile({
      protectedData: profileData,
    });
  } catch (error) {
    console.error('Error updating current user profile:', error);
    throw error;
  }
};

export const addOrderNumber = orderNumber => async (dispatch, getState, sdk) => {
  try {
    const result = await addOrUpdateOrderNumber({ orderNumber });
  } catch (error) { }
};

export const handleRates = async params => {
  try {
    const response = await getShippingRates({ ...params });
    return response;
  } catch (error) {
    console.log(error, 'error');
  }
};

export const confirmPayment = params => async (dispatch, getState, sdk) => {
  const { transactionId, transitionName, transitionParams } = params;
  dispatch(confirmPaymentRequest());
  const response = await fetchOrderNumber();
  const { orderNumber: prevOrderNumber = 0 } = response || {};
  const orderNumber = prevOrderNumber > 0 ? prevOrderNumber + 1 : 30000;
  await addOrUpdateOrderNumber({ orderNumber });
  try {
    const { transactionId, transitionName, transitionParams, authorDetail } = params;
    const { currentUser } = getState().user;
    const { redeemedVoucher , redeemedSellingVoucher } = getState()?.CheckoutPage || {};
    const { cartItems } = currentUser.attributes.profile.protectedData;

    const bodyParams = {
      id: transactionId,
      transition: transitionName,
      params: { ...transitionParams, protectedData: { orderNumber } },
    };
    const queryParams = {
      include: ['booking', 'provider', 'provider.publicData', 'listing'],
      expand: true,
    };
    await addOrUpdateOrderNumber({ orderNumber });
    const response = await sdk.transactions.transition(bodyParams, queryParams);
    const order = response.data.data;
    const providerId = order.relationships.provider.data.id.uuid;
    const userId = getState()?.user?.currentUser?.id?.uuid || '';

    const id = order.relationships.listing.data.id.uuid;
    const listingId = order.attributes.protectedData.listingId || [];
    const price = order.attributes.payoutTotal.amount / 100 || 0;

    const { listingsSoldCount, listingsSoldPrice } = extractSoldStats(response);

    const { currentPlanData, freePlanData } = authorDetail.attributes.profile.publicData || {};
    const totalCount = getTotalCount(listingsSoldCount, listingId.length);
    const totalPrice = getTotalPrice(listingsSoldPrice, price);
    const isExceedPriceLimit = checkPriceLimit(totalPrice, freePlanData, currentPlanData);
    const isExceedCountLimit = checkCountLimit(totalCount, freePlanData, currentPlanData);
    if (providerId) {
      getUpdateUser({
        payload: {
          publicData: {
            listingsSoldCount: totalCount,
            listingsSoldPrice: parseFloat(totalPrice).toFixed(2),
          },
        },
        userId: providerId,
      });
    }

    if (userId && redeemedVoucher?._id) {
      await updateRedeemedVoucher({
        userId: userId,
        isUsed: true,
        historyId: redeemedVoucher?._id ,
      });
    }
    if (userId && redeemedSellingVoucher?._id ) {
      await updateRedeemedVoucher({
        userId: userId,
        isUsed: true,
        historyId: redeemedSellingVoucher?._id ,
      });
    }

    if (listingId) {
      const filteredCartItems = filterCartItems(cartItems, listingId);
      await updateCurrentUserProfile({ cartItems: filteredCartItems }, sdk);
    }

    dispatch(fetchCurrentUser());
    dispatch(confirmPaymentSuccess(order.id));
    return order;
  } catch (error) {
    dispatch(confirmPaymentError(storableError(error)));
    const transactionIdMaybe = params.transactionId
      ? { transactionId: params.transactionId.uuid }
      : {};
    log.error(error, 'initiate-order-failed', { ...transactionIdMaybe });
    throw error;
  }
};

export const sendMessage = params => (dispatch, getState, sdk) => {
  const message = params.message;
  const orderId = params.id;

  if (message) {
    return sdk.messages
      .send({ transactionId: orderId, content: message })
      .then(() => {
        return { orderId, messageSuccess: true };
      })
      .catch(e => {
        log.error(e, 'initial-message-send-failed', { txId: orderId });
        return { orderId, messageSuccess: false };
      });
  } else {
    return Promise.resolve({ orderId, messageSuccess: true });
  }
};

/**
 * Initiate transaction against default-inquiry process
 * Note: At this point inquiry transition is made directly against Marketplace API.
 *       So, client app's server is not involved here unlike with transitions including payments.
 *
 * @param {*} inquiryParams contains listingId and protectedData
 * @param {*} processAlias 'default-inquiry/release-1'
 * @param {*} transitionName 'transition/inquire-without-payment'
 * @returns
 */
export const initiateInquiryWithoutPayment = (inquiryParams, processAlias, transitionName) => (
  dispatch,
  getState,
  sdk
) => {
  dispatch(initiateInquiryRequest());

  if (!processAlias) {
    const error = new Error('No transaction process attached to listing');
    log.error(error, 'listing-process-missing', {
      listingId: listing?.id?.uuid,
    });
    dispatch(initiateInquiryError(storableError(error)));
    return Promise.reject(error);
  }

  const bodyParams = {
    transition: transitionName,
    processAlias,
    params: inquiryParams,
  };
  const queryParams = {
    include: ['provider'],
    expand: true,
  };

  return sdk.transactions
    .initiate(bodyParams, queryParams)
    .then(response => {
      const transactionId = response.data.data.id;
      dispatch(initiateInquirySuccess());
      return transactionId;
    })
    .catch(e => {
      dispatch(initiateInquiryError(storableError(e)));
      throw e;
    });
};

/**
 * Initiate or transition the speculative transaction with the given
 * booking details
 *
 * The API allows us to do speculative transaction initiation and
 * transitions. This way we can create a test transaction and get the
 * actual pricing information as if the transaction had been started,
 * without affecting the actual data.
 *
 * We store this speculative transaction in the page store and use the
 * pricing info for the booking breakdown to get a proper estimate for
 * the price with the chosen information.
 */
export const speculateTransaction = (
  orderParams,
  processAlias,
  transactionId,
  transitionName,
  isPrivilegedTransition
) => (dispatch, getState, sdk) => {
  dispatch(speculateTransactionRequest());
  // If we already have a transaction ID, we should transition, not
  // initiate.
  const isTransition = !!transactionId;

  const { deliveryMethod, quantity, bookingDates, ...otherOrderParams } = orderParams;
  const quantityMaybe = quantity ? { stockReservationQuantity: quantity } : {};
  const bookingParamsMaybe = bookingDates || {};

  // Parameters only for client app's server
  const orderData = deliveryMethod ? { deliveryMethod } : {};

  // Parameters for Marketplace API
  const transitionParams = {
    ...quantityMaybe,
    ...bookingParamsMaybe,
    ...otherOrderParams,
    cardToken: 'CheckoutPage_speculative_card_token',
  };

  const bodyParams = isTransition
    ? {
      id: transactionId,
      transition: transitionName,
      params: transitionParams,
    }
    : {
      processAlias,
      transition: transitionName,
      params: transitionParams,
    };

  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  const handleSuccess = response => {
    const entities = denormalisedResponseEntities(response);
    if (entities.length !== 1) {
      throw new Error('Expected a resource in the speculate response');
    }
    const tx = entities[0];
    dispatch(speculateTransactionSuccess(tx));
  };

  const handleError = e => {
    log.error(e, 'speculate-transaction-failed', {
      listingId: transitionParams.listingId.uuid,
      ...quantityMaybe,
      ...bookingParamsMaybe,
      ...orderData,
    });
    return dispatch(speculateTransactionError(storableError(e)));
  };

  if (isTransition && isPrivilegedTransition) {
    // transition privileged
    return transitionPrivileged({ isSpeculative: true, orderData, bodyParams, queryParams })
      .then(handleSuccess)
      .catch(handleError);
  } else if (isTransition) {
    // transition non-privileged
    return sdk.transactions
      .transitionSpeculative(bodyParams, queryParams)
      .then(handleSuccess)
      .catch(handleError);
  } else if (isPrivilegedTransition) {
    // initiate privileged
    return initiatePrivileged({ isSpeculative: true, orderData, bodyParams, queryParams })
      .then(handleSuccess)
      .catch(handleError);
  } else {
    // initiate non-privileged
    return sdk.transactions
      .initiateSpeculative(bodyParams, queryParams)
      .then(handleSuccess)
      .catch(handleError);
  }
};

export const cryptoWalletPayment = params => async () => {
  const { listingId, buyerEmail, price, listingTitle, orderId } = params;
  try {
    const result = await getAuthToken({});
    if (result) {
      const data = await cryptoPayment({
        token: result.access_token,
        listingId,
        buyerEmail,
        price,
        listingTitle,
        orderId,
      });
      if (data) {
        return data;
      }
    }
    return result;
  } catch (error) { }
};

export const cryptoWalletInitateOrder = params => (dispatch, getState, sdk) => {
  const { listingId, values } = params;
  dispatch(initiateOrderRequest());

  const quantityMaybe = { stockReservationQuantity: 1 };
  const bookingParamsMaybe = {};

  // Parameters only for client app's server
  const orderData = { deliveryMethod: 'shipping' };

  // Parameters for Marketplace API
  const transitionParams = {
    listingId,
    ...quantityMaybe,
    ...bookingParamsMaybe,
    protectedData: {
      shippingAddress: { ...values },
    },
  };

  const bodyParams = {
    processAlias: 'crypto-purchase/release-1',
    transition: 'transition/request-payment',
    params: transitionParams,
  };
  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  const handleSucces = response => {
    const entities = denormalisedResponseEntities(response);
    const order = entities[0];
    dispatch(initiateOrderSuccess(order));
    dispatch(fetchCurrentUserHasOrdersSuccess(true));
    return order;
  };

  const handleError = e => {
    dispatch(initiateOrderError(storableError(e)));
    const transactionIdMaybe = transactionId ? { transactionId: transactionId.uuid } : {};
    log.error(e, 'initiate-order-failed', {
      ...transactionIdMaybe,
      listingId: orderParams.listingId.uuid,
      ...quantityMaybe,
      ...bookingParamsMaybe,
      ...orderData,
    });
    throw e;
  };
  // initiate privileged
  return initiatePrivileged({ isSpeculative: false, orderData, bodyParams, queryParams })
    .then(handleSucces)
    .catch(handleError);
};

// StripeCustomer is a relantionship to currentUser
// We need to fetch currentUser with correct params to include relationship
export const stripeCustomer = () => (dispatch, getState, sdk) => {
  dispatch(stripeCustomerRequest());

  return dispatch(fetchCurrentUser({ include: ['stripeCustomer.defaultPaymentMethod'] }))
    .then(response => {
      dispatch(stripeCustomerSuccess());
    })
    .catch(e => {
      dispatch(stripeCustomerError(storableError(e)));
    });
};
