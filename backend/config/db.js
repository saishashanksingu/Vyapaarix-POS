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
        // Support Railway MongoDB plugin, standard MONGODB_URI, and local development
        let mongoUri = process.env.MONGODB_URI;
        
        // Railway provides DATABASE_URL for MongoDB plugin
        if (!mongoUri && process.env.DATABASE_URL) {
            mongoUri = process.env.DATABASE_URL;
        }
        
        // Fallback for local development
        if (!mongoUri) {
            mongoUri = "mongodb://127.0.0.1:27017/supermarket";
        }

        console.log("Connecting to MongoDB...");
        connectionPromise = mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority'
        });
        
        await connectionPromise;
        console.log("✅ MongoDB successfully connected");
        return mongoose.connection;

    }catch(error){
        connectionPromise = null;
        console.error("❌ Database connection failed:", error.message);
        throw error;
    }
};

module.exports=connectDB;
