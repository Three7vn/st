// These helpers are calling this template's own server-side routes
// so, they are not directly calling Marketplace API or Integration API.
// You can find these api endpoints from 'server/api/...' directory

import appSettings from '../config/settings';
import { types as sdkTypes, transit } from './sdkLoader';
import Decimal from 'decimal.js';

export const apiBaseUrl = marketplaceRootURL => {
  const port = process.env.REACT_APP_DEV_API_SERVER_PORT;
  const useDevApiServer = process.env.NODE_ENV === 'development' && !!port;

  // In development, the dev API server is running in a different port
  if (useDevApiServer) {
    return `http://localhost:${port}`;
  }

  // Otherwise, use the given marketplaceRootURL parameter or the same domain and port as the frontend
  return marketplaceRootURL ? marketplaceRootURL.replace(/\/$/, '') : `${window.location.origin}`;
};

// Application type handlers for JS SDK.
//
// NOTE: keep in sync with `typeHandlers` in `server/api-util/sdk.js`
export const typeHandlers = [
  // Use Decimal type instead of SDK's BigDecimal.
  {
    type: sdkTypes.BigDecimal,
    customType: Decimal,
    writer: v => new sdkTypes.BigDecimal(v.toString()),
    reader: v => new Decimal(v.value),
  },
];

const serialize = data => {
  return transit.write(data, { typeHandlers, verbose: appSettings.sdk.transitVerbose });
};

const deserialize = str => {
  return transit.read(str, { typeHandlers });
};

const methods = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// If server/api returns data from SDK, you should set Content-Type to 'application/transit+json'
const request = (path, options = {}) => {
  const url = `${apiBaseUrl()}${path}`;
  const { credentials, headers, body, ...rest } = options;

  // If headers are not set, we assume that the body should be serialized as transit format.
  const shouldSerializeBody =
    (!headers || headers['Content-Type'] === 'application/transit+json') && body;
  const bodyMaybe = shouldSerializeBody ? { body: serialize(body) } : {};

  const fetchOptions = {
    credentials: credentials || 'include',
    // Since server/api mostly talks to Marketplace API using SDK,
    // we default to 'application/transit+json' as content type (as SDK uses transit).
    headers: headers || { 'Content-Type': 'application/transit+json' },
    ...bodyMaybe,
    ...rest,
  };

  return window
    .fetch(url, fetchOptions)
    .then(res => {
      const contentTypeHeader = res.headers.get('Content-Type');
      const contentType = contentTypeHeader ? contentTypeHeader.split(';')[0] : null;

      if (res.status >= 400) {
        return res.json().then(data => {
          let e = new Error();
          e = Object.assign(e, data);

          throw e;
        });
      }
      if (contentType === 'application/transit+json') {
        return res.text().then(deserialize);
      } else if (contentType === 'application/json') {
        return res.json();
      }
      return res.text();
    })
    .catch(e => {
      throw e;
    });
};

// Keep the previous parameter order for the post method.
// For now, only POST has own specific function, but you can create more or use request directly.
const post = (path, body, options = {}) => {
  const requestOptions = {
    ...options,
    method: methods.POST,
    body,
  };

  return request(path, requestOptions);
};

const get = async path => {
  if (typeof window === 'undefined') {
    // Handle server-side or non-browser environment
    return Promise.resolve(' ');
  }

  const url = `${apiBaseUrl()}${path}`;
  const options = {
    method: 'GET',
    credentials: 'include',
  };

  try {
    const res = await window.fetch(url, options);
    const contentTypeHeader = res.headers.get('Content-Type');
    const contentType = contentTypeHeader ? contentTypeHeader.split(';')[0] : null;

    if (res.status >= 400) {
      const data = await res.json();
      let e = new Error();
      e = Object.assign(e, data);
      // throw e;
    }

    if (contentType === 'application/transit+json') {
      return await res.text().then(deserialize);
    } else if (contentType === 'application/json') {
      return await res.json();
    }

    return await res.text();
  } catch (error) {
    // Handle any fetch-related errors here
    // throw error; // Optionally rethrow the error for further handling
  }
};

// Fetch transaction line items from the local API endpoint.
//
// See `server/api/transaction-line-items.js` to see what data should
// be sent in the body.
export const transactionLineItems = body => {
  return post('/api/transaction-line-items', body);
};

// Initiate a privileged transaction.
//
// With privileged transitions, the transactions need to be created
// from the backend. This endpoint enables sending the order data to
// the local backend, and passing that to the Marketplace API.
//
// See `server/api/initiate-privileged.js` to see what data should be
// sent in the body.
export const initiatePrivileged = body => {
  return post('/api/initiate-privileged', body);
};

// Transition a transaction with a privileged transition.
//
// This is similar to the `initiatePrivileged` above. It will use the
// backend for the transition. The backend endpoint will add the
// payment line items to the transition params.
//
// See `server/api/transition-privileged.js` to see what data should
// be sent in the body.
export const transitionPrivileged = body => {
  return post('/api/transition-privileged', body);
};

export const getSubscriptionPrice = body => {
  return get('/api/get-subscription-price', body);
};

export const createStripeSubscription = body => {
  return post('/api/stripe-create-subscription', body);
};

