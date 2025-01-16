import mongoose from "mongoose"

const connectToDb = async() => {
    try{
        const connectionInstance = await mongoose.connect("mongodb://localhost:27017");
        console.log(`MongoDb connected: ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("MongoDb conndection failed",error);
        process.exit(1);    
    }
}

export default connectToDb;