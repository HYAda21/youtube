import { v2  as cloudinary} from "cloudinary";
import fs from "fs";

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    })

    const uploadOnCloudnary = async (localFilePath) =>{
        try {
            if(!localFilePath) return null
            // upload the file on cloundnary
          const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type: "auto"
            })
            //file has been uploaded successfuly
            console.log("fill has been uploadeed on cloudnary",response.url);
            return response;
        } catch (error) {
            fs.unlinkSync(localFilePath) // remove the loccally 
            // save temporay file as 
            // the upload operation get failed
        }
    }
    
    export {uploadOnCloudnary}
   