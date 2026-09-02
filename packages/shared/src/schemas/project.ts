import { z } from "zod";

export const projectStatusSchema = z.enum(["active", "archived", "completed"]);

export const createProjectSchema = z.object({
  title: z.string().min(1, "Project title is required").max(100),
  color: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  status: projectStatusSchema.optional(),
  color: z.string().optional(),
  dueDate: z.string().datetime().nullish(),
});

export const projectSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  title: z.string(),
  status: projectStatusSchema,
  color: z.string().nullish(),
  dueDate: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type Project = z.infer<typeof projectSchema>;