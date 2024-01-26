const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.verifyToken = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    catchAsyncErrors(async (err, decoded) => {
      if (err) return next(new ErrorHandler("Unauthorized Access", 401));
      const user = await User.findById(decoded.id);
      req.user = user;
      next();
    })
  );
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} are not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
};
