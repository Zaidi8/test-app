import type { Request, Response } from "express";

import {
  addMemberSchema,
  createWorkspaceSchema,
  updateMemberSchema,
  updateWorkspaceSchema,
  type Member,
} from "@prioritree/shared";

import { Activity } from "../models/Activity.js";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { WorkspaceMember } from "../models/WorkspaceMember.js";
import { ApiError } from "../utils/ApiError.js";
import { param } from "../utils/params.js";
import { slugify } from "../utils/slugify.js";

type WorkspaceRecord = {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "member" | "viewer";
  createdAt: string;
};

async function ensureUniqueSlug(base: string): Promise<string> {
  const slug = slugify(base) || "workspace";
  let candidate = slug;
  let n = 2;
  while (await Workspace.findOne({ slug: candidate })) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
}

function toWorkspacePublic(
  doc: { _id: unknown; name: string; slug: string; createdAt: Date },
  role: string,
): WorkspaceRecord {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    role: role as WorkspaceRecord["role"],
    createdAt: doc.createdAt.toISOString(),
  };
}

function toMemberPublic(doc: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  joinedAt?: Date | null;
}): Member {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role as Member["role"],
    avatarUrl: doc.avatarUrl ?? null,
    joinedAt: doc.joinedAt ? doc.joinedAt.toISOString() : new Date().toISOString(),
  };
}

// GET /api/v1/workspaces — list all workspaces the user belongs to.
export async function listWorkspaces(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const memberships = await WorkspaceMember.find({ userId: req.user.id, status: "active" });
  const workspaceIds = memberships.map(m => m.workspaceId);

  const workspaces = await Workspace.find({ _id: { $in: workspaceIds } });
  const roleByWorkspace = new Map(
    memberships.map(m => [String(m.workspaceId), m.role]),
  );

  res.status(200).json({
    workspaces: workspaces.map(w =>
      toWorkspacePublic(w, roleByWorkspace.get(String(w._id)) ?? "viewer"),
    ),
  });
}

// POST /api/v1/workspaces — create a workspace (creator becomes owner).
export async function createWorkspace(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const parsed = createWorkspaceSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid workspace", parsed.error.flatten());
  }

  const slug = await ensureUniqueSlug(parsed.data.name);
  const workspace = await Workspace.create({
    name: parsed.data.name,
    slug,
    ownerId: req.user.id,
  });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: req.user.id,
    role: "owner",
    status: "active",
    joinedAt: new Date(),
  });

  await Activity.create({
    workspaceId: workspace._id,
    actorId: req.user.id,
    type: "member:joined",
    entityId: String(workspace._id),
    entityType: "workspace",
    metadata: {},
  });

  res.status(201).json({
    workspace: toWorkspacePublic(workspace, "owner"),
  });
}

// GET /api/v1/workspaces/:workspaceId — single workspace detail.
export async function getWorkspace(req: Request, res: Response): Promise<void> {
  if (!req.workspaceMember) {
    throw ApiError.forbidden();
  }
  const workspace = await Workspace.findById(param(req, "workspaceId"));
  if (!workspace) {
    throw ApiError.notFound("Workspace not found");
  }
  res
    .status(200)
    .json({ workspace: toWorkspacePublic(workspace, req.workspaceMember.role) });
}

// PATCH /api/v1/workspaces/:workspaceId — update name (owner/admin only).
export async function updateWorkspace(req: Request, res: Response): Promise<void> {
  if (!req.workspaceMember || !["owner", "admin"].includes(req.workspaceMember.role)) {
    throw ApiError.forbidden("Only owners and admins can update the workspace");
  }
  const parsed = updateWorkspaceSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid workspace update", parsed.error.flatten());
  }

  const workspace = await Workspace.findById(param(req, "workspaceId"));
  if (!workspace) {
    throw ApiError.notFound("Workspace not found");
  }
  if (parsed.data.name) {
    workspace.name = parsed.data.name;
    workspace.slug = await ensureUniqueSlug(parsed.data.name);
  }
  await workspace.save();

  res
    .status(200)
    .json({ workspace: toWorkspacePublic(workspace, req.workspaceMember.role) });
}

// DELETE /api/v1/workspaces/:workspaceId — remove workspace (owner only).
export async function deleteWorkspace(req: Request, res: Response): Promise<void> {
  if (!req.workspaceMember || req.workspaceMember.role !== "owner") {
    throw ApiError.forbidden("Only the owner can delete the workspace");
  }
  const wsId = param(req, "workspaceId");
  await Workspace.findByIdAndDelete(wsId);
  await WorkspaceMember.deleteMany({ workspaceId: wsId });
  await Activity.deleteMany({ workspaceId: wsId });
  res.status(204).send();
}

