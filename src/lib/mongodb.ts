import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  (process.env.NODE_ENV === 'production' ? '' : 'mongodb://localhost:27017');
const DB_NAME = process.env.MONGODB_DB_NAME || 'grafi_ai';

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return mongoose;
  }

  // Checked at call time (not import time) so `next build` works without the variable set
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to your deployment environment variables.');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      bufferCommands: false,
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    return mongoose;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export default connectDB;
