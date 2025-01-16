import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



cloudinary.config({ 
    cloud_name: 'di9aghacp', 
    api_key: '683951242862997', 
    api_secret: 'MwSOze0miSSGJQtADoud7BIHDOg' // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File is uploaded on cloudinary", response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export {uploadOnCloudinary}