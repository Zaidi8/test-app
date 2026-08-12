import { Router } from "express";

import authRouter from "./auth.routes.js";

/**
 * All API routes are mounted under /api/v1.
 * Each future domain (workspaces, projects, tasks, ...) gets its own router here.
 */
const apiRouter: Router = Router();

apiRouter.use("/auth", authRouter);

export default apiRouter;
