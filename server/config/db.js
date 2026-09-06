// import mongoose from "mongoose";

// const connectDb = async() =>{
//     try {
//         mongoose.connection.on('connected' , () => console.log("database connected"))
//         await mongoose.connect(process.env.MONGODB_URI)
//     }catch(error){
//         console.log(error.message);
        
//     }
// }
// export default connectDb

import mongoose from "mongoose";

const connectDb = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        mongoose.connection.on("connected", () => {
            console.log("MongoDB connected");
        });

        mongoose.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error.message);
        });

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB connection successful");
    } catch (error) {
        console.error("MongoDB connection FAILED:", error.message);
        throw error;
    }
};

export default connectDb;