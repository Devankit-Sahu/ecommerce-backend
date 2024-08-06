import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import { Product } from "../models/productModel.js";
import { ProductReview } from "../models/productReviewModel.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";
import Features from "../utils/features.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// getting all products
export const getAllProducts = catchAsyncErrors(async (req, res, next) => {
  if (req.query && Object.keys(req.query).length > 0) {
    const productPerPage = 8;
    let features = new Features(Product, req.query);
    let filteredProducts = [];
    if (req.query.key) {
      await features.search();
    } else {
      await features.filter();
    }
    filteredProducts = await features.query;
    const productsCount = filteredProducts.length;
    const totalPages = Math.ceil(productsCount / productPerPage);
    await features.pagination(productPerPage);
    filteredProducts = await features.query;
    res.status(200).json({
      success: true,
      products: filteredProducts,
      productPerPage,
      productsCount,
      totalPages,
    });
  }
});
// getting all products by product type
export const getProductsByProductType = catchAsyncErrors(
  async (req, res, next) => {
    const { productType } = req.params;
    if (!productType)
      return next(new ErrorHandler("product type is missing", 400));

    const products = await Product.find({ productType }).limit(8);

    res.status(200).json({ success: true, products });
  }
);
// getting single products
export const getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  if (!productId) {
    return next(new ErrorHandler("invalid product id", 404));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = await ProductReview.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        ratings: 1,
        message: 1,
        createdAt: 1,
        user: {
          _id: 1,
          name: 1,
          avatar: 1,
        },
      },
    },
  ]);

  const totalRatings = reviews.reduce(
    (total, review) => total + review.ratings,
    0
  );
  const totalRatingsDecimal =
    reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : 0.0;

  res.status(200).json({
    success: true,
    product,
    reviews,
    totalRatings,
    totalRatingsDecimal,
  });
});
// add reviews to product
export const addProductReview = catchAsyncErrors(async (req, res, next) => {
  const { productId, ratings, message } = req.body;

  if (!productId) return next(new ErrorHandler("product id is missing", 400));

  const product = await Product.findById(productId);

  if (!product) return next(new ErrorHandler("invalid product id", 400));

  if (!message) return next(new ErrorHandler("enter review", 400));

  const prodReview = await ProductReview.create({
    userId: req.user,
    productId,
    ratings,
    message,
  });

  res.status(201).json({
    success: true,
    message: "review added",
    prodReview,
  });
});

// admin controller
// creating a new product
export const createProductByAdmin = catchAsyncErrors(async (req, res, next) => {
  const { name, description, category, price, stock, seller, productType } =
    req.body;

  if (!name) return next(new ErrorHandler("product name is required", 400));

  if (!description)
    return next(new ErrorHandler("product description is required", 400));

  if (!category)
    return next(new ErrorHandler("product category is required", 400));

  if (!price) return next(new ErrorHandler("product price is required", 400));

  if (!stock) return next(new ErrorHandler("product stock is required", 400));

  if (!seller) return next(new ErrorHandler("product seller is required", 400));

  const productImages = req.files;

  // uplading images to cloudinary
  const uploadPromises = productImages.map(async (image) => {
    const result = await uploadOnCloudinary(image.path);
    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  });

  const productImagesLink = await Promise.all(uploadPromises);

  const product = await Product.create({
    name,
    description,
    category,
    price,
    stock,
    seller,
    productType,
    images: productImagesLink,
  });

  res.status(201).json({
    success: true,
    message: "Product created succesfully",
    product,
  });
});
// getting all products
export const getAllProductsByAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      products,
    });
  }
);
// getting single products
export const getSingleProductByAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const { productId } = req.params;

    if (!productId) {
      return next(new ErrorHandler("invalid product id", 404));
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  }
);
// updating the product
export const updateProductByAdmin = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  if (!productId)
    return next(new ErrorHandler("productId is invalid or missing", 400));

  let product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const productImages = req.files || [];
  const productUpdate = { ...req.body };

  if (productImages.length > 0) {
    // uplading images to cloudinary
    const uploadPromises = productImages.map(async (image) => {
      const result = await uploadOnCloudinary(image.path);
      return {
        public_id: result.public_id,
        url: result.secure_url,
      };
    });
    const uploadedImages = await Promise.all(uploadPromises);
    productUpdate.images = [...product.images, ...uploadedImages];
  }

  product = await Product.findByIdAndUpdate(
    productId,
    { ...productUpdate },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "product updated",
    product,
  });
});
// deleting the product
export const deleteProductByAdmin = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  if (!productId) return next(new ErrorHandler("product id is missing", 400));

  let product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  // deleting images form  the cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }
  // deleting product related reviews
  await ProductReview.deleteMany({ productId: productId });

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted",
  });
});
