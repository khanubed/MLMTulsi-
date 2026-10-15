export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), message, ...meta }));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', timestamp: new Date().toISOString(), message, ...meta }));
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    const errorDetails = error instanceof Error ? { errorName: error.name, errorMessage: error.message, stack: error.stack } : { rawError: error };
    console.error(JSON.stringify({ level: 'error', timestamp: new Date().toISOString(), message, ...errorDetails, ...meta }));
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(JSON.stringify({ level: 'debug', timestamp: new Date().toISOString(), message, ...meta }));
    }
  },
};
