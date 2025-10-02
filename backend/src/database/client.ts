import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
  log: config.server.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;