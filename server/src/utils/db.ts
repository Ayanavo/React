import mongoose from 'mongoose';
import 'dotenv/config';

// Load the MongoDB connection string from the environment variables
const MONGODB_URI = process.env.MONGODB_URI as string;

// Throw an error if the connection string is not defined
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in the environment variables.');
}

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to MongoDB using the connection string
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if the connection fails
  }
};

// Export the connectDB function
export default connectDB;