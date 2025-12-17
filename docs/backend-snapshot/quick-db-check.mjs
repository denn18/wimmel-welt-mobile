import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_DB_URL || process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGO_DB_URL fehlt');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
});

try {
  await client.connect();
  const db = client.db(process.env.MONGO_DB_NAME || undefined);
  const ping = await db.admin().command({ ping: 1 });
  const colls = await db.listCollections().toArray();
  const connected = client.topology?.isConnected ? client.topology.isConnected() : true;
  console.log('connected:', connected);
  console.log('ping:', ping); // { ok: 1 }
  console.log('collections:', colls.map((c) => c.name));
  await client.close();
  process.exit(0);
} catch (e) {
  console.error('Fehler:', e?.message || e);
  process.exit(1);
}
