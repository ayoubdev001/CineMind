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
    distinct: true, // needed for correct count when joining
    order: [["releaseDate", "DESC"]],
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