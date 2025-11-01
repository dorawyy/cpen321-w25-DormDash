import dotenv from 'dotenv';
import express from 'express';

import { connectDB } from './config/database';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler.middleware';
import router from './routes/routes';
import path from 'path';
import { initSocket } from './socket';
import logger from './utils/logger.util';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use('/api', router);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('*', notFoundHandler);
app.use(errorHandler);

connectDB().catch((error: unknown) => {
  logger.error('Failed to connect to database:', error);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

const io = initSocket(server);

logger.info(`Socket.io ${io ? 'initialized' : 'failed to initialize'}`);
