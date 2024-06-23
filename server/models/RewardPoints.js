const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a schema for your collection
const rewardPointsSchema = new Schema({
  rewardId: String,
  subscriptionType: String,
  actionType : String,
  rewardPoints : Array,
  rewardType : String,
  rewardExpiry : Number,
});

module.exports = mongoose.model('RewardPoints', rewardPointsSchema);
