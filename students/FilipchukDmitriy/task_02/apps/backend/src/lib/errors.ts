export class HttpError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string | string[]>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string | string[]>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export const throwUnauthorized = (message = "Unauthorized") => {
  throw new HttpError(401, "unauthorized", message);
};
