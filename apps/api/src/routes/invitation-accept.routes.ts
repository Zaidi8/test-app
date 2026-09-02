import { Router } from "express";

import * as invitationController from "../controllers/invitation.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router: Router = Router();

// Accepting an invitation is not scoped under a workspace, so it's mounted
// at /api/v1/invitations rather than /api/v1/workspaces/:id/invitations.
router.post(
  "/:token/accept",
  requireAuth,
  asyncHandler(invitationController.acceptInvitation),
);

export default router;
