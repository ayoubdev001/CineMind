import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { register, login, me } from "../controllers/authController.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, me);

export default router;