import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { addItemSchema } from "../schemas/libraryySchemas.js";
import { list, add, remove } from "../controllers/favoriteController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", list);
router.post("/", validate(addItemSchema), add);
router.delete("/:movieId", remove);

export default router;