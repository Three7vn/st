import pick from 'lodash/pick';
import {
  createStripeAccount,
  updateStripeAccount,
  fetchStripeAccount,
} from '../../ducks/stripeConnectAccount.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { cryptoPayment } from '../../util/api';
import { updateProfile } from '../ProfileSettingsPage/ProfileSettingsPage.duck';
import { transitions } from '../../transactions/transactionProcessPurchase';

// ================ Action types ================ //

export const SET_INITIAL_VALUES = 'app/StripePayoutPage/SET_INITIAL_VALUES';
export const SAVE_PAYOUT_DETAILS_REQUEST = 'app/StripePayoutPage/SAVE_PAYOUT_DETAILS_REQUEST';
export const SAVE_PAYOUT_DETAILS_SUCCESS = 'app/StripePayoutPage/SAVE_PAYOUT_DETAILS_SUCCESS';
export const SAVE_PAYOUT_DETAILS_ERROR = 'app/StripePayoutPage/SAVE_PAYOUT_DETAILS_ERROR';

export const FETCH_PENDING_PAYMENT_SUCCESS = 'app/StripePayoutPage/FETCH_PENDING_PAYMENT_SUCCESS';

// ================ Reducer ================ //

const initialState = {
  payoutDetailsSaveInProgress: false,
  payoutDetailsSaved: false,
  fromReturnURL: false,
  pendingTransactions: []
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SET_INITIAL_VALUES:
      return { ...initialState, ...payload };

    case SAVE_PAYOUT_DETAILS_REQUEST:
      return { ...state, payoutDetailsSaveInProgress: true };
    case SAVE_PAYOUT_DETAILS_ERROR:
      return { ...state, payoutDetailsSaveInProgress: false };
    case SAVE_PAYOUT_DETAILS_SUCCESS:
      return { ...state, payoutDetailsSaveInProgress: false, payoutDetailsSaved: true };
    case FETCH_PENDING_PAYMENT_SUCCESS:
      return { ...state, payoutDetailsSaveInProgress: false, pendingTransactions: payload };
    default:
      return state;
  }
}

// ================ Action creators ================ //

export const setInitialValues = initialValues => ({
  type: SET_INITIAL_VALUES,
  payload: pick(initialValues, Object.keys(initialState)),
});

export const savePayoutDetailsRequest = () => ({
  type: SAVE_PAYOUT_DETAILS_REQUEST,
});
export const savePayoutDetailsError = () => ({
  type: SAVE_PAYOUT_DETAILS_ERROR,
});
export const savePayoutDetailsSuccess = () => ({
  type: SAVE_PAYOUT_DETAILS_SUCCESS,
});

export const pendingTransactionSuccess = (response) => ({
  type: FETCH_PENDING_PAYMENT_SUCCESS,
  payload: response
});


// ================ Thunks ================ //

export const savePayoutDetails = (values, isUpdateCall) => (dispatch, getState, sdk) => {
  const upsertThunk = isUpdateCall ? updateStripeAccount : createStripeAccount;
  dispatch(savePayoutDetailsRequest());
  return dispatch(upsertThunk(values, { expand: true }))
    .then(response => {
      const params = {
        protectedData: {
          selectedMethod: ["withStripe"],
        },
      };
      dispatch(updateProfile(params));
      dispatch(savePayoutDetailsSuccess());
      return response;
    })
    .catch(() => dispatch(savePayoutDetailsError()));
};

export const fetchPendingPayments = () => async (dispatch, getState, sdk) => {
  try {
    const apiQueryParams = {
      only: 'sale',
      lastTransitions: [transitions.CONFIRM_PAYMENT],
      page: 1,
      per_page: 20,
    };
    const transactionArray = [];
    const result = await sdk.transactions.query(apiQueryParams);
    const numberOfPages = result.data.meta.totalPages;
    for (let i = 1; i <= numberOfPages; i++) {
      const response = await sdk.transactions.query({ ...apiQueryParams, page: i });
      if (response) {
        transactionArray.push(...response.data.data);
        dispatch(pendingTransactionSuccess(transactionArray));
        return transactionArray;
      }
    }
  } catch (error) {
  }
};

export const loadData = () => (dispatch, getState, sdk) => {
  // Clear state so that previously loaded data is not visible
  // in case this page load fails.
  dispatch(setInitialValues());
  // cryptoPayment({});
  return dispatch(fetchCurrentUser()).then(response => {
    const currentUser = getState().user.currentUser;
    if (currentUser && currentUser.stripeAccount) {
      dispatch(fetchStripeAccount());
      dispatch(fetchPendingPayments());
    }
    return response;
  });
};
