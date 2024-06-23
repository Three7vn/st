const schedule = require('node-schedule');
const { types } = require('sharetribe-flex-integration-sdk');
const { getIntegrationSdk } = require('../api-util/sdk');
const isdk = getIntegrationSdk();
const { UUID } = types;

module.exports = {
  updateSubscription: () => {
    const rule = '*/10 * * * * *'; // Run at 00:00 (midnight) every day

    schedule.scheduleJob(rule, async function() {
      const today = new Date().toISOString().slice(0, 10);
      try {
        const usersArray = [];
        const response = await isdk.users.query({ pub_endDate: today });
        if (response?.data?.data?.length > 0) {
          const numberOfPages = response.data.meta.totalPages;
          for (let i = 1; i <= numberOfPages; i++) {
            const {
              data: { data = [] },
            } = await isdk.users.query({ pub_endDate: today, page: i });
            const filterData = data.filter(
              e => e?.attributes?.profile?.publicData?.freePlanData?.isFreePlanActive
            );
            console.log(filterData, 'filterData');
            if (data?.length) usersArray.push(...filterData);
            // Update profiles
            if (usersArray?.length > 0) {
              console.log(11);
              for (const item of usersArray) {
                await isdk.users.updateProfile({
                  id: new UUID(item?.id?.uuid),
                  publicData: {
                    listingsSoldCount: 0,
                    listingsSoldPrice: 0,
                    freePlanData: null,
                  },
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error querying users:', err);
      }
    });
  },
};
