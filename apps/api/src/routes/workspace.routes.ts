import { Router } from "express";

import * as workspaceController from "../controllers/workspace.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router: Router = Router();

// All workspace routes require authentication + workspace membership.
router.use(requireAuth);

router.get("/", asyncHandler(workspaceController.listWorkspaces));
router.post("/", asyncHandler(workspaceController.createWorkspace));
router.get(
  "/:workspaceId",
  requireWorkspaceRole("viewer"),
  asyncHandler(workspaceController.getWorkspace),
);
router.patch(
  "/:workspaceId",
  requireWorkspaceRole("admin"),
  asyncHandler(workspaceController.updateWorkspace),
);
router.delete(
  "/:workspaceId",
  requireWorkspaceRole("owner"),
  asyncHandler(workspaceController.deleteWorkspace),
);

// Members
router.get(
  "/:workspaceId/members",
  requireWorkspaceRole("viewer"),
  asyncHandler(workspaceController.listMembers),
);
router.post(
  "/:workspaceId/members",
  requireWorkspaceRole("admin"),
  asyncHandler(workspaceController.addMember),
);
router.patch(
  "/:workspaceId/members/:userId",
  requireWorkspaceRole("admin"),
  asyncHandler(workspaceController.updateMemberRole),
);
router.delete(
  "/:workspaceId/members/:userId",
  requireWorkspaceRole("admin"),
  asyncHandler(workspaceController.removeMember),
);

export default router;
