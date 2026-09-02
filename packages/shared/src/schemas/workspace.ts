import { z } from "zod";

export const workspaceRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  role: workspaceRoleSchema,
  createdAt: z.string(),
});

export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: workspaceRoleSchema,
  avatarUrl: z.string().nullish(),
  joinedAt: z.string(),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: workspaceRoleSchema,
});

export const updateMemberSchema = z.object({
  role: workspaceRoleSchema,
});

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().min(1),
});

export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type Member = z.infer<typeof memberSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;