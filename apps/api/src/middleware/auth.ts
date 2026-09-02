import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/tokens.js";

/**
 * Augment Express's Request with the authenticated user payload.
 * Set by the `requireAuth` middleware below.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      workspaceMember?: {
        role: string;
        workspaceId: unknown;
        userId: unknown;
      };
    }
  }
}

/**
 * Verifies the access JWT from the Authorization header or `accessToken` cookie.
 * Attaches `req.user` on success, otherwise responds 401.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : (req.cookies?.accessToken as string | undefined);

  if (!token) {
    res.status(401).json({ error: "Missing access token" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired access token" });
  }
}
