import pino from 'pino';
import pinoHttp from 'pino-http';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
    },
  },
});

export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      user: req.user?.id,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});