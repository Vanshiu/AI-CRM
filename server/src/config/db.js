import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-crm';
    
    // We will attempt to connect to the real MongoDB first.
    // If it fails or is offline, we fallback to the MongoMemoryServer.
    try {
      console.log(`[Database] Attempting connection to local/configured MongoDB at: ${mongoUri}`);
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
      console.log(`[Database] MongoDB Connected successfully to host: ${conn.connection.host}`);
    } catch (connectionError) {
      console.warn(`[Database Warning] Failed to connect to local MongoDB (${connectionError.message}).`);
      console.warn('[Database Warning] Falling back to a seamless in-memory MongoDB database for development/testing!');
      
      mongod = await MongoMemoryServer.create({
        binary: {
          version: '6.0.15'
        }
      });
      const uri = mongod.getUri();
      console.log(`[Database] In-memory MongoDB Server successfully spun up at: ${uri}`);
      
      const conn = await mongoose.connect(uri);
      console.log(`[Database] MongoDB Connected successfully to in-memory database: ${conn.connection.name}`);
    }

    // Setup event listeners for connection persistence
    mongoose.connection.on('error', err => {
      console.error(`[Database Error] Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] Mongoose disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] Mongoose reconnected successfully.');
    });

  } catch (error) {
    console.error(`[Database Error] Failed to configure database: ${error.message}`);
  }
};

export default connectDB;
