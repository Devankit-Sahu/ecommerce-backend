const mongoose = require("mongoose");

const connectDatabase = async () => {
  await mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("Mongodb is connected");
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
};

module.exports = connectDatabase;
