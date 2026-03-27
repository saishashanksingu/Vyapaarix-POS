const mongoose=require("mongoose");

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/supermarket");
        console.log("MongoDB successfully connected");

    }catch(error){
        console.error("Database connection failed",error.message);
        process.exit(1);
    }
};

module.exports=connectDB;
