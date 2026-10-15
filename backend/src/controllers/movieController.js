import { Op, Sequelize } from "sequelize";
import { Movie, Genre } from "../models/index.js";
import { httpError } from "../middleware/errorHandler.js";

export async function list(req, res) {
  const { page = 1, limit = 10, genre, search, mediaType, nowPlaying, random, popular } = req.validatedQuery || req.query;

  const where = {};
  if (mediaType) where.mediaType = mediaType;
  if (search) where.title = { [Op.iLike]: `%${search}%` };
  
  if (nowPlaying === "true" || nowPlaying === true) {
    where.isNowPlaying = true;
  }

  const include = [{
    model: Genre,
    through: { attributes: [] },
    ...(genre ? { where: { name: genre }, required: true } : {}),
  }];

  // Determine ordering: Popularity, Random, or Default (Release Date)
  let order = [["releaseDate", "DESC"], ["id", "DESC"]];
  if (random === "true" || random === true) {
    order = [Sequelize.literal("RANDOM()")];
  } else if (popular === "true" || popular === true) {
    order = [["popularity", "DESC"]];
  }

  const { rows, count } = await Movie.findAndCountAll({
    where,
    include,
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    distinct: true,
    order,
  });

  res.json({
    data: rows,
    pagination: { page: Number(page), limit: Number(limit), total: count, totalPages: Math.ceil(count / limit) },
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

  const movie = await Movie.findByPk(id, {
    include: [{ model: Genre, through: { attributes: [] } }],
  });

  if (!movie) throw httpError(404, "Movie not found");

  const genreIds = movie.Genres ? movie.Genres.map((g) => g.id) : [];

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
    order: [Sequelize.literal("RANDOM()")],
  });

  res.json(similar);
}