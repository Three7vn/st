const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a schema for your collection
const redeemedVouhersHistorySchema = new Schema({
  userId: String,
  history: [
    { date: Number, voucherName: String, types: String, isUsed: Boolean , voucherType: String ,voucherValue : Number , voucherValueType : String, isExpired : Boolean , isSellingFees : Boolean}
  ],
});

module.exports = mongoose.model('RedeemedVouchers', redeemedVouhersHistorySchema);