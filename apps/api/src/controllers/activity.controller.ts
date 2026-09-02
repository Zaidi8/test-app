import type { Request, Response } from "express";

import { activityQuerySchema, type ActivityWithActor } from "@prioritree/shared";

import { ApiError } from "../utils/ApiError.js";
import { Activity } from "../models/Activity.js";
import { User } from "../models/User.js";
import { param } from "../utils/params.js";

function toActivityPublic(doc: {
  _id: unknown;
  workspaceId: unknown;
  actorId: unknown;
  type: string;
  entityId: string;
  entityType: string;
  metadata: unknown;
  createdAt: Date;
}, actor: { name: string; avatarUrl?: string | null }): ActivityWithActor {
  return {
    id: String(doc._id),
    workspaceId: String(doc.workspaceId),
    actorId: String(doc.actorId),
    type: doc.type as ActivityWithActor["type"],
    entityId: doc.entityId,
    entityType: doc.entityType,
    metadata: (doc.metadata ?? {}) as Record<string, unknown>,
    createdAt: doc.createdAt.toISOString(),
    actor: {
      id: String(doc.actorId),
      name: actor.name,
      avatarUrl: actor.avatarUrl ?? null,
    },
  };
}

// GET /api/v1/workspaces/:workspaceId/activities?page=&limit=
export async function listActivities(req: Request, res: Response): Promise<void> {
  const parsed = activityQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid query", parsed.error.flatten());
  }
  const { page, limit } = parsed.data;
  const wsId = param(req, "workspaceId");

  const [activities, total] = await Promise.all([
    Activity.find({ workspaceId: wsId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Activity.countDocuments({ workspaceId: wsId }),
  ]);

  const actorIds = [...new Set(activities.map(a => a.actorId))];
  const users = await User.find({ _id: { $in: actorIds } });
  const userById = new Map(users.map(u => [String(u._id), u]));

  res.status(200).json({
    activities: activities.map(a =>
      toActivityPublic(a, {
        name: userById.get(String(a.actorId))?.name ?? "Unknown",
        avatarUrl: userById.get(String(a.actorId))?.avatarUrl,
      }),
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
