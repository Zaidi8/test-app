import { Router } from "express";

import * as invitationController from "../controllers/invitation.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router: Router = Router();

router.post(
  "/:workspaceId/invitations",
  requireAuth,
  requireWorkspaceRole("admin"),
  asyncHandler(invitationController.createInvitation),
);
router.get(
  "/:workspaceId/invitations",
  requireAuth,
  requireWorkspaceRole("admin"),
  asyncHandler(invitationController.listInvitations),
);
router.delete(
  "/:workspaceId/invitations/:invitationId",
  requireAuth,
  requireWorkspaceRole("admin"),
  asyncHandler(invitationController.revokeInvitation),
);

export default router;
