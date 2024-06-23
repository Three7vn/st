const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a schema for your collection
const orderNumberSchema = new Schema({
  orderNumber: Number,
});

module.exports = mongoose.model('OrderNumber', orderNumberSchema);
