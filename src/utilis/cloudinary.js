// src/utilis/cloudnary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config( {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // ✅ Delete local file after upload
    fs.unlinkSync(localFilePath);

   // console.log("File uploaded to Cloudinary:", response.url);
    return response;

  } catch (error) {
    console.error(" Cloudinary Upload Error:", error);

    // Remove the file only if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };

   