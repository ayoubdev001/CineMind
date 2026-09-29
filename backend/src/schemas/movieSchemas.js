import { z } from "zod";

export const listMoviesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  genre: z.string().trim().optional(),
  search: z.string().trim().optional(),
  mediaType: z.enum(["movie", "tv_show"]).optional(),
  nowPlaying: z.coerce.boolean().optional(),
});

