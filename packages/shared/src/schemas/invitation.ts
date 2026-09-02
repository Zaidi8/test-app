import { z } from "zod";

export const invitationStatusSchema = z.enum(["pending", "accepted", "expired"]);

export const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

export const invitationSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
  token: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});

export type InvitationStatus = z.infer<typeof invitationStatusSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;