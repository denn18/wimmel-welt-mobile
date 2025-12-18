import './config/load-env.js';
import http from 'http';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 2000;

async function startServer() {
  try {
    await connectDatabase();
    const server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
