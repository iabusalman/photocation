import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOrigins, env } from './env';
import { authRouter } from './routes/auth';
import { packagesRouter } from './routes/packages';
import { bookingsRouter } from './routes/bookings';
import { paymentsRouter } from './routes/payments';
import { errorHandler, notFoundHandler } from './middleware/error';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow same-origin / curl (no origin) and configured origins.
        if (!origin || corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', service: 'photocation-backend', time: new Date().toISOString() }),
  );

  app.use('/api/auth', authRouter);
  app.use('/api/packages', packagesRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/payments', paymentsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
