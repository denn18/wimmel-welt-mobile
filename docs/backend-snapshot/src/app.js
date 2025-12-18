import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

import caregiversRouter from './routes/caregivers.js';
import parentsRouter from './routes/parents.js';
import matchesRouter from './routes/matches.js';
import messagesRouter from './routes/messages.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import documentsRouter from './routes/documents.js';
import filesRouter from './routes/files.js';

const app = express();

const allowedOrigins = new Set(['https://www.wimmel-welt.de']);
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // Native apps may not send an Origin header
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use((err, _req, res, next) => {
  if (err?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'CORS origin denied' });
  }

  return next(err);
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDistPath = path.resolve(currentDir, '../../frontend/dist');
const uploadsDir = path.resolve(currentDir, '../backend/uploads');

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/readiness', async (_req, res) => {
  const checks = { database: 'error' };

  try {
    const db = getDatabase();
    await db.admin().command({ ping: 1 });
    checks.database = 'ok';
    return res.status(200).json({ status: 'ok', checks });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Readiness check failed', error);
    return res.status(503).json({ status: 'error', checks, error: message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/caregivers', caregiversRouter);
app.use('/api/parents', parentsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/files', filesRouter);
app.use('/uploads', express.static(uploadsDir));

app.use(express.static(frontendDistPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

export default app;
