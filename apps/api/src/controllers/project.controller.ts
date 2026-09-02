import type { Request, Response } from "express";

import {
  createProjectSchema,
  updateProjectSchema,
  type Project as ProjectDto,
} from "@prioritree/shared";

import { Activity } from "../models/Activity.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { param } from "../utils/params.js";

function toProjectPublic(doc: {
  _id: unknown;
  workspaceId: unknown;
  title: string;
  status: string;
  color?: string | null;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ProjectDto {
  return {
    id: String(doc._id),
    workspaceId: String(doc.workspaceId),
    title: doc.title,
    status: doc.status as ProjectDto["status"],
    color: doc.color ?? null,
    dueDate: doc.dueDate ? doc.dueDate.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// GET /api/v1/workspaces/:workspaceId/projects
export async function listProjects(req: Request, res: Response): Promise<void> {
  const wsId = param(req, "workspaceId");
  const projects = await Project.find({ workspaceId: wsId }).sort({ createdAt: -1 });
  res.status(200).json({ projects: projects.map(toProjectPublic) });
}

// POST /api/v1/workspaces/:workspaceId/projects
export async function createProject(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid project", parsed.error.flatten());
  }

  const wsId = param(req, "workspaceId");

  const project = await Project.create({
    workspaceId: wsId,
    title: parsed.data.title,
    color: parsed.data.color ?? null,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
  });

  await Activity.create({
    workspaceId: wsId,
    actorId: req.user.id,
    type: "task:created",
    entityId: String(project._id),
    entityType: "project",
    metadata: { title: project.title },
  });

  res.status(201).json({ project: toProjectPublic(project) });
}

// PATCH /api/v1/workspaces/:workspaceId/projects/:projectId
export async function updateProject(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid project update", parsed.error.flatten());
  }

  const wsId = param(req, "workspaceId");
  const projId = param(req, "projectId");

  const project = await Project.findOne({ _id: projId, workspaceId: wsId });
  if (!project) {
    throw ApiError.notFound("Project not found");
  }

  if (parsed.data.title !== undefined) project.title = parsed.data.title;
  if (parsed.data.status !== undefined) project.status = parsed.data.status;
  if (parsed.data.color !== undefined) project.color = parsed.data.color;
  if (parsed.data.dueDate !== undefined) {
    project.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
  }
  await project.save();

  res.status(200).json({ project: toProjectPublic(project) });
}

// DELETE /api/v1/workspaces/:workspaceId/projects/:projectId
export async function deleteProject(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const wsId = param(req, "workspaceId");
  const projId = param(req, "projectId");

  const project = await Project.findOneAndDelete({ _id: projId, workspaceId: wsId });
  if (!project) {
    throw ApiError.notFound("Project not found");
  }

  await Task.deleteMany({ projectId: project._id });
  await Activity.create({
    workspaceId: wsId,
    actorId: req.user.id,
    type: "task:deleted",
    entityId: String(project._id),
    entityType: "project",
    metadata: {},
  });

  res.status(204).send();
}
