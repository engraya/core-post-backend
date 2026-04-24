import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import authRouter from './routers/authRouter';
import postRouter from './routers/postRouter';
import userRouter from './routers/userRouter';
import { errorHandler } from './middlewares/errorHandler';

/** Builds the Express app: global middleware, versioned API mounts, and centralized error handling. */
export function createApp() {
  const app = express();

  app.use(compression());
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));

  /** Root/health check returning a small JSON payload. */
  app.get('/', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'Hello from Express' });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/posts', postRouter);
  app.use('/api/v1/users', userRouter);

  app.use(errorHandler);

  return app;
}
