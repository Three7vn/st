const nodeCron = require('node-cron');
const { deleteRewards } = require('./controller/rewardExpiry');

module.exports = {
  deleteRewardsJob: () => {
    nodeCron.schedule('0 0 * * *', () => {deleteRewards()})
    
  },
};
