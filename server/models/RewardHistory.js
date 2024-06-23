const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a schema for your collection
const rewardHistorySchema = new Schema({
  userId: String,
  userName: String,
  userEmail: String,
  history : [
    {date : Number, points : Number , spin : Number , action : String , isExpired : Boolean}
  ],
});

module.exports = mongoose.model('RewardHistory', rewardHistorySchema);
