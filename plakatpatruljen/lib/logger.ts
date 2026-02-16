type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
}

const isDev = process.env.EXPO_PUBLIC_APP_ENV !== 'production';

function formatLog(entry: LogEntry): string {
  const prefix = entry.context ? `[${entry.context}]` : '';
  return `${entry.timestamp} ${entry.level.toUpperCase()} ${prefix} ${entry.message}`;
}

function log(level: LogLevel, message: string, context?: string, data?: unknown): void {
  if (!isDev && level === 'debug') return;

  const entry: LogEntry = {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };

  const formatted = formatLog(entry);

  switch (level) {
    case 'debug':
      console.debug(formatted, data ?? '');
      break;
    case 'info':
      console.info(formatted, data ?? '');
      break;
    case 'warn':
      console.warn(formatted, data ?? '');
      break;
    case 'error':
      console.error(formatted, data ?? '');
      break;
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: unknown) => log('debug', message, context, data),
  info: (message: string, context?: string, data?: unknown) => log('info', message, context, data),
  warn: (message: string, context?: string, data?: unknown) => log('warn', message, context, data),
  error: (message: string, context?: string, data?: unknown) => log('error', message, context, data),
};

export function createLogger(context: string) {
  return {
    debug: (message: string, data?: unknown) => logger.debug(message, context, data),
    info: (message: string, data?: unknown) => logger.info(message, context, data),
    warn: (message: string, data?: unknown) => logger.warn(message, context, data),
    error: (message: string, data?: unknown) => logger.error(message, context, data),
  };
}
