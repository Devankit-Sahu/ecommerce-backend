import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import { Category } from "../models/categoryModel.js";

export const addCategoryByAdmin = catchAsyncErrors(async (req, res, next) => {
  const { categoryName } = req.body;
  if (!categoryName)
    return next(new ErrorHandler("provide category name", 400));

  const category = await Category.findOne({ categoryName });
  if (category) return next(new ErrorHandler("Category already exist", 400));

  await Category.create({
    categoryName,
  });

  res.status(201).json({
    success: true,
    message: "Category created",
  });
});

export const getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const allCategories = await Category.find();
  res.status(200).json({
    success: true,
    allCategories,
  });
});

export const getAllCategoriesByAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const allCategories = await Category.find();
    res.status(200).json({
      success: true,
      allCategories,
    });
  }
);

export const deleteCategoryByAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const { categoryId } = req.params;

    if (!categoryId)
      return next(new ErrorHandler("cateogry id is missing", 400));

    const category = await Category.findById(categoryId);

    if (!category) return next(new ErrorHandler("cateogry not found", 400));

    await Category.deleteOne({ _id: categoryId });

    res.status(200).json({
      success: true,
      message: "Category deleted",
    });
  }
);
