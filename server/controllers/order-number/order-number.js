const mongoose = require('mongoose');
const OrderNumber = require('../../models/OrderNumber');
const RewardPoints = require('../../models/RewardPoints');
const RewardHistory = require('../../models/RewardHistory');
const Discounts = require('../../models/Discounts');
const Voucher = require('../../models/Voucher');
const RedeemedVouchers = require('../../models/RedeemedVouchers');
// const Coupon = require('../../models/Coupon');

module.exports = {
  addOrUpdateOrderNumber: async (req, res) => {
    const { orderNumber } = req.body;
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      // // Find and update the document
      const result = await OrderNumber.findOneAndUpdate(
        { $set: { orderNumber } } // return the updated document
      );
      if (!result) {
        await OrderNumber.create({ orderNumber });
      }
      res.status(200).json({ count: result?.orderNumber });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  fetchOrderNumber: async (req, res) => {
    try {
      const result = await OrderNumber.findOne();
      if (result) {
        res.status(200).json({ orderNumber: result?.orderNumber });
      } else {
        res.status(200).json('Order number not avaivlbe');
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  fetchRewardPoints: async (req, res) => {
    const { rewardId } = req.body;
    try {
      const result = await RewardPoints.findOne({ rewardId: rewardId });
      if (result) {
        res.status(200).json({ rewardPoints: result?.rewardPoints });
      } else {
        res.status(200).json('Rewards Points not avaivlbe');
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  updateRewardHistoryPoints: async (req, res) => {
    try {
      const date = new Date().getTime();
      const { userId = '', userEmail = '', action = '', userName, points, spin = null, isExpired = false } = req.body;

      if ((!userEmail && !userId) || (!action && !userName)) {
          return res.status(400).json({ message: 'Invalid request.' });
      }

      const updateQueryParam = {
          $set: { 
              userName,
              userEmail: userEmail.toLowerCase()
          },
          $push: { 
              history: { date, points, action, spin, isExpired }
          },
      };

      const response = await RewardHistory.findOneAndUpdate(
          { userId: userId },
          updateQueryParam,
          { upsert: true, new: true } // Added `new: true` to return the modified document
      );

      if (!response?._id) {
          return res.status(400).json({ message: 'Error updating reward history!' });
      }

      return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
      console.error('Error updating reward history:', error); // Added more detailed logging
      return res.status(500).json({ error: error.message });
  }
  },

  addOrUpdateDiscounts: async (req, res) => {
    const { newDiscount, deletedDiscountCode, findDiscount } = req.body;
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      if (deletedDiscountCode) {
        const result = await Discounts.deleteOne({ discountCode: deletedDiscountCode });
        res.status(200).json({ data: result });
      } else if (findDiscount) {
        const result = await Discounts.findOne({ discountCode: findDiscount?.discountCode });
        if (result) {
          res.status(200).json({ count: result });
        } else {
          res.status(200).json('Rewards Points not available');
        }
      } else {
        // Find and update the document
        const result = await Discounts.findOneAndUpdate(
          { discountCode: newDiscount?.discountCode },
          { $set: newDiscount },
          { upsert: true }
        );
        res.status(200).json({ count: result });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  fetchDiscount: async (req, res) => {
    try {
      const result = await Discounts.find();
      if (result) {
        res.status(200).json({ result });
      } else {
        res.status(200).json('Rewards Points not available');
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  fetchVouchers: async (req, res) => {
    try {
      const result = await Voucher.find();
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(200).json('Vouchers not available');
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  updateRedeemedVouchersHistoryPoints: async (req, res) => {
    try {
      const date = new Date().getTime();

      const {
        userId,
        type = '',
        voucherName,
        isUsed = false,
        voucherType,
        voucherValue,
        voucherValueType,
        isSellingFees = false
      } = req.body;

      if (!userId || (!type && !voucherName && !voucherType))
        return res?.status(400).json({ message: 'Invalid request.' });

      const updateQueryParam = {
        $set: { userId },
        $push: {
          history: {
            date: date,
            types: type,
            voucherName,
            isUsed,
            voucherType,
            voucherValue,
            voucherValueType,
            isSellingFees
          },
        },
      };

      const response = await RedeemedVouchers.findOneAndUpdate(
        { userId: userId },
        updateQueryParam,
        { upsert: true }
      );

      return res ? res.status(200).json({ message: 'User updated successfully' }) : '';
    } catch (error) {
      console.log('error :>> ', error);
      return res.status(500).json({ error: error.message });
    }
  },

  fetchRedeemedVouchers: async (req, res) => {
    const { userId } = req.body;
    try {
      const result = await RedeemedVouchers.findOne({ userId: userId });
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(200).json('Vouchers not available');
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  updateRedeemedVoucher: async (req, res) => {
    try {
      const { userId, historyId, isUsed } = req.body; // Assuming you pass historyId and isUsed in the request body
      


      if (!userId || !historyId || typeof isUsed === 'undefined') {
        return res?.status(400).json({ message: 'Invalid request.' });
      }

      const response = await RedeemedVouchers.findOneAndUpdate(
        { userId: userId, 'history._id': historyId },
        { $set: { 'history.$.isUsed': isUsed } },
        { new: true } // This option returns the modified document
      );

      if (!response) {
        return res?.status(404).json({ message: 'User or history entry not found.' });
      }

      return res
        ? res.status(200).json({ message: 'History updated successfully', data: response })
        : '';
    } catch (error) {
      console.log('error :>> ', error);
      return res.status(500).json({ error: error.message });
    }
  },
};
