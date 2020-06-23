const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(db, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify:true
    });
    console.log('connected to mongodb succesfully');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
