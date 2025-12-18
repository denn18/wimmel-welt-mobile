// backend/src/config/connectToMongoDB.js
import { MongoClient } from 'mongodb';
import { logger } from '../utils/logger.js';

let client = null;
let db = null;

function buildMongoUrlFromParts() {
  const protocol = (process.env.MONGODB_PROTOCOL || '').trim();
  const host = (process.env.MONGODB_HOST || '').trim();
  const username = process.env.MONGODB_USERNAME?.trim();
  const password = process.env.MONGODB_PASSWORD?.trim();
  const port = process.env.MONGODB_PORT?.trim();
  const dbName = process.env.MONGODB_DB_NAME?.trim();
  const authSource = process.env.MONGODB_AUTH_SOURCE?.trim();
  const options = process.env.MONGODB_OPTIONS?.trim();

  if (!protocol || !host) return '';

  const auth = username && password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';
  const portSegment = port && protocol === 'mongodb' ? `:${port}` : '';
  const dbSegment = dbName ? `/${dbName}` : '';

  const optionParts = [];
  if (authSource) optionParts.push(`authSource=${encodeURIComponent(authSource)}`);
  if (options) optionParts.push(options);
  const optionSegment = optionParts.length ? `?${optionParts.join('&')}` : '';

  return `${protocol}://${auth}${host}${portSegment}${dbSegment}${optionSegment}`;
}

function readMongoUrl() {
  return (
    process.env.MONGO_DB_URL || // wie früher
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    buildMongoUrlFromParts() ||
    ''
  ).trim();
}

export async function connectToMongoDB() {
  if (db) return db; // Singleton

  const uri = readMongoUrl();
  if (!uri) {
    logger.warn('No MongoDB URL found. Set MONGO_DB_URL (oder MONGODB_URI) in backend/.env');
    return null;
  }

  logger.info('🔌 DB URL verwendet:', uri.startsWith('mongodb+srv://') ? 'mongodb+srv' : 'mongodb');

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
  });

  await client.connect();

  const dbName = process.env.MONGO_DB_NAME || undefined;
  db = client.db(dbName);

  const ping = await db.admin().command({ ping: 1 });
  logger.info(`✅ Connected to MongoDB (database: ${db.databaseName || '(in URI)'}), ping.ok=${ping?.ok}`);

  return db;
}

export function getDatabase() {
  if (!db) throw new Error('Database ist noch nicht verbunden. connectToMongoDB() zuerst aufrufen.');
  return db;
}

export function getClient() {
  return client;
}
