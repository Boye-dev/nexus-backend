// Database Configuration files
const mongoose = require("mongoose");
const { MONGODB_URI } = process.env;

//To disable buffering
// mongoose.set("bufferCommands", false);

exports.connectToDB = async () => {
  //To disable buffering
  // mongoose.set("bufferCommands", false);

  //Connecting to the database.
  await mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`Successfully connected to MongoDB @ ${MONGODB_URI}`);
    })
    .catch((err) => {
      console.log("Error connecting to database: ", err);
      throw new Error(err);
    });
};

exports.closeDBConnection = () => {
  return mongoose.disconnect();
};
