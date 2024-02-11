const cloudinary = require("cloudinary");

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.v2.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "e-comm-files",
    });
    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    throw error;
  }
};

module.exports = uploadOnCloudinary;
