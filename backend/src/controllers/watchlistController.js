import { Watchlist } from "../models/index.js";
import { makeLibraryService } from "../services/libraryService.js";

const service = makeLibraryService(Watchlist, "watchlist");

export const list = async (req, res) => res.json(await service.list(req.userId));
export const add = async (req, res) => res.status(201).json(await service.add(req.userId, req.body.movieId));
export const remove = async (req, res) => {
  await service.remove(req.userId, Number(req.params.movieId));
  res.status(204).send();
};