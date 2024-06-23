const mongoose = require('mongoose');
const followersData = require('../../models/followersData');

module.exports = {
  followUserStore: async (req, res) => {
    const { followerUserID, authorId } = req.body;
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      const userData = await followersData.find({
        $and: [{ followerUserID }, { authorId }],
      });
      if (userData.length > 0) {
        const result = await followersData.deleteOne({ _id: userData[0]._id });
        res.status(200).json(result);
      } else {
        const result = await followersData.create(req.body);
        res.status(200).json(result);
      }
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  },

  fetchFollowersData: async (req, res) => {
    const { followerUserID, authorId } = req.body;

    try {
      const result = await followersData.find({
        $and: [{ followerUserID }, { authorId }],
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in fetchFollowersData:', error);
      return res.status(500).json({ error: error.message });
    }
  },
};
