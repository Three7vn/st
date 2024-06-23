const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a schema for your collection
const discountSchema = new Schema({
  discount: Array,
});

module.exports = mongoose.model('discount', discountSchema);
