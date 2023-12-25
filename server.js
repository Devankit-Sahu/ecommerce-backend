require("dotenv").config();
const app = require("./app");
const connectDatabase = require("./database/database");
const cloudinary = require("cloudinary");
process.on("uncaughtException", (err) => {
  console.log(`Error : ${err.message}`);
  process.exit(1);
});

connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
const server = app.listen(process.env.PORT || 4000, () => {
  console.log(`server is working on http://localhost:${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log("Shutting down the server");
  server.close(() => {
    process.exit(1);
  });
});
