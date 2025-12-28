import { StatusCodes } from 'http-status-codes';
import { logger } from './logger.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(StatusCodes.NOT_FOUND);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === StatusCodes.OK 
    ? StatusCodes.INTERNAL_SERVER_ERROR 
    : res.statusCode;

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
  });

  const response = {
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};