import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/servicedesk";
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;
