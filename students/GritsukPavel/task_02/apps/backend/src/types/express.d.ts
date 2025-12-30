import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface UserContext {
      id: string;
      role: Role;
    }
    interface Request {
      user?: UserContext;
    }
  }
}

export {};
