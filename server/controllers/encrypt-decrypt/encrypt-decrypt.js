
const jwt = require('jsonwebtoken');
const secretKey = 'xaUcwLBaYprBPUG'; 

module.exports = {
  encryptWalletAddress: async (req, res) => {
    const { walletAddress } = req.body;
    try {
      const token = jwt.sign(walletAddress, secretKey);
      return res.status(201).json(token);
    } catch (error) {
      console.log(error, 'error');
    }
  },

  decryptWalletAddress: async (req, res) => {
    const { cryptoWalletAddress } = req.body;
    try {
        const decryptedId = jwt.verify(cryptoWalletAddress, secretKey);
      return res.status(201).json(decryptedId);
    } catch (error) {
      console.log(error, 'error');
    }
  },

};