export const getStripeSubscriptionStatus = body => {
  return post('/api/stripe-user-subscription-status', body);
};

export const deleteUserAccount = body => {
  return post('/api/request-to-delete-account', body);
};
export const onApplyDiscountCoupoun = body => {
  return post('/api/applyDiscountCopoun', body);
};
export const getAllUsers = body => {
  return post('/api/get-user', body);
};

export const stripeCustomerPortal = body => {
  return post('/api/stripe-customer-dashboard', body);
};

export const cryptoPayment = body => {
  return post('/api/crypto-payments', body);
};

export const cryptoPayout = body => {
  return post('/api/crypto-payouts', body);
};

export const cryptoPayoutConfirm = body => {
  return post('/api/confirm-crypto-payouts', body);
};

export const encryptWalletAddress = body => {
  return post('/api/encrypt-address', body);
};

export const decryptWalletAddress = body => {
  return post('/api/decrypt-address', body);
};

export const getAuthorData = body => {
  return post('/api/get-author-data', body);
};

export const closeAllListings = body => {
  return post('/api/close-listings', body);
};

export const openRefurbishedAllListings = body => {
  return post('/api/open-refurbished-listings', body);
};

export const updateTransactionMetadata = body => {
  return post('/api/update-meta-data', body);
};

export const fetchOrderNumber = body => {
  return get('/api/fetch-order-number', body);
};
export const addOrUpdateOrderNumber = body => {
  return post('/api/updated-order-number', body);
};

export const addOrUpdateDiscounts = body => {
  return post('/api/updated-discount', body);
};
export const fetchDiscount = body => {
  return get('/api/fetch-discount', body);
};
export const fetchVouchers = body => {
  return get('/api/fetch-vouchers', body);
};
export const fetchRedeemedVouchers = body => {
  return post('/api/fetch-redeemed-vouchers', body);
};

export const fetchRewardPoints = body => {
  return post('/api/fetch-reward-points', body);
};
export const updateRewardHistoryPoints = body => {
  return post('/api/update-reward-History-points', body);
};
export const updateRedeemedVouchersHistoryPoints = body => {
  return post('/api/update-redeemed-Vouchers-History-points', body);
};
export const updateRedeemedVoucher = body => {
  return post('/api/update-Redeemed-Vouchers', body);
};

export const getOwnListings = body => {
  return post('/api/get-own-listings', body);
};
export const getShowListings = body => {
  return post('/api/get-show-listings', body);
};

export const disputeOrderEmailToAdmin = body => {
  return post('/api/dispute-order-to-admin', body);
};

export const reportUserEmailToAdmin = body => {
  return post('/api/report-user-to-admin', body);
};
export const offPlatformRewardEmailToUser = body => {
  return post('/api/off-platform-reward-to-user', body);
};
export const offPlatformRewardEmailToAdmin = body => {
  return post('/api/off-platform-reward-to-admin', body);
};

export const platformRewardEmailToAdmin = body => {
  return post('/api/platform-reward-to-admin', body);
};

export const earnedPoints = body => {
  return post('/api/earned-points', body);
};

export const getAuthToken = body => {
  return post('/api/get-auth-token', body);
};
export const getUpdateUser = body => {
  return post('/api/updateUser', body);
};
export const getRewardsPoint = body => {
  
  return post('/api/rewards-point', body);
};

export const uploadImageToCloudinary = body => {
  return post('/api/upload-images', body);
};

export const deleteImageFromCloudinary = body => {
  return post('/api/delete-images', body);
};

export const updateUsersPlanData = body => {
  return post('/api/track-membership-plan', body);
};

// Algolia search data
export const createAlgoliaData = body => {
  return post('/api/createAlgoliaData', body);
};
export const updateAlgoliaData = body => {
  return post('/api/updateAlgoliaData', body);
};
export const deleteAlgoliaData = body => {
  return post('/api/deleteAlgoliaData', body);
};
export const searchAlgoliaData = body => {
  return post('/api/searchAlgoliaData', body);
};

//shippo

export const getCarrierAccounts = body => {
  return get('/api/get-carrier-accounts', body);
};

export const validateUserAddress = body => {
  return post('/api/validate-user-address', body);
};

export const getShippingRates = body => {
  return post('/api/get-shipping-rates', body);
};

export const createShippingLabel = body => {
  return post('/api/print-shipping-label', body);
};

export const createReturnShippingLabel = body => {
  return post('/api/print-return-shipping-label', body);
};

//

export const followUserStore = body => {
  return post('/api/follow-store-author', body);
};

export const fetchFollowersData = body => {
  return post('/api/fetch-follower-data', body);
};

// Create user with identity provider (e.g. Facebook or Google)
//
// If loginWithIdp api call fails and user can't authenticate to Marketplace API with idp
// we will show option to create a new user with idp.
// For that user needs to confirm data fetched from the idp.
// After the confirmation, this endpoint is called to create a new user with confirmed data.
//
// See `server/api/auth/createUserWithIdp.js` to see what data should
// be sent in the body.
export const createUserWithIdp = body => {
  return post('/api/auth/create-user-with-idp', body);
};
