import { z } from "zod";

export const addItemSchema = z.object({
  movieId: z.coerce.number().int().positive(),
});