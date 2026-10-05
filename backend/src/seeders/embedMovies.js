import "dotenv/config";
import { sequelize, Movie, Genre } from "../models/index.js";
import { embedText } from "../services/geminiService.js";
import { Op } from "sequelize";



async function run() {
  const movies = await Movie.findAll({
    where: { embedding: { [Op.is]: null } },
    include: [{ model: Genre, through: { attributes: [] } }],
  });

  console.log(`Embedding ${movies.length} titles...`);

  for (const movie of movies) {
    const genreNames = movie.Genres.map((g) => g.name);
    const text = movie.toEmbeddingText(genreNames);

    const vector = await embedText(text);
    movie.embedding = vector;
    await movie.save();

    console.log(`✓ ${movie.title}`);
  }

  console.log("Done.");
  await sequelize.close();
}

run().catch(async (err) => {
  console.error("Embedding failed:", err);
  await sequelize.close();
  process.exit(1);
});