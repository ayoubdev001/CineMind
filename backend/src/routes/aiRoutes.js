import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { chatMessageSchema } from "../schemas/aiSchemas.js";
import { chat } from "../controllers/aiController.js";

const router = Router();

router.use(authMiddleware);
router.post("/chat", validate(chatMessageSchema), chat);

export default router;