import type { NextFunction, Request, Response } from "express";

import { WorkspaceMember } from "../models/WorkspaceMember.js";
import { ApiError } from "../utils/ApiError.js";

/** Role hierarchy: every role below the minimum is denied. */
export const ROLE_LEVEL: Record<string, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

export type WorkspaceRole = keyof typeof ROLE_LEVEL;

/**
 * Loads the WorkspaceMember record for `req.user.id` inside
 * `req.params.workspaceId` and asserts the member's role is at or above the
 * required minimum. On success attaches `req.workspaceMember` for handlers
 * that need the role.
 */
export function requireWorkspaceRole(minRole: WorkspaceRole) {
  return async function rbacMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const workspaceId = (req.params.workspaceId as string | undefined) ?? "";
      if (!workspaceId) {
        throw ApiError.badRequest("Missing workspaceId");
      }

      const member = await WorkspaceMember.findOne({
        workspaceId,
        userId: req.user.id,
        status: "active",
      });
      if (!member) {
        throw ApiError.forbidden("You are not a member of this workspace");
      }

      const memberLevel = ROLE_LEVEL[member.role];
      if (memberLevel < ROLE_LEVEL[minRole]) {
        throw ApiError.forbidden("Insufficient role for this action");
      }

      req.workspaceMember = {
        role: member.role,
        workspaceId: member.workspaceId,
        userId: member.userId,
      };
      next();
    } catch (err) {
      next(err);
    }
  };
}
