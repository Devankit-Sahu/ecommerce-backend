const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
