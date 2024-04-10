import catchAsyncErrors from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorhandler.js";
import { User } from "../models/userModel.js";

export const verifyToken = catchAsyncErrors(async (req, res, next) => {
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
      req.user = user._id;
      next();
    })
  );
});

export const authorizeRoles = (roles = []) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user).select("role");
    if (!roles.includes(user.role)) {
      return next(
        new ErrorHandler(
          `${user.role} are not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
};
