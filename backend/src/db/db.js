import mongoose from "mongoose"

const connectToDb = async() => {
    try{
        const connectionInstance = await mongoose.connect("mongodb+srv://anshupat2020:cjta83Z9YNbRhG_@cluster0.4xaw1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log(`MongoDb connected: ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("MongoDb conndection failed",error);
        process.exit(1);    
    }
}

export default connectToDb;