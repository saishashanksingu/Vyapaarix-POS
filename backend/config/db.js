const mongoose = require("mongoose");

let connectionPromise;

const normalizeMongoUri = (mongoUri) => {
  if (!mongoUri) {
    return mongoUri;
  }

  try {
    const uri = new URL(mongoUri);
    const isMongoProtocol = uri.protocol === "mongodb:";
    const hasCredentials = Boolean(uri.username || uri.password);
    const isLocalHost = ["localhost", "127.0.0.1", "mongodb"].includes(uri.hostname);

    if (isMongoProtocol && hasCredentials && !isLocalHost && !uri.searchParams.has("authSource")) {
      uri.searchParams.set("authSource", "admin");
      return uri.toString();
    }
  } catch (error) {
    return mongoUri;
  }

  return mongoUri;
};

const describeMongoUri = (mongoUri) => {
  try {
    const uri = new URL(mongoUri);
    return `${uri.protocol}//${uri.hostname}${uri.port ? `:${uri.port}` : ""}${uri.pathname}`;
  } catch (error) {
    return "configured MongoDB URI";
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri && process.env.DATABASE_URL) {
      mongoUri = process.env.DATABASE_URL;
    }

    if (!mongoUri) {
      mongoUri = "mongodb://127.0.0.1:27017/supermarket";
    }

    mongoUri = normalizeMongoUri(mongoUri);

    console.log(`Connecting to MongoDB: ${describeMongoUri(mongoUri)}`);
    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: "majority",
    });

    await connectionPromise;
    console.log("MongoDB successfully connected");
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
