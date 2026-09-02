import type { Server as HttpServer } from "node:http";

import type { Request } from "express";
import { Server, type Socket } from "socket.io";

import { verifyAccessToken, type AccessTokenPayload } from "../utils/tokens.js";
import { WorkspaceMember } from "../models/WorkspaceMember.js";

/** Small surface used to read the Socket.io instance off the Express app. */
interface IoCarrier {
  get(name: "io"): Server | undefined;
}

interface AuthHandshakeData {
  token?: string;
  cookie?: string;
}

/**
 * Resolve the access token from the socket handshake. Socket.io clients pass it
 * via `auth: { token }`, but we also fall back to the `accessToken` cookie so a
 * browser io() connection (which sends cookies automatically) works too.
 */
function resolveToken(handshakeAuth: AuthHandshakeData, cookieHeader: string | undefined): string | undefined {
  if (handshakeAuth.token) return handshakeAuth.token;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return undefined;
}

export interface AuthenticatedSocket extends Socket {
  authUser?: AccessTokenPayload;
}

/**
 * Create the Socket.io server attached to the Express HTTP server, wire up
 * authentication and per-workspace rooms, then return the io instance.
 */
export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ?? "http://localhost:3000",
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const auth = (socket.handshake.auth ?? {}) as AuthHandshakeData;
    const token = resolveToken(auth, socket.handshake.headers.cookie);
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }
    try {
      const payload = verifyAccessToken(token);
      socket.authUser = payload;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.authUser?.sub;

    socket.on("workspace:join", async (workspaceId: string, ack?: (ok: boolean) => void) => {
      const allowed = await isWorkspaceMember(userId, workspaceId);
      if (!allowed || !userId) {
        ack?.(false);
        return;
      }
      void socket.join(roomFor(workspaceId));
      ack?.(true);
    });

    socket.on("workspace:leave", (workspaceId: string, ack?: (ok: boolean) => void) => {
      void socket.leave(roomFor(workspaceId));
      ack?.(true);
    });
  });

  return io;
}

function roomFor(workspaceId: string): string {
  return `ws:${workspaceId}`;
}

async function isWorkspaceMember(
  userId: string | undefined,
  workspaceId: string,
): Promise<boolean> {
  if (!userId) return false;
  const member = await WorkspaceMember.findOne({
    userId,
    workspaceId,
    status: "active",
  });
  return member !== null;
}

/** Emit an event to every socket currently in a workspace's room. */
export function emitToWorkspaceRoom(io: Server, workspaceId: string, event: string, payload: unknown): void {
  io.to(roomFor(workspaceId)).emit(event, payload);
}

/**
 * Emit an event to a workspace's room using the Socket.io instance attached to
 * the Express app. Safe no-op when realtime is not initialized (e.g. tests).
 */
export function emitToWorkspace(req: Request, workspaceId: string, event: string, payload: unknown): void {
  const io = (req.app as unknown as IoCarrier).get("io");
  if (io) emitToWorkspaceRoom(io, workspaceId, event, payload);
}
