import { Op } from "sequelize";
import { Movie, Genre } from "../models/index.js";
import { httpError } from "../middleware/errorHandler.js";

export async function list(req, res) {
  const { page, limit, genre, search, mediaType, nowPlaying } = req.validatedQuery;

  const where = {};
  if (mediaType) where.mediaType = mediaType;
  if (search) where.title = { [Op.iLike]: `%${search}%` };
  if (nowPlaying) where.isNowPlaying = true;

  const include = [{
    model: Genre,
    through: { attributes: [] },
    ...(genre ? { where: { name: genre }, required: true } : {}),
  }];

  const { rows, count } = await Movie.findAndCountAll({
    where,
    include,
    limit,
    offset: (page - 1) * limit,
    distinct: true,
    order: [["releaseDate", "DESC"], ["id", "DESC"]],
  });

  res.json({
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

export async function getById(req, res) {
  const movie = await Movie.findByPk(req.params.id, {
    include: [{ model: Genre, through: { attributes: [] } }],
  });
  if (!movie) throw httpError(404, "Movie not found");
  res.json(movie);
}

export async function getSimilar(req, res) {
  const { id } = req.params;

  // 1. Get current movie and its genres
  const movie = await Movie.findByPk(id, {
    include: [{ model: Genre, through: { attributes: [] } }],
  });

  if (!movie) throw httpError(404, "Movie not found");

  const genreIds = movie.Genres ? movie.Genres.map((g) => g.id) : [];

  // 2. Query movies sharing the same genres, excluding the current movie
  const similar = await Movie.findAll({
    where: {
      id: { [Op.ne]: id },
    },
    include: [
      {
        model: Genre,
        through: { attributes: [] },
        ...(genreIds.length > 0
          ? { where: { id: { [Op.in]: genreIds } }, required: true }
          : {}),
      },
    ],
    limit: 10,
    order: [["releaseDate", "DESC"]],
  });

  res.json(similar);
}