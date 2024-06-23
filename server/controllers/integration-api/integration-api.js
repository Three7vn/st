const { types } = require('sharetribe-flex-integration-sdk');
const { getIntegrationSdk } = require('../../api-util/sdk');
const isdk = getIntegrationSdk();
const { UUID } = types;
const secretKey = 'eHweyivAscyP175';

const algoliasearch = require('algoliasearch');

const client = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID,
  process.env.REACT_APP_ALGOLIA_API_KEY
);
const index = client.initIndex(process.env.REACT_APP_ALGOLIA_LISTING_INDEX);

const methods = {
  // post => /api/get-user
  getAllUsers: async (req, res) => {
    const { featuredSeller } = req.body;
    try {
      const { data: { data = {} } = {} } = await isdk.users.query({ pub_featuredSeller: true });
      if (data.length < 6) {
        const response = await isdk.users.query({ pub_featuredSeller: false });
        res.status(200).json([...data, ...response?.data?.data.slice(0, 6 - data?.length)]);
      } else {
        res.status(200).json(data.slice(0, 6));
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // post => /api/get-author-data
  getAuthorData: async (req, res) => {
    const { authorId } = req.body;
    try {
      const { data: { data = {} } = {} } =
        authorId?.uuid &&
        (await isdk.users.show({ id: new UUID(authorId?.uuid), include: ['stripeAccount'] }));
      if (data) {
        const { cryptoWalletAddress, selectedMethod } = data.attributes.profile.protectedData || {};
        // const decryptedId = jwt.verify(cryptoWalletAddress, secretKey);
        res.status(200).json({
          selectedMethod: selectedMethod ? selectedMethod : false,
          authorStripeConnected: !!data.relationships.stripeAccount.data,
        });
      } else {
        res.status(200).json(null);
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { payload, userId } = req.body || {};
      await isdk.users.updateProfile({ id: new UUID(userId), ...payload });
    } catch (error) {
      console.log('error :>> ', error);
    }
  },
  getOwnListings: async (req, res) => {
    try {
      const response = await isdk.listings.query({
        ...req.body,
      });

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  getShowListings: async (req, res) => {
    try {
      const response = await isdk.listings.show({
        ...req.body,
      });

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  closeAllListings: async (req, res) => {
    const { authorId } = req.body;

    try {
      const response = await isdk.listings.query({
        authorId: authorId.uuid,
        pub_businessListingUnavailable: false,
        pub_refurbished: [
          'not-specified',
          'refurbushed-fair',
          'refurbished-good',
          'refurbished-pristine',
        ],
      });
      if (response?.data?.data?.length > 0) {
        const numberOfPages = response.data.meta.totalPages;

        for (let i = 1; i <= numberOfPages; i++) {
          const {
            data: { data = {} },
          } = await isdk.listings.query({
            page: i,
            authorId: authorId.uuid,
            pub_businessListingUnavailable: false,
            pub_refurbished: [
              'not-specified',
              'refurbushed-fair',
              'refurbished-good',
              'refurbished-pristine',
            ],
          });

          for (const item of data) {
            await isdk.listings.update({
              id: item.id,
              publicData: { businessListingUnavailable: true },
            });
            await index.partialUpdateObjects([
              { objectID: item.id.uuid, businessListingUnavailable: true },
            ]);
          }

          // Moved the response outside the loop
          res.status(200).json({ message: 'Closed Success' });
        }
      } else {
        res.status(200).json('Not any Data');
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  openRefurbishedAllListings: async (req, res) => {
    const { authorId } = req.body;
    try {
      const response = await isdk.listings.query({
        authorId: authorId.uuid,
        pub_businessListingUnavailable: true,
        pub_refurbished: [
          'not-specified',
          'refurbushed-fair',
          'refurbished-good',
          'refurbished-pristine',
        ],
      });
      if (response?.data?.data?.length > 0) {
        const numberOfPages = response.data.meta.totalPages;

        for (let i = 1; i <= numberOfPages; i++) {
          const {
            data: { data = {} },
          } = await isdk.listings.query({
            page: i,
            authorId: authorId.uuid,
            pub_businessListingUnavailable: true,
            pub_refurbished: [
              'not-specified',
              'refurbushed-fair',
              'refurbished-good',
              'refurbished-pristine',
            ],
          });

          for (const item of data) {
            await isdk.listings.update({
              id: item.id,
              publicData: { businessListingUnavailable: false },
            });
            await index.partialUpdateObjects([
              { objectID: item.id.uuid, businessListingUnavailable: false },
            ]);
          }
        }

        // Moved the response outside the loop
        res.status(200).json({ message: 'Open Success' });
      } else {
        res.status(200).json('Not any Data');
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateTransactionMetadata: async (req, res) => {
    const { id, isCustomerMessage, isProviderMessage ,lastUpdatedTime} = req.body;
    try {
      const result = await isdk.transactions.updateMetadata({
        id,
        metadata: { isCustomerMessage, isProviderMessage ,lastUpdatedTime},
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error('error', error);
    }
  },
};

module.exports = methods;
