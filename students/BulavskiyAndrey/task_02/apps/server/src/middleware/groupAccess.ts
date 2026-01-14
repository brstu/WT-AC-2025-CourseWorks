import type { Request, Response, NextFunction } from "express";
import { canAccessGroup, requireMembership } from "../modules/groups/groups.service.js";
import { AppError } from "../lib/errors.js";
import { MembershipRole } from "@prisma/client";

export const requireGroupAccess = (allowedRoles?: MembershipRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const groupId = req.params.groupId;
    if (!groupId) {
      return next(new AppError(400, "Group ID required", "bad_request"));
    }
    if (!req.user) {
      return next(new AppError(401, "Unauthorized", "unauthorized"));
    }
    try {
      const hasAccess = await canAccessGroup(req.user.id, groupId);
      if (!hasAccess) {
        return next(new AppError(403, "Access denied to this group", "forbidden"));
      }
      if (allowedRoles) {
        await requireMembership(req.user.id, groupId, allowedRoles);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

