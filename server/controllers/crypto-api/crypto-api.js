const axios = require('axios');
const { URLSearchParams } = require('url');
const { getIntegrationSdk } = require('../../api-util/sdk');
const { CRYPTO_CLIENT_ID, CRYPTO_CLIENT_SECRET, CRYPTO_MERCHANT_KEY ,CRYPTO_MERCHANT_NAME} = process.env;
const { types } = require('sharetribe-flex-integration-sdk');
const { UUID } = types;
const jwt = require('jsonwebtoken');
const secretKey = 'xaUcwLBaYprBPUG';

module.exports = {
  // /api/get-auth-token
  getAuthToken: async (req, res) => {
    const encodedParams = new URLSearchParams();
    encodedParams.set('client_id', CRYPTO_CLIENT_ID);
    encodedParams.set('client_secret', CRYPTO_CLIENT_SECRET);
    encodedParams.set('grant_type', 'client_credentials');

    const options = {
      method: 'POST',
      url: 'https://api.triple-a.io/api/v2/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: 'Bearer 123',
      },
      data: encodedParams,
    };

    try {
      const { data } = await axios.request(options);
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
    }
  },

  // @cryptoPayments => /api/crypto-payments
  cryptoPayments: async (req, res) => {
    const { token, listingId, listingTitle, buyerEmail, price, orderId } = req.body;
    const options = {
      method: 'POST',
      url: `https://api.triple-a.io/api/v2/payment`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`, // Use Basic Authentication
      },
      data: {
        type: 'widget',
        merchant_key: CRYPTO_MERCHANT_KEY,
        sandbox: true,
        order_currency: 'GBP',
        order_amount: price,
        notify_email: buyerEmail,
        order_id: orderId,
        notify_url: 'https://webhook.site/1a2d24e8-1594-4569-bc35-079049e4d805',
        notify_txs: true,
        payer_id: buyerEmail,
        success_url: `https://stoado-test-a79d59876706.herokuapp.com/order/${orderId}/checkout`,
        cancel_url: `https://stoado-test-a79d59876706.herokuapp.com/l/${listingTitle}/${listingId}/checkout`,
        // "cart": {
        //   "items": [
        //     {
        //       "sku": "ABC8279289",
        //       "label": "A tale of 2 cities",
        //       "quantity": 10,
        //       "amount": 7
        //     }
        //   ],
        //   "shipping_cost": 2,
        //   "shipping_discount": 1,
        //   "tax_cost": 2
        // },
      },
    };

    // const options = {
    //   method: 'POST',
    //   url: `https://api.triple-a.io/api/v2/payout/withdraw/local/crypto/direct`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Accept: 'application/json',
    //     Authorization: 'Bearer 86e0cacd5e94242cc534c912f3328bd5f0dbc1fc', // Use Basic Authentication
    //   },
    //   data:{
    //     "merchant_key": "mkey-cltd18byg0000v3dj9tascivw",
    //     "email": "pooja@marketplacestudio.io",
    //     "withdraw_currency": "GBP",
    //     "crypto_currency": "testBTC",
    //     "withdraw_amount": 0.2,
    //     "address":"tb1qt0lenzqp8ay0ryehj7m3wwuds240mzhgdhqp4c",
    //     "name":"Stoado - Payout - GBP",
    //     "country":"US",
    //   }
    // // data: {
    // //     type: 'triplea',
    // //     merchant_key: 'mkey-cltd18byg0000v3dj9tascivw',
    // //     order_currency: 'USD',
    // //     sandbox: true,
    // //     order_amount: 1,
    // //     payer_id: 'TRE1787238205',
    // //     success_url: 'https://www.success.io/success.html',
    // //     cancel_url: 'https://www.failure.io/cancel.html',

    // //   }

    // };
    try {
      const { data } = await axios.request(options);
      res.status(200).json(data);
    } catch (error) {
      console.error(error.response.data.errors);
    }
  },

  // @cryptoPayouts => /api/crypto-payouts
  cryptoPayouts: async (req, res) => {
    const isdk = getIntegrationSdk(req, res);
    const { token, sellerEmail, payoutAmount, countryCode, order_id, sellerId } = req.body;
    try {
      const {
        data: { data: currentUser },
      } = await isdk.users.show({ id: new UUID(sellerId) });
      const cryptoWalletAddress =
        !!currentUser?.id && currentUser?.attributes?.profile?.protectedData?.cryptoWalletAddress;

      if (cryptoWalletAddress) {
        try {
          const decryptedId = jwt.verify(cryptoWalletAddress, secretKey);
          const options = {
            method: 'POST',
            url: `https://api.triple-a.io/api/v2/payout/withdraw/local/crypto/direct`,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`, // Use Basic Authentication
            },
            data: {
              merchant_key: CRYPTO_MERCHANT_KEY,
              email: sellerEmail,
              withdraw_currency: 'GBP',
              crypto_currency: 'testBTC',
              withdraw_amount: payoutAmount, //payoutAmount,
              address: decryptedId, // "tb1qt0lenzqp8ay0ryehj7m3wwuds240mzhgdhqp4c",
              name: 'Stoado - Payout - GBP',
              country: countryCode,
              // order_id,
            },
          };
          const { data } = await axios.request(options);
          res.status(200).json(data);
        } catch (jwtError) {
          console.error('JWT verification error:', jwtError.response.data.errors);
          res.status(400).json({ error: 'Invalid cryptoWalletAddress' });
        }
      } else {
        res.status(400).json({ error: 'No cryptoWalletAddress found' });
      }
    } catch (error) {
      console.error(error.response.data.errors);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  // @cryptoPayouts => /api/confirm-crypto-payouts
  confirmCryptoPayouts: async (req, res) => {
    const { token, payout_reference } = req.body;

    const options = {
      method: 'PUT',
      url: `https://api.triple-a.io/api/v2/payout/withdraw/${payout_reference}/local/crypto/confirm`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`, // Use Basic Authentication
      },
      data: {
        payout_reference,
      },
    };
    try {
      const { data } = await axios.request(options);
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
    }
  },
};
