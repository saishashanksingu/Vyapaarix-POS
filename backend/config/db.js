const mongoose=require("mongoose");

let connectionPromise;

const connectDB=async()=>{
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    try{
        connectionPromise = mongoose.connect(
            process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/supermarket",
            { serverSelectionTimeoutMS: 6000 }
        );
        await connectionPromise;
        console.log("MongoDB successfully connected");
        return mongoose.connection;

    }catch(error){
        connectionPromise = null;
        console.error("Database connection failed",error.message);
        throw error;
    }
};

module.exports=connectDB;
