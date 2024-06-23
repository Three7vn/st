const { types } = require('sharetribe-flex-integration-sdk');
const { getIntegrationSdk } = require('../../api-util/sdk');
const isdk = getIntegrationSdk();
const { UUID } = types;

const rewards = {
    rewardsPoint: async (req, res) => {
        const { planName, type, userId, rewardsPoint = -1, spin = -1 , firstTx  } = req.body; // Ensure userId is provided in the request body
    
        try {
            let rewardValue = rewardsPoint;

            // Modify rewardValue based on the type
            switch (type) {
                case 'add':
                    // rewardValue remains positive
                    break;
                case 'subtract':
                    rewardValue = -rewardValue;
                    break;
                default:
                    break
            }

            // Fetch current user profile
            const userProfile = await isdk.users.show({ id: new UUID(userId) });
            const currentPoints = userProfile?.data?.data?.attributes?.profile?.publicData?.rewardsWallet || 0;
            const currentSpin = userProfile?.data?.data?.attributes?.profile?.publicData?.spin || spin;

            // Update rewardsPoint
            const updatedPoints = currentPoints + rewardValue;


            // Save updated points and spin to user profile
            await isdk.users.updateProfile({
              id: new UUID(userId),
              publicData: {
                ...(rewardsPoint >= 0 && {rewardsWallet: updatedPoints}),
                ...(spin >= 0 && { spin }),
                ...(firstTx && { firstTx: firstTx }),
              },
            });
    
            res.status(200).json({ updatedPoints, spin: spin });
        } catch (error) {
            console.log('Error updating rewards point:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};

module.exports = rewards;