import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOrigins, env } from './env';
import { authRouter } from './routes/auth';
import { plansRouter } from './routes/plans';
import { paymentsRouter } from './routes/payments';
import { analyzeRouter } from './routes/analyze';
import { errorHandler, notFoundHandler } from './middleware/error';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  // Images are sent as base64 JSON — allow a generous body size.
  app.use(express.json({ limit: '15mb' }));
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', service: 'photocation-backend', time: new Date().toISOString() }),
  );

  app.use('/api/auth', authRouter);
  app.use('/api/plans', plansRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/analyze', analyzeRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
