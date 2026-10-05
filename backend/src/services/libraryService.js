import { Movie } from "../models/index.js";
import { httpError } from "../middleware/errorHandler.js";


//watchlist logic
export function makeLibraryService(Model, label) {
  return {
    async list(userId) {
      return Model.findAll({
        where: { userId },
        include: [{ model: Movie }],
        order: [["createdAt", "DESC"]],
      });
    },

    async add(userId, movieId) {
      const movie = await Movie.findByPk(movieId);
      if (!movie) throw httpError(404, "Movie not found");

      const [item, created] = await Model.findOrCreate({
        where: { userId, movieId },
      });
      if (!created) throw httpError(409, `Already in ${label}`);
      return item;
    },

    async remove(userId, movieId) {
      const deleted = await Model.destroy({ where: { userId, movieId } });
      if (!deleted) throw httpError(404, `Not in ${label}`);
    },
  };
}