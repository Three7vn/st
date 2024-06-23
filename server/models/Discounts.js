const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a schema for your collection
const discountSchema = new Schema({
  discountCode : String , 
  durationStartDate:Number, 
  durationEndDate:Number, 
  cashOffOrder:Number , 
  percent:Number,
});

module.exports = mongoose.model('discount', discountSchema);