//Retrieval-Augmented Generation (RAG) undestand the meaning of the movie to recomand af

import sequelize from "../config/database.js";
import { Movie } from "../models/index.js";
import { embedText } from "./geminiService.js";

const SIMILARITY_THRESHOLD = 0.75;

export async function searchCatalog(query, limit = 5) {
  const queryVector = await embedText(query);
  const vectorParam = `[${queryVector.join(",")}]`;

  const results = await Movie.findAll({
    attributes: {
      include: [[sequelize.literal("embedding <=> $vector"), "distance"]],
    },
    where: sequelize.literal("embedding <=> $vector < $threshold"),
    order: sequelize.literal("embedding <=> $vector"),
    limit,
    bind: { vector: vectorParam, threshold: SIMILARITY_THRESHOLD },
  });

  return results;
}