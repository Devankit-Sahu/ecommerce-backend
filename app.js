require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const orderRoute = require("./routes/orderRoute");
const categoryRoute = require("./routes/categoryRoute");

const errorMiddleware = require("./middleware/error");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", productRoute);
app.use("/api/v1", categoryRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);

app.use(errorMiddleware);

module.exports = app;
