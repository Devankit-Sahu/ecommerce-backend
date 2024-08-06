import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import { User } from "../models/userModel.js";
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";

// register controller
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return next(new ErrorHandler("Please enter name, email and password", 401));

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    return next(new ErrorHandler("Email already is in use!", 401));
  }

  const avatar = req.file;
  let user;

  if (avatar) {
    const response = await uploadOnCloudinary(avatar.path);
    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: response.public_id,
        url: response.secure_url,
      },
    });
  } else {
    user = await User.create({
      name,
      email,
      password,
    });
  }

  const accessToken = user.getAccessToken();
  const refeshToken = user.getRefreshToken();

  res
    .cookie("accessToken", accessToken, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .cookie("refreshToken", refeshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .status(201)
    .json({
      success: true,
      user,
      message: "Account created successfully",
    });
});
// login controller
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 401));
  }

  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  const accessToken = user.getAccessToken();
  const refeshToken = user.getRefreshToken();

  res
    .cookie("accessToken", accessToken, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .cookie("refreshToken", refeshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .status(200)
    .json({
      success: true,
      user,
      message: "Logged in successfully",
    });
});
// logout controller
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});
// generating new access token
export const refreshAccessToken = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return next(new ErrorHandler("Invalid token", 403));
  }
  jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET,
    catchAsyncErrors(async (err, decoded) => {
      if (err) return next(new ErrorHandler("Forbidden", 403));
      const user = await User.findById(decoded.id);
      const accessToken = user.getAccessToken();
      console.log(token, accessToken);
      res
        .status(200)
        .cookie("accessToken", accessToken, {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: true,
        })
        .json({
          success: true,
          message: "Access token refresh successfully",
        });
    })
  );
});
// logged in user controller
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user);

  res.status(200).json({
    success: true,
    user,
  });
});
// update user controller
export const updateUserDetails = catchAsyncErrors(async (req, res, next) => {
  const { name, email, avatar, phoneNumber } = req.body;
  const userdata = {};

  let user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(
      new ErrorHandler("logged in or signup to use this service", 401)
    );
  }

  if (name) {
    userdata.name = name;
  }

  if (email) {
    userdata.email = email;
  }

  if (phoneNumber) {
    userdata.phoneNumber = phoneNumber;
  }

  if (avatar) {
    // if avatar already exists
    if (user.avatar && user.avatar.public_id) {
      const imageId = user.avatar.public_id;
      await cloudinary.v2.uploader.destroy(imageId);
    }
    // upload avatar on cloudinary
    const response = await uploadOnCloudinary(avatar);
    userdata.avatar = {
      public_id: response.public_id,
      url: response.secure_url,
    };
  }

  if (Object.keys(userdata).length > 0) {
    user = await User.findByIdAndUpdate(user._id, userdata, {
      new: true,
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});
// update password
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("old and new password is required", 400));

  const loggedinuser = await User.findById(req.user.id).select("+password");

  if (!loggedinuser) {
    return next(
      new ErrorHandler("logged in or signup to use this service", 400)
    );
  }

  const isPasswordMatch = await loggedinuser.matchPassword(oldPassword);

  if (!isPasswordMatch) {
    return next(
      new ErrorHandler("old password and new password does not match", 400)
    );
  }
  loggedinuser.password = newPassword;

  await loggedinuser.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "password changed successfully",
  });
});
// add shipping info
export const addShippingInfo = catchAsyncErrors(async (req, res, next) => {
  const { address1, address2, city, state, country, pincode } = req.body;

  if (!(address1 || address2) || !city || !state || !country || !pincode) {
    return next(new ErrorHandler("please enter all the fields", 400));
  }

  const user = await User.findById(req.user);

  if (!user) {
    return next(
      new ErrorHandler("logged in or signup to use this service", 401)
    );
  }

  user.shippingInfo = {
    address1,
    address2,
    city,
    state,
    country,
    pincode,
  };

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "shipping info added successfully",
  });
});

// admin routes
// get all user controller
export const getAllUsersByAdmin = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({
    role: {
      $ne: "admin",
    },
  });

  res.status(200).json({
    success: true,
    users,
  });
});
