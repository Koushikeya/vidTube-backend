import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { resourceUsage } from "process";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {

    try {
        if(!localFilePath) return null
        // upload a file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // upload is successful
        
        // console.log("File is uploaded at: ",response.url);
        fs.unlinkSync(localFilePath)
        
    } catch (error) {
        fs.unlinkSync(localFilePath) 
        // this remove the temporary file from the local server 
        return null;
    }
}

export { uploadOnCloudinary } 