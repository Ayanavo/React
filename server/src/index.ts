import 'dotenv/config'; // Load environment variables
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './utils/db.js'; // Import the MongoDB connection utility
import activityRoutes from './routes/activityRoutes.js'; // Import the new activity routes

const app = express();
const PORT = Number(process.env.PORT) || 5000; // Convert PORT to a number
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Use the /api/activities route
app.use('/api/activities', activityRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Hello from Express with TypeScript and ES6!');
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});