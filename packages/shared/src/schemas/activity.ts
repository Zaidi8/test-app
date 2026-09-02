import { z } from "zod";

export const activityTypeSchema = z.enum([
  "task:created",
  "task:updated",
  "task:deleted",
  "task:statusChanged",
  "comment:created",
  "comment:updated",
  "comment:deleted",
  "member:joined",
  "member:roleChanged",
  "member:left",
]);

export const activitySchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  actorId: z.string(),
  type: activityTypeSchema,
  entityId: z.string(),
  entityType: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

export const activityWithActorSchema = activitySchema.extend({
  actor: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullish(),
  }),
});

export const activityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ActivityType = z.infer<typeof activityTypeSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type ActivityWithActor = z.infer<typeof activityWithActorSchema>;
export type ActivityQuery = z.infer<typeof activityQuerySchema>;