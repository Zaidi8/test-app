import crypto from "node:crypto";
import type { Request, Response } from "express";

import { createInvitationSchema, type Invitation as InvitationDto } from "@prioritree/shared";

import { Activity } from "../models/Activity.js";
import { Invitation } from "../models/Invitation.js";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { WorkspaceMember } from "../models/WorkspaceMember.js";
import { ApiError } from "../utils/ApiError.js";
import { param } from "../utils/params.js";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function toInvitationPublic(doc: {
  _id: unknown;
  workspaceId: unknown;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}): InvitationDto {
  return {
    id: String(doc._id),
    workspaceId: String(doc.workspaceId),
    email: doc.email,
    role: doc.role as InvitationDto["role"],
    token: doc.token,
    expiresAt: doc.expiresAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
  };
}

// POST /api/v1/workspaces/:workspaceId/invitations — create (owner/admin only)
export async function createInvitation(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  if (!req.workspaceMember || !["owner", "admin"].includes(req.workspaceMember.role)) {
    throw ApiError.forbidden("Only owners and admins can invite members");
  }
  const parsed = createInvitationSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid invitation", parsed.error.flatten());
  }
  const email = parsed.data.email.toLowerCase();
  const wsId = param(req, "workspaceId");

  // Reuse a pending token if one already exists for this workspace+email.
  const existing = await Invitation.findOne({
    workspaceId: wsId,
    email,
    expiresAt: { $gt: new Date() },
  });
  if (existing) {
    res.status(200).json({ invitation: toInvitationPublic(existing) });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const invitation = await Invitation.create({
    workspaceId: wsId,
    email,
    role: parsed.data.role,
    token,
    expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
  });

  await Activity.create({
    workspaceId: wsId,
    actorId: req.user.id,
    type: "member:joined",
    entityId: String(invitation._id),
    entityType: "invitation",
    metadata: { email },
  });

  res.status(201).json({ invitation: toInvitationPublic(invitation) });
}

// GET /api/v1/workspaces/:workspaceId/invitations — list (owner/admin only)
export async function listInvitations(req: Request, res: Response): Promise<void> {
  if (!req.workspaceMember || !["owner", "admin"].includes(req.workspaceMember.role)) {
    throw ApiError.forbidden("Only owners and admins can view invitations");
  }
  const wsId = param(req, "workspaceId");
  const invitations = await Invitation.find({
    workspaceId: wsId,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  res.status(200).json({ invitations: invitations.map(toInvitationPublic) });
}

// DELETE /api/v1/workspaces/:workspaceId/invitations/:invitationId (owner/admin)
export async function revokeInvitation(req: Request, res: Response): Promise<void> {
  if (!req.workspaceMember || !["owner", "admin"].includes(req.workspaceMember.role)) {
    throw ApiError.forbidden("Only owners and admins can revoke invitations");
  }
  const wsId = param(req, "workspaceId");
  const invId = param(req, "invitationId");

  const invitation = await Invitation.findOneAndDelete({
    _id: invId,
    workspaceId: wsId,
  });
  if (!invitation) {
    throw ApiError.notFound("Invitation not found");
  }
  res.status(204).send();
}

// POST /api/v1/invitations/:token/accept — accept an invitation (authenticated user)
export async function acceptInvitation(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const token = param(req, "token");
  if (!token) {
    throw ApiError.badRequest("Missing invitation token");
  }

  const invitation = await Invitation.findOne({ token });
  if (!invitation) {
    throw ApiError.notFound("Invitation not found");
  }
  if (invitation.expiresAt < new Date()) {
    throw ApiError.badRequest("Invitation has expired");
  }

  // The invitation must be addressed to this user's email.
  const user = await User.findById(req.user.id);
  if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw ApiError.forbidden("This invitation is addressed to a different email");
  }

  const existingMember = await WorkspaceMember.findOne({
    workspaceId: invitation.workspaceId,
    userId: req.user.id,
  });
  if (existingMember) {
    if (existingMember.status === "removed") {
      existingMember.status = "active";
      existingMember.role = invitation.role;
      existingMember.joinedAt = new Date();
      await existingMember.save();
    } else {
      throw ApiError.conflict("You are already a member");
    }
  } else {
    await WorkspaceMember.create({
      workspaceId: invitation.workspaceId,
      userId: req.user.id,
      role: invitation.role,
      status: "active",
      joinedAt: new Date(),
    });
  }

  await invitation.deleteOne();

  const workspace = await Workspace.findById(invitation.workspaceId);

  res.status(200).json({
    workspace: {
      id: String(invitation.workspaceId),
      name: workspace?.name ?? "Workspace",
      slug: workspace?.slug ?? "",
    },
  });
}
