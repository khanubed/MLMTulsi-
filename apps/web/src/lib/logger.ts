type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  message: string;
  requestId?: string;
  userId?: string;
  action?: string;
  error?: unknown;
  meta?: Record<string, unknown>;
}

function logMessage(level: LogLevel, payload: LogPayload) {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    ...payload,
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (message: string, context?: Omit<LogPayload, 'message'>) =>
    logMessage('info', { message, ...context }),
  warn: (message: string, context?: Omit<LogPayload, 'message'>) =>
    logMessage('warn', { message, ...context }),
  error: (message: string, context?: Omit<LogPayload, 'message'>) =>
    logMessage('error', { message, ...context }),
  debug: (message: string, context?: Omit<LogPayload, 'message'>) =>
    logMessage('debug', { message, ...context }),
};
