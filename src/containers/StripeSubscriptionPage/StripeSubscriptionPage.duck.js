//Action types

import { isScrollingDisabled } from '../../ducks/ui.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import {
  createStripeSubscription,
  deleteUserAccount,
  getStripeSubscriptionStatus,
  getSubscriptionPrice,
  // getSubscriptionsFromStripe,
} from '../../util/api';
import { storableError } from '../../util/errors';

export const FETCH_SUBSCRIPTION_PRICE_REQUEST = 'app/FirmPage/FETCH_SUBSCRIPTION_PRICE_REQUEST';
export const FETCH_SUBSCRIPTION_PRICE_SUCCESS = 'app/FirmPage/FETCH_SUBSCRIPTION_PRICE_SUCCESS';
export const FETCH_SUBSCRIPTION_PRICE_ERROR = 'app/FirmPage/FETCH_SUBSCRIPTION_PRICE_ERROR';
export const FETCH_SUBSCRIPTIONS_REQUEST = 'app/FirmPage/FETCH_SUBSCRIPTIONS_REQUEST';
export const FETCH_SUBSCRIPTIONS_SUCCESS = 'app/FirmPage/FETCH_SUBSCRIPTIONS_SUCCESS';
export const FETCH_SUBSCRIPTIONS_ERROR = 'app/FirmPage/FETCH_SUBSCRIPTIONS_ERROR';

//InitialState
const initialState = {
  subscriptionPlan: null,
  fetchPriceInProgress: false,
  fetchPriceError: null,
  userSubscriptions: [],
  fetchSubscriptionInProgress: false,
  fetchSubscriptionError: null,
};

//Selectors

export const checkScrollingDisabled = state => isScrollingDisabled(state);

//reducer function
export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case FETCH_SUBSCRIPTION_PRICE_REQUEST:
      return { ...state, fetchPriceInProgress: true, fetchPriceError: null };
    case FETCH_SUBSCRIPTION_PRICE_SUCCESS:
      return {
        ...state,
        subscriptionPlan: payload,
        fetchPriceInProgress: false,
        fetchPriceError: null,
      };
    case FETCH_SUBSCRIPTION_PRICE_ERROR:
      return { ...state, fetchPriceInProgress: false, fetchPriceError: payload };
    case FETCH_SUBSCRIPTIONS_REQUEST:
      return { ...state, fetchSubscriptionInProgress: true, fetchSubscriptionError: null };
    case FETCH_SUBSCRIPTIONS_SUCCESS:
      return {
        ...state,
        userSubscriptions: payload,
        fetchSubscriptionInProgress: false,
        fetchSubscriptionError: null,
      };
    case FETCH_SUBSCRIPTIONS_ERROR:
      return { ...state, fetchSubscriptionInProgress: false, fetchSubscriptionError: payload };

    default:
      return state;
  }
}

// ================ Action creators ================ //

export const fetchPriceRequest = () => ({
  type: FETCH_SUBSCRIPTION_PRICE_REQUEST,
});
export const fetchPriceSuccess = data => ({
  type: FETCH_SUBSCRIPTION_PRICE_SUCCESS,
  payload: data,
});

export const fetchPriceError = e => ({
  type: FETCH_SUBSCRIPTION_PRICE_ERROR,
  error: true,
  payload: e,
});

export const fetchSubscriptionsRequest = () => ({
  type: FETCH_SUBSCRIPTIONS_REQUEST,
});
export const fetchSubscriptionsSuccess = data => ({
  type: FETCH_SUBSCRIPTIONS_SUCCESS,
  payload: data,
});

export const fetchSubscriptionsError = e => ({
  type: FETCH_SUBSCRIPTION_PRICE_ERROR,
  error: true,
  payload: e,
});

// ================ Thunk ================ //

export const fetchPriceFromStripe = () => async (dispatch, getState, sdk) => {
  dispatch(fetchPriceRequest());
  try {
    const response = await getSubscriptionPrice();
    dispatch(fetchPriceSuccess(response));
  } catch (error) {
    dispatch(fetchPriceError(storableError(error)));
  }
};

//Create subscription with Stripe

export const createSubscription = params => async (dispatch, sdk, getState) => {
  try {
    const subscription = await createStripeSubscription(params);
    return subscription;
  } catch (error) {
    console.error(error, 'error');
  }
};

//Delete user account

export const deleteAccount = params => async (dispatch, getState, sdk) => {
  try {
    const result = await deleteUserAccount(params);
    return result;
  } catch (error) {
    console.error(error, 'error');
  }
};

// Get subscriptions

export const getSubscriptions = () => async (dispatch, sdk, getState) => {
  dispatch(fetchSubscriptionsRequest());
  try {
    const subscriptions = await getStripeSubscriptionStatus({});
    // dispatch(fetchSubscriptionsSuccess(subscriptions?.data));
    return subscriptions;
  } catch (error) {
    dispatch(fetchSubscriptionsError(storableError(error)));
    console.error(error, 'error');
  }
};

//LoadData
export const loadData = params => async (dispatch, getState, sdk) => {
  await dispatch(fetchCurrentUser());

  try {
    const currentUser = getState().user?.currentUser;

    return Promise.all([
      dispatch(fetchCurrentUser()),
      dispatch(fetchPriceFromStripe()),
      // dispatch(getSubscriptions()),
    ]);
  } catch (e) {
    console.log(e);
    dispatch(showListingError(e));
  }
};
