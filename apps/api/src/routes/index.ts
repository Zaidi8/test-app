import { Router } from "express";

import activityRouter from "./activity.routes.js";
import authRouter from "./auth.routes.js";
import invitationAcceptRouter from "./invitation-accept.routes.js";
import projectRouter from "./project.routes.js";
import workspaceInvitationRouter from "./workspace-invitation.routes.js";
import workspaceRouter from "./workspace.routes.js";

/**
 * All API routes are mounted under /api/v1.
 * Each domain (workspaces, projects, tasks, ...) gets its own router here.
 */
const apiRouter: Router = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/workspaces", workspaceRouter);
apiRouter.use("/workspaces", workspaceInvitationRouter);
apiRouter.use("/invitations", invitationAcceptRouter);
apiRouter.use("/", projectRouter);
apiRouter.use("/", activityRouter);

export default apiRouter;
