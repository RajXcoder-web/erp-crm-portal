import { Router } from "express";
import { login, register, me } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema, registerSchema } from "./auth.validation";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();

router.post("/login", validate(loginSchema), login);

// Only an Admin can create new user accounts.
router.post("/register", requireAuth, requireRole("ADMIN"), validate(registerSchema), register);

router.get("/me", requireAuth, me);

export default router;
