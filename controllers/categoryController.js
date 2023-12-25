const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Category = require("../models/categoryModel");
const ErrorHandler = require("../utils/errorhandler");
const cloudinary = require("cloudinary");

exports.addCategory = catchAsyncErrors(async (req, res, next) => {
  const { categoryName } = req.body;
  const myCloud = await cloudinary.v2.uploader.upload(req.body.categoryImage, {
    folder: "category",
    width: 150,
    crop: "scale",
  });
  const category = await Category.findOne({ categoryName });
  if (category) {
    return next(new ErrorHandler("Category already exist", 400));
  }

  await Category.create({
    categoryName,
    categoryImage: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Category Added!!!",
  });
});

exports.getAllCategories = catchAsyncErrors(async (req, res) => {
  const allCategories = await Category.find();

  res.status(201).json({
    success: true,
    allCategories,
  });
});

exports.deleteCategory = catchAsyncErrors(async (req, res) => {
  const categoryId = await Category.findById(req.params.id);
  const category = await Category.findById(categoryId);
  console.log(category);
  await Category.deleteOne({ _id: categoryId });
  res.status(200).json({
    success: true,
    message: "Category deleted !!!",
  });
});
