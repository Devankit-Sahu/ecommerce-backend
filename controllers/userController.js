const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary");

// user register controller
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, phoneNumber } = req.body;

  const avatar = req.file;

  if (!name || !email || !password)
    return next(new ErrorHandler("Please enter name, email and password", 401));

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    return next(new ErrorHandler("Email already is in use!", 401));
  }

  let avatarObj = {};

  if (avatar) {
    const response = await uploadOnCloudinary(avatar.path);
    avatarObj.public_id = response.public_id;
    avatarObj.url = response.secure_url;
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: avatarObj,
    phoneNumber,
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user,
  });
});
// user login controller
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  const isUserExist = await User.findOne({ email }).select("+password");

  if (!isUserExist) {
    return next(new ErrorHandler("User not found", 401));
  }

  const isPasswordMatch = await isUserExist.matchPassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  const accessToken = isUserExist.getAccessToken();
  const refeshToken = isUserExist.getRefreshToken();

  res
    .status(200)
    .cookie("accessToken", accessToken, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      // secure: true,
    })
    .cookie("refreshToken", refeshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      // secure: true,
    })
    .json({
      success: true,
      message: "Logged in successfully",
    });
});
// user logout controller
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("accessToken", { httpOnly: true });
  res.clearCookie("refreshToken", { httpOnly: true });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});
// generating new access token
exports.refreshAccessToken = catchAsyncErrors(async (req, res, next) => {
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
          // sameSite: "Strict",
        })
        .json({
          success: true,
          message: "Access token refresh successfully",
        });
    })
  );
});
// get current user controller
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});
// update user controller
exports.updateUserDetails = catchAsyncErrors(async (req, res, next) => {
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
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
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
// get all user controller (admin)
exports.getAllUsersByAdmin = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});
// get users details controller (admin)
exports.getUserDetailsByAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exit with id:${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});
// delete user controller (admin)
exports.deleteUserByAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User does not  exit with id:${req.params.id}`, 404)
    );
  }
  await User.deleteOne({ _id: req.params.id });
  res.status(200).json({
    success: true,
    message: "User deleted!!!!!!!!!!",
  });
});
