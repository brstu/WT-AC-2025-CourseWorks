export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string, code = "error") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const isAppError = (err: unknown): err is AppError => {
  return err instanceof AppError;
};

