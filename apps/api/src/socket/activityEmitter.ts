import type { Server } from "socket.io";

import { SOCKET_EVENTS } from "@prioritree/shared/socket";

import { emitToWorkspaceRoom } from "./index.js";
import type { ActivityDoc } from "../models/Activity.js";

let ioRef: Server | undefined;

/** Register the Socket.io instance once at server boot. */
export function registerActivityEmitter(io: Server): void {
  ioRef = io;
}

/**
 * Broadcast a newly created activity to every socket in the workspace room.
 * Called from the Activity model's post-save hook so every activity creation
 * (from any REST handler) reaches connected clients.
 */
export function emitActivityCreated(doc: ActivityDoc): void {
  if (!ioRef) return;
  const workspaceId = String(doc.workspaceId);
  emitToWorkspaceRoom(ioRef, workspaceId, SOCKET_EVENTS.ACTIVITY_CREATED, {
    id: String(doc._id),
    workspaceId,
    actorId: String(doc.actorId),
    type: doc.type,
    entityId: doc.entityId,
    entityType: doc.entityType,
    metadata: doc.metadata,
    createdAt:
      (doc.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
  });
}
