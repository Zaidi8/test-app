import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router: Router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));
router.get("/me", requireAuth, asyncHandler(authController.me));

// Google OAuth — return 501 (handled inside) until credentials are configured.
router.get("/google", asyncHandler(authController.googleRedirect));
router.get("/google/callback", asyncHandler(authController.googleCallback));

export default router;
