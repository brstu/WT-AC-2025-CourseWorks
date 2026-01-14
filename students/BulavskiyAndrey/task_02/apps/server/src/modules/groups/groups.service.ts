import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { MembershipRole } from "@prisma/client";

export const checkMembership = async (userId: string, groupId: string): Promise<MembershipRole | null> => {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId
      },
      isActive: true
    }
  });
  return membership ? membership.role : null;
};

export const requireMembership = async (
  userId: string,
  groupId: string,
  allowedRoles?: MembershipRole[]
): Promise<MembershipRole> => {
  const role = await checkMembership(userId, groupId);
  if (!role) {
    throw new AppError(403, "You are not a member of this group", "forbidden");
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new AppError(403, "Insufficient permissions", "forbidden");
  }
  return role;
};

export const canAccessGroup = async (userId: string | undefined, groupId: string): Promise<boolean> => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { memberships: { where: { userId, isActive: true } } }
  });
  if (!group) return false;
  if (!group.isPrivate) return true;
  if (!userId) return false;
  return group.memberships.length > 0;
};

