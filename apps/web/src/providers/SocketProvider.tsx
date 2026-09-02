'use client';

import {useEffect, useRef, type ReactNode} from 'react';
import {useQueryClient} from '@tanstack/react-query';

import {useAuth} from '@/lib/auth-provider';
import {
  getSocket,
  joinWorkspace,
  leaveWorkspace,
  SOCKET_EVENTS,
} from '@/lib/socket';

/**
 * Owns the Socket.io lifecycle for an authenticated user:
 *  - connects/disconnects with auth state,
 *  - joins/leaves a workspace room,
 *  - turns incoming events into TanStack Query cache invalidations
 *    (never mutates server state directly).
 */
export default function SocketProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) {
  const {user} = useAuth();
  const qc = useQueryClient();

  // Keep latest values without re-registering listeners on every render.
  const wsRef = useRef(workspaceId);
  const qcRef = useRef(qc);

  useEffect(() => {
    wsRef.current = workspaceId;
    qcRef.current = qc;
  });

  // Connect / disconnect based on auth state.
  useEffect(() => {
    const socket = getSocket();
    if (user) {
      if (!socket.connected) socket.connect();
      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  // Join / leave the active workspace room.
  useEffect(() => {
    if (!user || !workspaceId) return;
    joinWorkspace(workspaceId);
    return () => {
      leaveWorkspace(workspaceId);
    };
  }, [user, workspaceId]);

  // Global event listeners -> invalidate caches by query-key prefix.
  useEffect(() => {
    const socket = getSocket();

    const invalidate = (keys: unknown[]) =>
      qcRef.current.invalidateQueries({queryKey: keys as string[]});

    const projectsPrefix = () => invalidate(['workspaces', wsRef.current, 'projects']);
    const activities = () => invalidate(['workspaces', wsRef.current, 'activities']);
    const members = () => invalidate(['workspaces', wsRef.current, 'members']);

    const onTask = () => projectsPrefix();
    const onComment = () => projectsPrefix();
    const onActivity = () => activities();
    const onMember = () => { members(); activities(); };

    socket.on(SOCKET_EVENTS.TASK_CREATED, onTask);
    socket.on(SOCKET_EVENTS.TASK_UPDATED, onTask);
    socket.on(SOCKET_EVENTS.TASK_DELETED, onTask);
    socket.on(SOCKET_EVENTS.TASK_STATUS_CHANGED, onTask);
    socket.on(SOCKET_EVENTS.COMMENT_CREATED, onComment);
    socket.on(SOCKET_EVENTS.COMMENT_UPDATED, onComment);
    socket.on(SOCKET_EVENTS.COMMENT_DELETED, onComment);
    socket.on(SOCKET_EVENTS.ACTIVITY_CREATED, onActivity);
    socket.on(SOCKET_EVENTS.MEMBER_JOINED, onMember);
    socket.on(SOCKET_EVENTS.MEMBER_ROLE_CHANGED, onMember);
    socket.on(SOCKET_EVENTS.MEMBER_LEFT, onMember);

    return () => {
      socket.off(SOCKET_EVENTS.TASK_CREATED);
      socket.off(SOCKET_EVENTS.TASK_UPDATED);
      socket.off(SOCKET_EVENTS.TASK_DELETED);
      socket.off(SOCKET_EVENTS.TASK_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.COMMENT_CREATED);
      socket.off(SOCKET_EVENTS.COMMENT_UPDATED);
      socket.off(SOCKET_EVENTS.COMMENT_DELETED);
      socket.off(SOCKET_EVENTS.ACTIVITY_CREATED);
      socket.off(SOCKET_EVENTS.MEMBER_JOINED);
      socket.off(SOCKET_EVENTS.MEMBER_ROLE_CHANGED);
      socket.off(SOCKET_EVENTS.MEMBER_LEFT);
    };
  }, []);

  return <>{children}</>;
}
