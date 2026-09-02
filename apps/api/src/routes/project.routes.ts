import { Router } from "express";

import * as projectController from "../controllers/project.controller.js";
import * as taskController from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router: Router = Router();

router.use(requireAuth);

// Projects CRUD
router.get(
  "/:workspaceId/projects",
  requireWorkspaceRole("viewer"),
  asyncHandler(projectController.listProjects),
);
router.post(
  "/:workspaceId/projects",
  requireWorkspaceRole("member"),
  asyncHandler(projectController.createProject),
);
router.patch(
  "/:workspaceId/projects/:projectId",
  requireWorkspaceRole("member"),
  asyncHandler(projectController.updateProject),
);
router.delete(
  "/:workspaceId/projects/:projectId",
  requireWorkspaceRole("member"),
  asyncHandler(projectController.deleteProject),
);

// Tasks nested under projects
router.get(
  "/:workspaceId/projects/:projectId/tasks",
  requireWorkspaceRole("viewer"),
  asyncHandler(taskController.listTasks),
);
router.post(
  "/:workspaceId/projects/:projectId/tasks",
  requireWorkspaceRole("member"),
  asyncHandler(taskController.createTask),
);
router.patch(
  "/:workspaceId/projects/:projectId/tasks/:taskId",
  requireWorkspaceRole("member"),
  asyncHandler(taskController.updateTask),
);
router.patch(
  "/:workspaceId/projects/:projectId/tasks/:taskId/status",
  requireWorkspaceRole("member"),
  asyncHandler(taskController.updateTaskStatus),
);
router.delete(
  "/:workspaceId/projects/:projectId/tasks/:taskId",
  requireWorkspaceRole("member"),
  asyncHandler(taskController.deleteTask),
);

// Comments on tasks
router.get(
  "/:workspaceId/projects/:projectId/tasks/:taskId/comments",
  requireWorkspaceRole("viewer"),
  asyncHandler(taskController.listComments),
);
router.post(
  "/:workspaceId/projects/:projectId/tasks/:taskId/comments",
  requireWorkspaceRole("member"),
  asyncHandler(taskController.createComment),
);
router.patch(
  "/:workspaceId/projects/:projectId/tasks/:taskId/comments/:commentId",
  requireWorkspaceRole("member"),
  asyncHandler(taskController.updateComment),
);
router.delete(
  "/:workspaceId/projects/:projectId/tasks/:taskId/comments/:commentId",
  requireWorkspaceRole("member"),
  asyncHandler(taskController.deleteComment),
);

export default router;
