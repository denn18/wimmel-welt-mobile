import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getClient, getDatabase } from './config/database.js';
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

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDistPath = path.resolve(currentDir, '../../frontend/dist');
const uploadsDir = path.resolve(currentDir, '../backend/uploads');

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/readiness', async (_req, res) => {
  const checks = { app: 'ok' };

  try {
    const client = getClient();
    if (!client) {
      checks.database = 'not-configured';
      throw new Error('No MongoDB client configured');
    }

    const db = getDatabase();
    const ping = await db.admin().command({ ping: 1 });
    checks.database = ping?.ok === 1 ? 'ok' : 'degraded';

    if (ping?.ok !== 1) {
      throw new Error('MongoDB ping unsuccessful');
    }

    return res.json({ status: 'ok', checks });
  } catch (error) {
    logger.error('Readiness check failed', error);
    return res.status(503).json({ status: 'degraded', checks, message: error.message });
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
