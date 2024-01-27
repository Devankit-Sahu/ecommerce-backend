const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Features = require("../utils/features");
const cloudinary = require("cloudinary");

// creating a new product
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  let prodImages = [];
  if (typeof req.body.images === "string") {
    prodImages.push(req.body.images);
  } else {
    prodImages = req.body.images;
  }
  let prodImagesLinks = [];
  for (let i = 0; i < prodImages.length; i++) {
    const result = await cloudinary.v2.uploader.upload(prodImages[i], {
      folder: "products",
    });
    prodImagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  req.body.images = prodImagesLinks;
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    message: "Product created succesfully !!!",
    product,
  });
});

// getting all products by normal users
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  if (req.query && Object.keys(req.query).length > 0) {
    const productPerPage = 10;
    let features = new Features(Product, req.query);
    features = features.search().filter().pagination(productPerPage);
    const filteredProducts = await features.query;
    const filteredProductsCount = await Product.countDocuments(
      features.query._conditions
    );
    const totalPages = Math.ceil(filteredProductsCount / productPerPage);
    res.status(200).json({
      success: true,
      filteredProducts,
      productPerPage,
      filteredProductsCount,
      totalPages,
    });
  } else {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      products,
    });
  }
});

// getting all products by admin
exports.getAllProductsByAdmin = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    products,
  });
});

// getting single products
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// updating the product
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  let prodImages = [];
  if (typeof req.body.images === "string") {
    prodImages.push(req.body.images);
  } else {
    prodImages = req.body.images;
  }

  if (prodImages !== undefined) {
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }
    let prodImagesLinks = [];
    for (let i = 0; i < prodImages.length; i++) {
      const result = await cloudinary.v2.uploader.upload(prodImages[i], {
        folder: "products",
      });
      prodImagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images = prodImagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// deleting the product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let productId = await Product.findById(req.params.id);

  if (!productId) {
    return next(new ErrorHandler("Product not found", 404));
  }

  for (let i = 0; i < productId.images.length; i++) {
    await cloudinary.v2.uploader.destroy(productId.images[i].public_id);
  }

  await Product.deleteOne({ _id: productId });

  res.status(200).json({
    success: true,
    message: "Product deleted !!!",
  });
});
