import mongoose from "mongoose" 
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n The DB is connected to host ${connectionInstance.connection.host}`);
        

    } catch (error) {
        console.log("The error is: ",error);
        process.exit(1)
        
    }    
}

export default connectDB