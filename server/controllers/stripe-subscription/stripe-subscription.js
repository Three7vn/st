const { getSdk } = require('../../api-util/sdk');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const secretKey = 's0YvliqGJcDqrbl';

module.exports = {
  //Get Subcription Price => /stripe-get-price
  getSubscriptionPrice: async (req, res) => {
    try {
      const prices = await stripe.prices.list({
        expand: ['data.product'], // Expand the 'product' field to get product metadata
      });
      return res.status(200).json(prices.data.reverse());
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  //Create Subcription => /stripe-create-subscription
  createStripeSubscription: async (req, res) => {
    const sdk = getSdk(req, res);

    try {
      const { priceID, userEmail, userName, timestamp } = req.body;
      // Create account in stripe
      const {
        data: { data: currentUser },
      } = await sdk.currentUser.show();
      const stripeCustomerId =
        !!currentUser?.id && currentUser?.attributes?.profile?.protectedData?.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: userEmail.toLowerCase(),
          name: userName,
        });
        const token = jwt.sign(customer?.id, secretKey);
        const {
          data: {
            data: { id },
          },
        } = await sdk.currentUser.updateProfile({
          protectedData: {
            stripeCustomerId: token,
          },
        });
      }
      const {
        data: { data: updatedCurrentUser },
      } = await sdk.currentUser.show();
      const updatedCurrentUserStripeId =
        updatedCurrentUser?.attributes?.profile?.protectedData?.stripeCustomerId ||
        currentUser?.attributes?.profile?.protectedData?.stripeCustomerId;
      if (updatedCurrentUserStripeId) {
        const decrypted = jwt.verify(updatedCurrentUserStripeId, secretKey);
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card', 'bacs_debit'],
          line_items: [
            {
              price: priceID,
              quantity: 1,
            },
          ],
          subscription_data: {
            // Add trial period of 7 days
            trial_period_days: 1,
            metadata: { userId: currentUser?.id?.uuid },
          },
          customer: decrypted,
          success_url: process.env.STRIPE_SUCCESS_URL,
          cancel_url: process.env.STRIPE_CANCEL_URL,
        });

        return res.status(201).json(session.url);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // @Subscription Status => /stripe-user-subscription-status

  getStripeSubscriptionStatus: async (req, res) => {
    const sdk = getSdk(req, res);

    try {
      const {
        data: { data: currentUser },
      } = await sdk.currentUser.show();
      const stripeCustomerId =
        !!currentUser?.id && currentUser?.attributes?.profile?.protectedData?.stripeCustomerId;
      const subscriptionPlan =
        !!currentUser?.id && currentUser?.attributes?.profile?.protectedData?.subscriptionPlan;
      if (stripeCustomerId) {
        const decryptedId = jwt.verify(stripeCustomerId, secretKey);
        const subscriptions = await stripe.subscriptions.list({
          customer: decryptedId,
          status: 'all',
          expand: ['data.default_payment_method'],
        });
        const result =
          subscriptions?.data.filter(
            e => e.status === 'active' || e.status === 'trialing' || e.status === 'canceled'
          ) || [];

        return res.status(200).json(result);
      } else {
        return res.status(200).json([]);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // @Get Subscriptions => /stripe-get-user-subscriptions

  getSubscriptions: async (req, res) => {
    try {
      const sdk = getSdk(req, res);
      const {
        data: { data: currentUser },
      } = await sdk.currentUser.show();
      const stripeCustomerId =
        !!currentUser?.id && currentUser?.attributes?.profile?.protectedData?.stripeCustomerId;
      if (stripeCustomerId) {
        const decryptedId = jwt.verify(stripeCustomerId, secretKey);
        const subscriptions = await stripe.subscriptions.list({
          customer: decryptedId,
          status: 'all',
          expand: ['data.default_payment_method'],
        });
        return res.status(200).json(subscriptions.filter(e => e.status === 'active'));
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // @customer dashboard => /stripe-customer-dashboard

  stripeCustomerPortal: async (req, res) => {
    try {
      const sdk = getSdk(req, res);
      const {
        data: { data: currentUser },
      } = await sdk.currentUser.show();
      const stripeCustomerId =
        !!currentUser?.id && currentUser?.attributes?.profile?.protectedData?.stripeCustomerId;
      if (stripeCustomerId) {
        const decryptedId = jwt.verify(stripeCustomerId, secretKey);
        const session = await stripe.billingPortal.sessions.create({
          customer: decryptedId,
          return_url: process.env.STRIPE_SUCCESS_URL,
        });

        res.status(200).json(session.url);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
