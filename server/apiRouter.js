/**
 * This file contains server side endpoints that can be used to perform backend
 * tasks that can not be handled in the browser.
 *
 * The endpoints should not clash with the application routes. Therefore, the
 * endpoints are prefixed in the main server where this file is used.
 */

const express = require('express');
const bodyParser = require('body-parser');
const { deserialize } = require('./api-util/sdk');
const { applyDiscountCopoun } = require('./api/applyDiscountCopoun');

const initiateLoginAs = require('./api/initiate-login-as');
const loginAs = require('./api/login-as');
const transactionLineItems = require('./api/transaction-line-items');
const initiatePrivileged = require('./api/initiate-privileged');
const transitionPrivileged = require('./api/transition-privileged');
const deleteAccount = require('./controllers/delete-user-account/delete-user-account');
const { createData, updateData, deleteData, searchData } = require('./api/algoliaSearch');

const createUserWithIdp = require('./api/auth/createUserWithIdp');

const { authenticateFacebook, authenticateFacebookCallback } = require('./api/auth/facebook');
const { authenticateGoogle, authenticateGoogleCallback } = require('./api/auth/google');
const {
  getSubscriptionPrice,
  createStripeSubscription,
  getStripeSubscriptionStatus,
  stripeCustomerPortal,
  planTrackingWebhook,
} = require('./controllers/stripe-subscription/stripe-subscription');
const {
  getAllUsers,
  getAuthorData,
  updateUser,
  getOwnListings,
  closeAllListings,
  openRefurbishedAllListings,
  updateTransactionMetadata,
  getShowListings,
} = require('./controllers/integration-api/integration-api');

// const {
//   addOrUpdateOrderNumber,
//   fetchOrderNumber,
//   fetchCoupons,
// } = require('./controllers/order-number/order-number');
const {
  cryptoPayments,
  getAuthToken,
  cryptoPayouts,
  confirmCryptoPayouts,
} = require('./controllers/crypto-api/crypto-api');
const {
  encryptWalletAddress,
  decryptWalletAddress,
} = require('./controllers/encrypt-decrypt/encrypt-decrypt');
const {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} = require('./controllers/cloudinary/cloudinary');
const multer = require('multer');
const {
  addOrUpdateOrderNumber,
  fetchOrderNumber,
  fetchRewardPoints,
  updateRewardHistoryPoints,
  addOrUpdateDiscounts,
  fetchDiscount,
  fetchVouchers,
  updateRedeemedVouchersHistoryPoints,
  fetchRedeemedVouchers,
  updateRedeemedVoucher,
} = require('./controllers/order-number/order-number');
const { updateUsersPlanData } = require('./controllers/stripe-webhook/stripe-webhook');

const {
  getCarrierAccounts,
  validateUserAddress,
  getShippingRates,
  createShippingLabel,
  createReturnShippingLabel,
} = require('./controllers/shippo/shippo');
const { rewardsPoint } = require('./controllers/rewards/rewards');
const {
  disputeOrderEmailToAdmin,
  reportUserEmailToAdmin,
  offPlatformRewardEmailToUser,
  offPlatformRewardEmailToAdmin,
  platformRewardEmailToAdmin,
  earnedPoints
} = require('./controllers/send-grid-notify/send-grid-notify');
const {
  followUserStore,
  fetchFollowersData,
} = require('./controllers/follower-user/follower-user');
const router = express.Router();

// ================ API router middleware: ================ //

// Parse Transit body first to a string
router.use(
  bodyParser.text({
    type: 'application/transit+json',
  })
);

// Deserialize Transit body string to JS data
router.use((req, res, next) => {
  if (req.get('Content-Type') === 'application/transit+json' && typeof req.body === 'string') {
    try {
      req.body = deserialize(req.body);
    } catch (e) {
      console.error('Failed to parse request body as Transit:');
      console.error(e);
      res.status(400).send('Invalid Transit in request body.');
      return;
    }
  }
  next();
});