// GET /api/v1/workspaces/:workspaceId/members — list members with roles.
export async function listMembers(req: Request, res: Response): Promise<void> {
  if (!req.workspaceMember) {
    throw ApiError.forbidden();
  }
  const wsId = param(req, "workspaceId");
  const memberships = await WorkspaceMember.find({
    workspaceId: wsId,
    status: { $in: ["active", "invited"] },
  });
  const userIds = memberships.map(m => m.userId);
  const users = await User.find({ _id: { $in: userIds } });
  const userById = new Map(users.map(u => [String(u._id), u]));

  res.status(200).json({
    members: memberships.map(m => {
      const user = userById.get(String(m.userId));
      return toMemberPublic({
        _id: m.userId,
        name: user?.name ?? "Unknown",
        email: user?.email ?? "",
        role: m.role,
        avatarUrl: user?.avatarUrl,
        joinedAt: m.joinedAt,
      });
    }),
  });
}

// POST /api/v1/workspaces/:workspaceId/members — add an existing user by id.
export async function addMember(req: Request, res: Response): Promise<void> {
  if (!req.workspaceMember || !["owner", "admin"].includes(req.workspaceMember.role)) {
    throw ApiError.forbidden("Only owners and admins can add members");
  }
  const parsed = addMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid member", parsed.error.flatten());
  }

  const wsId = param(req, "workspaceId");

  const existing = await WorkspaceMember.findOne({
    workspaceId: wsId,
    userId: parsed.data.userId,
  });
  if (existing) {
    throw ApiError.conflict("User is already a member");
  }

  const user = await User.findById(parsed.data.userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const member = await WorkspaceMember.create({
    workspaceId: wsId,
    userId: user._id,
    role: parsed.data.role,
    status: "active",
    joinedAt: new Date(),
  });

  await Activity.create({
    workspaceId: wsId,
    actorId: req.user!.id,
    type: "member:joined",
    entityId: String(user._id),
    entityType: "user",
    metadata: {},
  });

  res.status(201).json({
    member: toMemberPublic({
      _id: member.userId,
      name: user.name,
      email: user.email,
      role: member.role,
      avatarUrl: user.avatarUrl,
      joinedAt: member.joinedAt,
    }),
  });
}

// PATCH /api/v1/workspaces/:workspaceId/members/:userId — change role.
export async function updateMemberRole(req: Request, res: Response): Promise<void> {
  if (!req.workspaceMember || !["owner", "admin"].includes(req.workspaceMember.role)) {
    throw ApiError.forbidden("Only owners and admins can change roles");
  }
  const parsed = updateMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid role", parsed.error.flatten());
  }

  const wsId = param(req, "workspaceId");
  const uid = param(req, "userId");

  const member = await WorkspaceMember.findOne({
    workspaceId: wsId,
    userId: uid,
  });
  if (!member) {
    throw ApiError.notFound("Member not found");
  }

  // Never demote/remove the sole owner.
  if (member.role === "owner" && parsed.data.role !== "owner") {
    const ownerCount = await WorkspaceMember.countDocuments({
      workspaceId: wsId,
      role: "owner",
      status: "active",
    });
    if (ownerCount <= 1) {
      throw ApiError.conflict("Cannot remove the last owner");
    }
  }

  member.role = parsed.data.role;
  await member.save();

  await Activity.create({
    workspaceId: wsId,
    actorId: req.user!.id,
    type: "member:roleChanged",
    entityId: String(member.userId),
    entityType: "user",
    metadata: { role: member.role },
  });

  res.status(200).json({ success: true });
}

// DELETE /api/v1/workspaces/:workspaceId/members/:userId — remove a member.
export async function removeMember(req: Request, res: Response): Promise<void> {
  if (!req.workspaceMember || !["owner", "admin"].includes(req.workspaceMember.role)) {
    throw ApiError.forbidden("Only owners and admins can remove members");
  }

  const wsId = param(req, "workspaceId");
  const uid = param(req, "userId");

  const member = await WorkspaceMember.findOne({
    workspaceId: wsId,
    userId: uid,
  });
  if (!member) {
    throw ApiError.notFound("Member not found");
  }

  if (member.role === "owner") {
    throw ApiError.conflict("Cannot remove the owner");
  }

  member.status = "removed";
  await member.save();

  await Activity.create({
    workspaceId: wsId,
    actorId: req.user!.id,
    type: "member:left",
    entityId: String(member.userId),
    entityType: "user",
    metadata: {},
  });

  res.status(200).json({ success: true });
}
