import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";

/**
 * Placeholder auth router.
 * Fill in during T4 (register / login / refresh / logout / me / google OAuth).
 */
const router: Router = Router();

// Public health check for the auth module.
router.get("/status", (_req, res) => {
  res.json({ status: "auth routes mounted" });
});

// Protected example showing the auth middleware.
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
