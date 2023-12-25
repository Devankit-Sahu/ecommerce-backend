const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: { type: String, unique: true },
  categoryImage: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

module.exports = mongoose.model("Category", categorySchema);
