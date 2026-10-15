import { env } from './env.js';
import { logger } from './logger.js';

/**
 * Database client placeholder / connection point.
 * Once Prisma or pg client is initialized, export the singleton here.
 */
export const db = {
  url: env.DATABASE_URL,
  checkConnection: async (): Promise<boolean> => {
    logger.info('Database connection check placeholder');
    return true;
  },
};
