import express from "express";
import { config } from "dotenv";
import cloudinary from "cloudinary";
import connectDatabase from "./database/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import errormiddleware from "./middleware/errormiddleware.js";
import Stripe from "stripe";

import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import orderRoute from "./routes/orderRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import statsRoute from "./routes/statsRotue.js";

process.on("uncaughtException", (err) => {
  console.log(`Error : ${err.message}`);
  process.exit(1);
});

config();

connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/stats", statsRoute);

app.use(errormiddleware);

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
