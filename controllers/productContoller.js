const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Features = require("../utils/features");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary");
// creating a new product
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, description, categoryId, price, stock, seller, productType } =
    req.body;
  const productImages = req.files;

  if (
    !name ||
    !description ||
    !categoryId ||
    !price ||
    !stock ||
    !seller ||
    !productImages.length
  )
    return next(
      new ErrorHandler(
        "product name,description,price,stock,seller,images are required fields",
        400
      )
    );

  let productImagesLink = [];
  // uplading images to cloudinary
  for (let i = 0; i < productImages.length; i++) {
    const result = await uploadOnCloudinary(productImages[i].path);
    productImagesLink.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  const product = await Product.create({
    name,
    description,
    categoryId,
    price,
    stock,
    seller,
    productType,
    images: productImagesLink,
  });

  res.status(201).json({
    success: true,
    message: "Product created succesfully !!!",
    product,
  });
});

// getting all products by normal users
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  if (req.query && Object.keys(req.query).length > 0) {
    const productPerPage = 5;
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

  const productImages = req.files;

  let productImagesLink = [];
  if (productImages !== undefined) {
    // uplading images to cloudinary
    for (let i = 0; i < productImages.length; i++) {
      const result = await uploadOnCloudinary(productImages[i].path);
      productImagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  const updatedImages = [...product.images, ...productImagesLink];

  product = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body, images: updatedImages },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    product,
  });
});

// deleting the product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  // deleting images form  the cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  await Product.deleteOne({ _id: product._id });

  res.status(200).json({
    success: true,
    message: "Product deleted !!!",
  });
});
