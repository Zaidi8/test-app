import type { NextFunction, Request, Response } from "express";

/** Role hierarchy: every role below the minimum is denied. */
export const ROLE_LEVEL: Record<string, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

export type WorkspaceRole = keyof typeof ROLE_LEVEL;

/**
 * Placeholder for T5 (data layer + workspace membership).
 *
 * After T5 this will load the WorkspaceMember record for
 * `req.user.id` + `req.params.workspaceId` and assert
 * `ROLE_LEVEL[member.role] >= ROLE_LEVEL[minRole]`.
 */
export function requireWorkspaceRole(minRole: WorkspaceRole) {
  return function rbacMiddleware(_req: Request, _res: Response, next: NextFunction): void {
    void minRole;
    next();
  };
}
