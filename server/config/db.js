const mongoose = require('mongoose');
const db = process.env.MONGO_DB_URL;

module.exports = {
  connectDB: async () => {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(db, {
      });
      console.log('Database connection established');
    } catch (error) {
      console.log(error.message, 'errrors');
    }
  },
};
