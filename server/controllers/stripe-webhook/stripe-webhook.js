const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;
const { types } = require('sharetribe-flex-integration-sdk');
const { getIntegrationSdk } = require('../../api-util/sdk');
const { UUID } = types;
const isdk = getIntegrationSdk();
const algoliasearch = require('algoliasearch');

const client = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID,
  process.env.REACT_APP_ALGOLIA_API_KEY
);
const index = client.initIndex(process.env.REACT_APP_ALGOLIA_LISTING_INDEX);

const closeAllListings = async params => {
  const { authorId } = params;
  console.log(authorId, 'authorId11');
  try {
    const response = await isdk.listings.query({
      authorId,
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
          authorId,
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
        console.log('Listing Closed');
        return 'Listing Closed';
      }
    } else {
      console.log('Not any Data');
      return 'Not any Data';
    }
  } catch (error) {
    return error.message;
  }
};

const openRefurbishedAllListings = async params => {
  const { authorId } = params;
  console.log(authorId, 'authorIdopen');

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
      console.log(11);
      // Moved the response outside the loop
      return 'Open Success';
    } else {
      console.log(22);
      return 'Not any Data';
    }
  } catch (error) {
    return error.message;
  }
};

const updateUsersPlanData = async (request, response) => {
  console.log('==========webhoook=============');
  const sig = request.headers['stripe-signature'];
  console.log(sig, '&&& &&& => sig');
  console.log('request.rawBody', request.body);
  let event;
  try {
    event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
  } catch (err) {
    console.log(err, '&&& &&& => err');
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
      console.log('customer.subscription.updated2', event.data.object);
      try {
        const userId = event.data.object.metadata.userId;
        console.log(userId, 'userId1');
        const { current_period_start, current_period_end, plan } = event.data.object || {};
        if (userId) {
          const startTime = current_period_start;
          const endTime = current_period_end;
          const startDate = new Date(startTime * 1000); // Convert seconds to milliseconds
          const endDate = new Date(endTime * 1000);
          isdk.users
            .updateProfile({
              id: new UUID(userId),
              protectedData: {
                subscriptionPlan: [event.data.object],
              },
              publicData: {
                currentPlanData: {
                  isActive: true,
                  planName: ['Business Enterprise-Monthly', 'Business Enterprise-Yearly'].includes(
                    plan?.nickname
                  )
                    ? 'business-enterprise'
                    : 'member-plan',
                  startDate: startDate.toISOString().slice(0, 10),
                  endDate: endDate.toISOString().slice(0, 10), // Start date stored as string
                },
                endDate: endDate.toISOString().slice(0, 10),
                listingsSoldCount: 0,
                listingsSoldPrice: 0,
                freePlanData: null,
              },
            })
            .then(res => {
              const hasBusinessPlan =
                plan?.nickname === 'Business Enterprise-Monthly' ||
                plan?.nickname === 'Business Enterprise-Yearly';
              if (!hasBusinessPlan && userId) {
                closeAllListings({ authorId: userId });
              } else if (hasBusinessPlan && userId) {
                openRefurbishedAllListings({ authorId: userId });
              }
            });
        }
      } catch (e) {
        console.log(e);
      }
      break;

    case 'customer.subscription.created':
      console.log('customer.subscription.created', event.data.object);
      try {
        const isdk = getIntegrationSdk();
        const userId = event.data.object.metadata.userId;
        const { current_period_start, current_period_end ,plan} = event.data.object || {};
        if (userId) {
          console.log(userId, 'userId2');
          const startTime = current_period_start;
          const endTime = current_period_end;
          const startDate = new Date(startTime * 1000); // Convert seconds to milliseconds
          const endDate = new Date(endTime * 1000);
          console.log(startDate, endDate, 'test');
          isdk.users
            .updateProfile({
              id: new UUID(userId),
              protectedData: {
                subscriptionPlan: [event.data.object],
              },
              publicData: {
                currentPlanData: {
                  isActive: true,
                  planName: ['Business Enterprise-Monthly', 'Business Enterprise-Yearly'].includes(
                    plan?.nickname
                  )
                    ? 'business-enterprise'
                    : 'member-plan',
                  startDate: startDate.toISOString().slice(0, 10),
                  endDate: endDate.toISOString().slice(0, 10), // Start date stored as string
                },
                endDate: endDate.toISOString().slice(0, 10),
                listingsSoldCount: 0,
                listingsSoldPrice: 0,
                freePlanData: null,
              },
            })
            .then(res => {
              console.log('updated');
            });
        }
      } catch (e) {
        console.log(e);
      }
      break;
    case 'customer.subscription.deleted':
      console.log('customer.subscription.deleted', event.data.object);
      try {
        const isdk = getIntegrationSdk();
        const userId = event.data.object.metadata.userId;
        if (userId) {
          console.log(userId, 'userId3');
          const startDate = new Date(); // Get the current date and time

          // Add 30 days to the current date
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 30);

          // Convert the start date to a string format
          const startDateString = startDate.toISOString().slice(0, 10);

          // Convert the end date to a string format and extract only the date part
          const endDateString = endDate.toISOString().slice(0, 10);
          isdk.users
            .updateProfile({
              id: new UUID(userId),
              publicData: {
                protectedData: {
                  subscriptionPlan: null,
                },
                currentPlanData: null,
                endDate: endDateString,
                listingsSoldCount: 0,
                listingsSoldPrice: 0,
                freePlanData: {
                  isFreePlanActive: true,
                  planName: 'Free-Plan',
                  startDate: startDateString,
                  endDate: endDateString,
                },
              },
            })
            .then(res => {
              console.log('updated');
            });
        }
      } catch (e) {
        console.log(e);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.send();
};
(() => {})();
module.exports = { updateUsersPlanData };
