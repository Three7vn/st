const RewardHistory = require('../../models/RewardHistory');
const { getIntegrationSdk } = require('../../api-util/sdk');
const isdk = getIntegrationSdk();
const { types } = require('sharetribe-flex-integration-sdk');
const { UUID } = types;
const sgMail = require('@sendgrid/mail');
const moment = require('moment');

const {
  SEND_GRID_POINTS_EXPIRING,
  SENDGRID_API_KEY,
  SEND_GRID_ADMIN_EMAIL,
  SEND_GRID_EMAIL,
} = process.env;

const pointsExpiring = async (voucher, prevRewardsPoint) => {
  try {
    const UserName = voucher?.userName;
    const DaysLeft = '30';
    const PointsBalance = prevRewardsPoint;
    const key = SENDGRID_API_KEY;
    sgMail.setApiKey(key);
    const message = {
      from: SEND_GRID_ADMIN_EMAIL,
      to: SEND_GRID_EMAIL,
      subject: 'Points Expiring',
      templateId: SEND_GRID_POINTS_EXPIRING,
      dynamicTemplateData: { UserName, DaysLeft, PointsBalance },
    };

    const response = await sgMail.send(message);
    return response;
  } catch (error) {
    console.log(error, '$$$$ $$$$ => error');
  }
};
const fetchVouchers = async () => {
  let shouldCall = true;
  let page = 1;
  const limit = 3;
  let skip = (page - 1) * limit;
  let allVouchers = [];

  try {
    let vouchers = [];
    do {
      vouchers = await RewardHistory.find()
        .skip(skip)
        .limit(limit);

      if (!vouchers || vouchers.length == 0) {
        shouldCall = false;
        break;
      }

      allVouchers = allVouchers.concat(vouchers);
      page++;
      skip = (page - 1) * limit;

      // Continue fetching while there are more vouchers to fetch (vouchers.length > 0)
    } while (shouldCall);

    return allVouchers;
  } catch (error) {
    console.log('error at fetchVouchers :>> ', error);
    return 'error at fetchVouchers!!';
  }
};

const deleteRewards = async () => {
  try {
    // Schedule cron job to update expired vouchers every 15 seconds (for testing purposes)
    try {
      const currentDate = new Date();

      // Calculate expiry date (60 days from current date)

      // Calculate notify date (current date)
      const notifyTimeStamp = currentDate.setDate(currentDate.getDate() - 30);
      const notifyStamp = new Date(notifyTimeStamp);
      const notifyDate = notifyStamp.toISOString().split('T')[0];

      const vouchers = await fetchVouchers();

      // Update vouchers based on history dates
      const updatePromises = vouchers.map(async voucher => {
        const userRewardsPoints = await isdk.users.show({
          id: new UUID(voucher?.userId),
        });
        let prevRewardsPoint =
          userRewardsPoints?.data?.data?.attributes?.profile?.publicData?.rewardsWallet || 0;
        let prevRewardsSpin =
          userRewardsPoints?.data?.data?.attributes?.profile?.publicData?.spin || 0;
        const publicData = {};

        const newHistory = voucher.history.map(elm => {
          let data = elm;
          const date = new Date(elm.date);
          const currentDate = new Date();
          const expiryTimestamp = date.setDate(currentDate.getDate() + 60);
          const expiryStamp = new Date(expiryTimestamp);
          const expiryDate = expiryStamp.toISOString().split('T')[0];
          const notifyTimeStamp = date.setDate(currentDate.getDate() + 30);
          const notifyStamp = new Date(notifyTimeStamp);
          const notifyDate = notifyStamp.toISOString().split('T')[0];
          if (moment(currentDate).isAfter(moment(expiryDate)) && !elm.isExpired) {
            // Set voucher as expired
            data.isExpired = true;

            if (prevRewardsPoint) {
              prevRewardsPoint = Math.max(prevRewardsPoint - elm.points, 0);
              publicData.rewardsWallet = prevRewardsPoint;
            }
            if (prevRewardsSpin) {
              prevRewardsSpin = Math.max(prevRewardsSpin - elm.spin, 0);
              publicData.spin = prevRewardsSpin;
            }
            return data;
          }
          if (moment(currentDate).isSame(moment(notifyDate)) || !elm.isExpired) {
            pointsExpiring(voucher, prevRewardsPoint);
          }
          // Check if the points will expire in 30 days
          return data;
        });

        if (Object.keys(publicData).length > 0) {
          isdk.users.updateProfile({
            id: new UUID(voucher?.userId),
            publicData,
          });
        }
        const historyId = voucher._id; // Assuming _id exists in historyEntry

        // Update the specific history entry within the RewardHistory collection
        await RewardHistory.updateMany(
          { _id: historyId },
          { $set: { history: newHistory } },
          { upsert: true }
        );
      });

      // Execute all update promises
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating vouchers:', error);
    }
  } catch (error) {
    console.error('Error scheduling cron job:', error);
  }
};

module.exports = { deleteRewards };
