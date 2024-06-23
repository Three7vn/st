const {
  sendPriceDropEmail,
  sendNewItemEmail,
  sendPayoutsEmail,
  deleteAccountEmailToAdmin,
  cartItemNotifyToUser,
  disputeOrderNotify,
  reportUserNotify,
  offPlatformUserNotify,
  offPlatformAdminNotify,
  earnedPointsNotify,
  platformAdminNotify,
} = require('../../api-util/sendGridEmail');
const client = require('@sendgrid/client');
const methods = {
  disputeOrderEmailToAdmin: async (req, res) => {
    try {
      await disputeOrderNotify(req.body);
      return res.status(200).json({ message: req.body });
    } catch (error) {
      // return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  reportUserEmailToAdmin: async (req, res) => {
    try {
      await reportUserNotify(req.body);
      return res.status(200).json({ message: req.body });
    } catch (error) {
      // return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  offPlatformRewardEmailToUser: async (req, res) => {
    try {
      await offPlatformUserNotify(req.body);
      return res.status(200).json({ message: req.body });
    } catch (error) {
      // return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  offPlatformRewardEmailToAdmin: async (req, res) => {
    try {
      await offPlatformAdminNotify(req.body);
      return res.status(200).json({ message: req.body });
    } catch (error) {
      // return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  platformRewardEmailToAdmin: async (req, res) => {
    try {
      await platformAdminNotify(req.body);
      return res.status(200).json({ message: req.body });
    } catch (error) {
      // return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  earnedPoints: async (req, res) => {
    try {
      await earnedPointsNotify(req.body);
      return res.status(200).json({ message: req.body });
    } catch (error) {
      // return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
};
module.exports = methods;
