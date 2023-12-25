const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwtToken = require("jsonwebtoken");
const crypto = require("crypto");

// creating user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
    minlength: [5, "Name must be at least 5 characters"],
    maxlength: [50, "Name must be less than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    validate: [validator.isEmail, "Please provide an email"],
    trim: true,
    minlength: [7, "Email must be at least 7 characters"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    enum:["user","admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// resetPasswordtoken:String,
// resetPasswordExpires: Date

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJwtToken = function () {
  return jwtToken.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });
};

module.exports = mongoose.model("User", userSchema);
