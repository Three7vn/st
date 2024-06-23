const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a schema for your collection
const followersDataSchema = new Schema({
  followerUserID: String,
  followerFirstName: String,
  followerEmailId: String,
  authorId: String,
});

module.exports = mongoose.model('followersData', followersDataSchema);
