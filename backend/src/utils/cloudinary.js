import {v2 as cloudinary} from "cloudinary";
import fs from "fs"



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
     });


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}
 
const deleteFromCloudinary = async(publicId,resourceType = "image") => {
    if(!publicId) return null
    try {
        const response = await cloudinary.uploader.destroy(publicId,{
            resource_type:resourceType,
            invalidate: true
        })
        return response.result === "ok"
    } catch (error) {
        console.log("Error in deleting from cloudinary: ", error)
        return false
    }
}


export {cloudinary, uploadOnCloudinary,deleteFromCloudinary}