import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { addItemSchema } from "../schemas/librarySchemas.js";
import { list, add, remove } from "../controllers/watchlistController.js";

const router = Router();

router.use(authMiddleware); // every route below requires a logged-in user

router.get("/", list);
router.post("/", validate(addItemSchema), add);
router.delete("/:movieId", remove);

export default router;