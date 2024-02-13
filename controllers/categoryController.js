const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Category = require("../models/categoryModel");
const ErrorHandler = require("../utils/errorhandler");

exports.addCategory = catchAsyncErrors(async (req, res, next) => {
  const { categoryName } = req.body;
  const category = await Category.findOne({ categoryName });
  if (category) {
    return next(new ErrorHandler("Category already exist", 400));
  }
  await Category.create({
    categoryName,
  });

  res.status(201).json({
    success: true,
    message: "Category created",
  });
});

exports.getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const allCategories = await Category.find();
  res.status(200).json({
    success: true,
    allCategories,
  });
});

exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const categoryId = await Category.findById(req.params.categoryId);
  const category = await Category.findById(categoryId);
  if (!category) return next(new ErrorHandler("cateogry not found", 400));
  await Category.deleteOne({ _id: categoryId });
  res.status(200).json({
    success: true,
    message: "Category deleted !!!",
  });
});
