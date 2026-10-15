import { Router, Request, Response } from 'express';
import { db } from '../config/database.js';

export const healthRouter = Router();

healthRouter.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

healthRouter.get('/ready', async (_req: Request, res: Response) => {
  try {
    const isDbReady = await db.checkConnection();
    if (!isDbReady) {
      res.status(503).json({ status: 'degraded', database: 'unavailable' });
      return;
    }
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown' });
  }
});
