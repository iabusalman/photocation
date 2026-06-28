import { createApp } from './app';
import { env } from './env';
import { prisma } from './prisma';
import { ensurePlansSeeded } from './services/plans';

const app = createApp();

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🟢 Photocation API listening on http://localhost:${env.PORT}`);
  // Seed default plans if the table is empty (non-blocking).
  ensurePlansSeeded().catch((e) =>
    // eslint-disable-next-line no-console
    console.error('Plan seeding failed:', e),
  );
});

async function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
