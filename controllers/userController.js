const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");

// user register controller
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("Email already is in use!", 401));
  }

  if (req.body.avatar) {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "images",
      width: 150,
      crop: "scale",
    });
    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
  }

  user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    user,
  });
});
// user login controller
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorHandler("Please provide correct email and password", 400)
    );
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  const accessToken = user.getAccessToken();
  const refeshToken = user.getRefreshToken();

  res
    .status(200)
    .cookie("accessToken", accessToken, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    })
    .cookie("refreshToken", refeshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
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

// update user controller
exports.updateUserDetails = catchAsyncErrors(async (req, res, next) => {
  const userdata = {
    name: req.body.name,
    email: req.body.email,
  };
  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);
    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "images",
      width: 150,
      crop: "scale",
    });
    userdata.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, userdata, {
    new: true,
  });

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
