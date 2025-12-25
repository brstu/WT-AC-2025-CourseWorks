import type { AuthenticatedRequest } from "./middleware/auth";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedRequest["user"];
  }
}
