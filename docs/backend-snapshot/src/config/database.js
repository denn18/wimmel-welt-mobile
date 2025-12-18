// backend/src/config/database.js
import { connectToMongoDB, getDatabase as _getDb, getClient } from './connectToMongoDB.js';

export async function connectDatabase() {
  const connection = await connectToMongoDB();
  if (!connection) {
    throw new Error('MongoDB connection could not be established.');
  }

  return connection;
}

export function getDatabase() {
  return _getDb();
}

export { getClient };
