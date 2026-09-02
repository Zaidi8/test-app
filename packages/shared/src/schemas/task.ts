import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "review", "done"]);
export const taskPrioritySchema = z.number().int().min(1).max(4);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: taskPrioritySchema.default(3),
  assigneeId: z.string().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  timeEstimate: z.number().int().min(0).optional(),
  tags: z.array(z.string()).default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullish(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().nullish(),
  scheduledStart: z.string().datetime().nullish(),
  scheduledEnd: z.string().datetime().nullish(),
  dueDate: z.string().datetime().nullish(),
  timeEstimate: z.number().int().min(0).nullish(),
  timeLogged: z.number().int().min(0).nullish(),
  tags: z.array(z.string()).optional(),
});

export const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  workspaceId: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assigneeId: z.string().nullish(),
  scheduledStart: z.string().nullish(),
  scheduledEnd: z.string().nullish(),
  dueDate: z.string().nullish(),
  timeEstimate: z.number().nullish(),
  timeLogged: z.number().nullish(),
  tags: z.array(z.string()),
  order: z.number(),
  completedAt: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type Task = z.infer<typeof taskSchema>;