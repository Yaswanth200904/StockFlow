import { env } from './config/env.js';
import { prisma } from './db/prisma.js';
import app from './app.js';

const server = app.listen(env.PORT, () => {
  console.log(`StockFlow API listening on port ${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down StockFlow API`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
