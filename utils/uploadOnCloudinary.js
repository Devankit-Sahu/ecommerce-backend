const cloudinary = require("cloudinary");
const fs = require("fs");

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.v2.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "e-comm-files",
    });
    fs.unlinkSync(filePath);
    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    fs.unlinkSync(filePath);
    throw error;
  }
};

module.exports = uploadOnCloudinary;
