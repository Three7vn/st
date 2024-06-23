const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a schema for your collection
const voucherSchema = new Schema({
  voucherImage: String,
  voucherName: String,
  voucherPoints : Number,
  voucherSize : String,
  voucherType : String,
  voucherValue : Number,
  voucherValueType : String,
});

module.exports = mongoose.model('Voucher', voucherSchema);