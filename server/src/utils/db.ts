import mongoose from "mongoose";
import "dotenv/config";

// Load the MongoDB connection string from the environment variables
const MONGODB_URI = process.env.MONGODB_URI as string;

// Throw an error if the connection string is not defined
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables.");
}

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to MongoDB using the connection string with improved options
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 50, // Maintain up to 50 socket connections
    });

    // Add connection error handler
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    // Add disconnection handler
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected. Attempting to reconnect...");
    });

    // Add successful reconnection handler
    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected successfully.");
    });

    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Instead of exiting, we'll throw the error to be handled by the caller
    throw error;
  }
};

// Export the connectDB function
export default connectDB;
