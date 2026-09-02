'use client';

import {io, type Socket} from 'socket.io-client';
import {SOCKET_EVENTS, SOCKET_CONTROL} from '@prioritree/shared/socket';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Socket.io runs on the API server root (not under /api/v1). */
const SOCKET_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

let socket: Socket | null = null;

/**
 * Return the shared socket instance, creating it on first use. The connection
 * is established lazily via `connect()` (the SocketProvider owns the lifecycle)
 * and authenticates using the HttpOnly accessToken cookie.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
}

/** Ask the server to add this socket to a workspace's room. */
export function joinWorkspace(workspaceId: string): void {
  getSocket().emit(SOCKET_CONTROL.WORKSPACE_JOIN, workspaceId);
}

/** Ask the server to remove this socket from a workspace's room. */
export function leaveWorkspace(workspaceId: string): void {
  getSocket().emit(SOCKET_CONTROL.WORKSPACE_LEAVE, workspaceId);
}

export {SOCKET_EVENTS, SOCKET_CONTROL};
