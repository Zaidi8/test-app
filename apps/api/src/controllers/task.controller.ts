import type { Request, Response } from "express";

import {
  createCommentSchema,
  createTaskSchema,
  updateCommentSchema,
  updateTaskSchema,
  type Comment as CommentDto,
  type CommentWithAuthor as CommentWithAuthorDto,
  type Task as TaskDto,
} from "@prioritree/shared";

import { Activity } from "../models/Activity.js";
import { Comment as TaskComment } from "../models/Comment.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { param } from "../utils/params.js";

function toTaskPublic(doc: {
  _id: unknown;
  projectId: unknown;
  workspaceId: unknown;
  title: string;
  description?: string | null;
  status: string;
  priority: number;
  assigneeId?: unknown;
  scheduledStart?: Date | null;
  scheduledEnd?: Date | null;
  dueDate?: Date | null;
  timeEstimate?: number | null;
  timeLogged?: number;
  tags?: string[];
  order?: number;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): TaskDto {
  return {
    id: String(doc._id),
    projectId: String(doc.projectId),
    workspaceId: String(doc.workspaceId),
    title: doc.title,
    description: doc.description ?? null,
    status: doc.status as TaskDto["status"],
    priority: doc.priority,
    assigneeId: doc.assigneeId ? String(doc.assigneeId) : null,
    scheduledStart: doc.scheduledStart ? doc.scheduledStart.toISOString() : null,
    scheduledEnd: doc.scheduledEnd ? doc.scheduledEnd.toISOString() : null,
    dueDate: doc.dueDate ? doc.dueDate.toISOString() : null,
    timeEstimate: doc.timeEstimate ?? null,
    timeLogged: doc.timeLogged ?? 0,
    tags: doc.tags ?? [],
    order: doc.order ?? 0,
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toCommentPublic(
  doc: {
    _id: unknown;
    taskId: unknown;
    authorId: unknown;
    body: string;
    mentions?: string[];
    createdAt: Date;
  },
  author: { name: string; avatarUrl?: string | null },
): CommentWithAuthorDto {
  return {
    id: String(doc._id),
    taskId: String(doc.taskId),
    authorId: String(doc.authorId),
    body: doc.body,
    mentions: doc.mentions ?? [],
    createdAt: doc.createdAt.toISOString(),
    author: {
      id: String(doc.authorId),
      name: author.name,
      avatarUrl: author.avatarUrl ?? null,
    },
  };
}

function toCommentSimple(doc: {
  _id: unknown;
  taskId: unknown;
  authorId: unknown;
  body: string;
  mentions?: string[];
  createdAt: Date;
}): CommentDto {
  return {
    id: String(doc._id),
    taskId: String(doc.taskId),
    authorId: String(doc.authorId),
    body: doc.body,
    mentions: doc.mentions ?? [],
    createdAt: doc.createdAt.toISOString(),
  };
}

// GET /api/v1/workspaces/:workspaceId/projects/:projectId/tasks
export async function listTasks(req: Request, res: Response): Promise<void> {
  const wsId = param(req, "workspaceId");
  const projId = param(req, "projectId");
  const tasks = await Task.find({ workspaceId: wsId, projectId: projId }).sort({
    order: 1,
    createdAt: -1,
  });
  res.status(200).json({ tasks: tasks.map(toTaskPublic) });
}

// POST /api/v1/workspaces/:workspaceId/projects/:projectId/tasks
export async function createTask(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid task", parsed.error.flatten());
  }

  const wsId = param(req, "workspaceId");
  const projId = param(req, "projectId");

  const maxOrder = await Task.findOne({ workspaceId: wsId }).sort({ order: -1 }).select("order");
  const order = (maxOrder?.order ?? 0) + 1;

  const task = await Task.create({
    projectId: projId,
    workspaceId: wsId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    priority: parsed.data.priority,
    assigneeId: parsed.data.assigneeId ?? null,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    timeEstimate: parsed.data.timeEstimate ?? null,
    tags: parsed.data.tags,
    order,
  });

  await Activity.create({
    workspaceId: wsId,
    actorId: req.user.id,
    type: "task:created",
    entityId: String(task._id),
    entityType: "task",
    metadata: { title: task.title },
  });

  res.status(201).json({ task: toTaskPublic(task) });
}

// PATCH /api/v1/workspaces/:workspaceId/projects/:projectId/tasks/:taskId
export async function updateTask(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid task update", parsed.error.flatten());
  }

  const wsId = param(req, "workspaceId");
  const taskId = param(req, "taskId");

  const task = await Task.findOne({ _id: taskId, workspaceId: wsId });
  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  if (parsed.data.title !== undefined) task.title = parsed.data.title;
  if (parsed.data.description !== undefined) task.description = parsed.data.description;
  if (parsed.data.status !== undefined) {
    task.status = parsed.data.status;
    task.completedAt = parsed.data.status === "done" ? new Date() : null;
  }
  if (parsed.data.priority !== undefined) task.priority = parsed.data.priority;
  if (parsed.data.assigneeId !== undefined) {
    (task as unknown as { assigneeId: string | null }).assigneeId = parsed.data.assigneeId;
  }
  if (parsed.data.scheduledStart !== undefined) {
    task.scheduledStart = parsed.data.scheduledStart
      ? new Date(parsed.data.scheduledStart)
      : null;
  }
  if (parsed.data.scheduledEnd !== undefined) {
    task.scheduledEnd = parsed.data.scheduledEnd ? new Date(parsed.data.scheduledEnd) : null;
  }
  if (parsed.data.dueDate !== undefined) {
    task.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
  }
  if (parsed.data.timeEstimate !== undefined) task.timeEstimate = parsed.data.timeEstimate;
  if (parsed.data.timeLogged !== undefined) {
    task.timeLogged = parsed.data.timeLogged ?? 0;
  }
  if (parsed.data.tags !== undefined) task.tags = parsed.data.tags;
  await task.save();

  await Activity.create({
    workspaceId: wsId,
    actorId: req.user.id,
    type: "task:updated",
    entityId: String(task._id),
    entityType: "task",
    metadata: { title: task.title },
  });

  res.status(200).json({ task: toTaskPublic(task) });
}

// PATCH /api/v1/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/status
export async function updateTaskStatus(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const status = (req.body?.status as string | undefined) ?? "";
  if (!["todo", "in_progress", "review", "done"].includes(status)) {
    throw ApiError.badRequest("Invalid status");
  }

  const wsId = param(req, "workspaceId");
  const taskId = param(req, "taskId");

  const task = await Task.findOne({ _id: taskId, workspaceId: wsId });
  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  task.status = status as TaskDto["status"];
  task.completedAt = status === "done" ? new Date() : null;
  await task.save();

  await Activity.create({
    workspaceId: wsId,
    actorId: req.user.id,
    type: "task:statusChanged",
    entityId: String(task._id),
    entityType: "task",
    metadata: { status },
  });

  res.status(200).json({ task: toTaskPublic(task) });
}

// DELETE /api/v1/workspaces/:workspaceId/projects/:projectId/tasks/:taskId
export async function deleteTask(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const wsId = param(req, "workspaceId");
  const taskId = param(req, "taskId");

  const task = await Task.findOneAndDelete({ _id: taskId, workspaceId: wsId });
  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  await TaskComment.deleteMany({ taskId: task._id });
  await Activity.create({
    workspaceId: wsId,
    actorId: req.user.id,
    type: "task:deleted",
    entityId: String(task._id),
    entityType: "task",
    metadata: {},
  });

  res.status(204).send();
}

// GET /api/v1/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments
export async function listComments(req: Request, res: Response): Promise<void> {
  const taskId = param(req, "taskId");
  const comments = await TaskComment.find({ taskId }).sort({ createdAt: 1 });
  const authorIds = [...new Set(comments.map(c => c.authorId))];
  const users = await User.find({ _id: { $in: authorIds } });
  const userById = new Map(users.map(u => [String(u._id), u]));

  res.status(200).json({
    comments: comments.map(c =>
      toCommentPublic(c, {
        name: userById.get(String(c.authorId))?.name ?? "Unknown",
        avatarUrl: userById.get(String(c.authorId))?.avatarUrl,
      }),
    ),
  });
}

// POST /api/v1/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments
export async function createComment(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid comment", parsed.error.flatten());
  }

  const wsId = param(req, "workspaceId");
  const taskId = param(req, "taskId");

  const task = await Task.findOne({ _id: taskId, workspaceId: wsId });
  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  const mentions = [...parsed.data.body.matchAll(/@(\w+)/g)].map(m => m[1]);

  const comment = await TaskComment.create({
    taskId: task._id,
    authorId: req.user.id,
    body: parsed.data.body,
    mentions,
  });

  await Activity.create({
    workspaceId: wsId,
    actorId: req.user.id,
    type: "comment:created",
    entityId: String(comment._id),
    entityType: "comment",
    metadata: { taskId: String(task._id) },
  });

  res.status(201).json({ comment: toCommentSimple(comment) });
}

// PATCH /api/v1/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments/:commentId
export async function updateComment(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const parsed = updateCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid comment update", parsed.error.flatten());
  }

  const commentId = param(req, "commentId");
  const comment = await TaskComment.findById(commentId);
  if (!comment || String(comment.authorId) !== req.user.id) {
    throw ApiError.forbidden("You can only edit your own comments");
  }

  comment.body = parsed.data.body;
  comment.mentions = [...parsed.data.body.matchAll(/@(\w+)/g)].map(m => m[1]);
  await comment.save();

  res.status(200).json({ comment: toCommentSimple(comment) });
}

// DELETE /api/v1/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments/:commentId
export async function deleteComment(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const commentId = param(req, "commentId");
  const comment = await TaskComment.findById(commentId);
  if (!comment || String(comment.authorId) !== req.user.id) {
    throw ApiError.forbidden("You can only delete your own comments");
  }
  await comment.deleteOne();
  res.status(204).send();
}
