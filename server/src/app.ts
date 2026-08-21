import cors from 'cors';
import type { CorsOptions } from 'cors';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';

const corsOptions: CorsOptions = {
  credentials: true,

  origin(requestOrigin, callback) {
    const isAllowed = requestOrigin === undefined || requestOrigin === env.CLIENT_ORIGIN;

    callback(null, isAllowed);
  },
};

export const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: '10kb',
  })
);

app.use(cookieParser());

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);

app.use(notFound);
app.use(errorHandler);
