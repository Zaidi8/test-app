/** Socket.io event names shared between API (emitter) and web (listener). */
export const SOCKET_EVENTS = {
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASK_STATUS_CHANGED: "task:statusChanged",
  COMMENT_CREATED: "comment:created",
  COMMENT_UPDATED: "comment:updated",
  COMMENT_DELETED: "comment:deleted",
  ACTIVITY_CREATED: "activity:created",
  MEMBER_JOINED: "member:joined",
  MEMBER_ROLE_CHANGED: "member:roleChanged",
  MEMBER_LEFT: "member:left",
} as const;

export const SOCKET_CONTROL = {
  WORKSPACE_JOIN: "workspace:join",
  WORKSPACE_LEAVE: "workspace:leave",
} as const;
