const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Database Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log(error);
    process.exit(1); // Exit if connection fails
  }
}

module.exports = connectDB;