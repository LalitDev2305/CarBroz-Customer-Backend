import pino from 'pino';

export const createLogger = (name: string, level: string = 'info') => {
  const isProduction = process.env.NODE_ENV === 'production';
  return pino({
    name,
    level,
    transport: isProduction
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
    redact: ['password', 'token', 'otp', 'secret', 'authorization'],
  });
};

export const getFastifyLoggerConfig = (level: string = 'info') => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    level,
    transport: isProduction
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
    redact: ['password', 'token', 'otp', 'secret', 'authorization'],
  };
};

export const logger = createLogger('app');
