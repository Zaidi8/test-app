import { Router } from "express";

import * as activityController from "../controllers/activity.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router: Router = Router();

router.get(
  "/:workspaceId/activities",
  requireAuth,
  requireWorkspaceRole("viewer"),
  asyncHandler(activityController.listActivities),
);

export default router;
