import { Router } from "express";
import { validateQuery } from "../middleware/validate.js";
import { listMoviesQuerySchema } from "../schemas/movieSchemas.js";
import { list, getById } from "../controllers/movieController.js";

const router = Router();

router.get("/", validateQuery(listMoviesQuerySchema), list);
router.get("/:id", getById);

export default router;