const storage = multer.diskStorage({
  destination: './server/temp/',
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

// ================ API router endpoints: ================ //

router.get('/initiate-login-as', initiateLoginAs);
router.get('/login-as', loginAs);
router.post('/transaction-line-items', transactionLineItems);
router.post('/initiate-privileged', initiatePrivileged);
router.post('/transition-privileged', transitionPrivileged);
router.get('/get-subscription-price', getSubscriptionPrice);
router.post('/stripe-create-subscription', createStripeSubscription);
router.post('/stripe-user-subscription-status', getStripeSubscriptionStatus);
router.post('/stripe-customer-dashboard', stripeCustomerPortal);
router.post('/request-to-delete-account', deleteAccount);
router.post('/applyDiscountCopoun', applyDiscountCopoun);
router.post('/get-user', getAllUsers);
router.post('/crypto-payments', cryptoPayments);
router.post('/crypto-payouts', cryptoPayouts);
router.post('/confirm-crypto-payouts', confirmCryptoPayouts);
router.post('/encrypt-address', encryptWalletAddress);
router.post('/decrypt-address', decryptWalletAddress);
router.post('/get-author-data', getAuthorData);
router.post('/update-meta-data', updateTransactionMetadata);
router.post('/get-own-listings', getOwnListings);
router.post('/get-show-listings', getShowListings);
router.post('/get-auth-token', getAuthToken);
router.post('/updateUser', updateUser);
router.post('/close-listings', closeAllListings);
router.post('/open-refurbished-listings', openRefurbishedAllListings);
router.post('/createAlgoliaData', createData);
router.post('/updateAlgoliaData', updateData);
router.post('/deleteAlgoliaData', deleteData);
router.post('/searchAlgoliaData', searchData);
router.post('/updated-order-number', addOrUpdateOrderNumber);
router.post('/updated-discount', addOrUpdateDiscounts);
router.get('/fetch-discount', fetchDiscount);
router.get('/fetch-vouchers', fetchVouchers);
router.post('/fetch-redeemed-vouchers', fetchRedeemedVouchers);
router.post('/track-membership-plan', updateUsersPlanData);
router.post('/rewards-point', rewardsPoint);
router.get('/fetch-order-number', fetchOrderNumber);
router.post('/dispute-order-to-admin', disputeOrderEmailToAdmin);
router.post('/report-user-to-admin', reportUserEmailToAdmin);
router.post('/off-platform-reward-to-user', offPlatformRewardEmailToUser);
router.post('/off-platform-reward-to-admin', offPlatformRewardEmailToAdmin);
router.post('/platform-reward-to-admin', platformRewardEmailToAdmin);
router.post('/earned-points', earnedPoints);
router.post('/fetch-reward-points', fetchRewardPoints);
router.post('/update-reward-History-points', updateRewardHistoryPoints);
router.post('/update-redeemed-Vouchers-History-points', updateRedeemedVouchersHistoryPoints);
router.post('/update-Redeemed-Vouchers', updateRedeemedVoucher);
// router.post('/get-coupons', fetchCoupons);

//shippo
router.get('/get-carrier-accounts', getCarrierAccounts);
router.post('/validate-user-address', validateUserAddress);
router.post('/get-shipping-rates', getShippingRates);
router.post('/print-shipping-label', createShippingLabel);
router.post('/print-return-shipping-label', createReturnShippingLabel);

router.post('/follow-store-author', followUserStore);
router.post('/fetch-follower-data', fetchFollowersData);

router.post('/delete-images', deleteImageFromCloudinary);
router.post('/upload-images', upload.single('file'), uploadImageToCloudinary);
// Create user with identity provider (e.g. Facebook or Google)
// This endpoint is called to create a new user after user has confirmed
// they want to continue with the data fetched from IdP (e.g. name and email)
router.post('/auth/create-user-with-idp', createUserWithIdp);

// Facebook authentication endpoints

// This endpoint is called when user wants to initiate authenticaiton with Facebook
router.get('/auth/facebook', authenticateFacebook);

// This is the route for callback URL the user is redirected after authenticating
// with Facebook. In this route a Passport.js custom callback is used for calling
// loginWithIdp endpoint in Sharetribe Auth API to authenticate user to the marketplace
router.get('/auth/facebook/callback', authenticateFacebookCallback);

// Google authentication endpoints

// This endpoint is called when user wants to initiate authenticaiton with Google
router.get('/auth/google', authenticateGoogle);

// This is the route for callback URL the user is redirected after authenticating
// with Google. In this route a Passport.js custom callback is used for calling
// loginWithIdp endpoint in Sharetribe Auth API to authenticate user to the marketplace
router.get('/auth/google/callback', authenticateGoogleCallback);

module.exports = router;
