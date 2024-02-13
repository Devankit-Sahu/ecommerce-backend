const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Features = require("../utils/features");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary");
const ProductReview = require("../models/productReviewModel");

// creating a new product
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    description,
    categoryId,
    price,
    stock,
    seller,
    productType,
    discountPercent,
    active,
    start,
    end,
  } = req.body;
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

  let discountObj = {};
  if (discountPercent) {
    if (!start || !end)
      return next(
        new ErrorHandler("discount start and end date is missing", 400)
      );
    discountObj.percent = discountPercent;
    discountObj.active = active;
    discountObj.start = start;
    discountObj.end = end;
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
    discount: discountObj,
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
    const productPerPage = 1;
    let features = new Features(Product, req.query);
    if (req.query.key) {
      await features.search();
    } else {
      await features.filter();
    }
    await features.pagination(productPerPage);
    const filteredProducts = await features.query;
    // const filteredProductsCount = filteredProducts.length;
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
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "productreviews",
          localField: "_id",
          foreignField: "productId",
          as: "productReviews",
        },
      },
    ]);
    res.status(200).json({
      success: true,
      products,
    });
  }
});

// getting all products by admin
exports.getAllProductsByAdmin = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.aggregate([
    {
      $lookup: {
        from: "productreviews",
        localField: "_id",
        foreignField: "productId",
        as: "productReviews",
      },
    },
  ]);

  res.status(200).json({
    success: true,
    products,
  });
});

// getting single products
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
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
  let product = await Product.findById(req.params.productId);

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
// add reviews to product
exports.addProductReview = catchAsyncErrors(async (req, res, next) => {
  const { productId, ratings, reviewMessage } = req.body;

  if (!ratings || !reviewMessage) return next(new ErrorHandler("", 400));

  const prodReview = await ProductReview.create({
    reviewerId: req.user._id,
    productId,
    ratings,
    reviewMessage,
  });

  res.status(201).json({
    success: true,
    message: "review added to product",
    prodReview,
  });
});
// get all reviews
exports.getProductsReview = catchAsyncErrors(async (req, res, next) => {
  const allReviews = await ProductReview.find();

  res.status(201).json({
    success: true,
    allReviews,
  });
});
