import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const Movie = sequelize.define(
  "Movie",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    tmdbId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    overview: {
      type: DataTypes.TEXT,
    },

    posterUrl: {
      type: DataTypes.STRING,
    },

    releaseDate: {
      type: DataTypes.DATEONLY,
    },

    isNowPlaying: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    mediaType: {
      type: DataTypes.ENUM("movie", "tv_show"),
      allowNull: false,
    },
    embedding: {
      type: DataTypes.VECTOR(768),
      allowNull: true, // null until the embed script runs
    },
  },
  {
    tableName: "movies",
    timestamps: true,
    indexes: [
      // TMDB movie IDs and TV IDs can overlap, so uniqueness includes the type
      { unique: true, fields: ["tmdbId", "mediaType"] },
      { fields: ["title"] },
    ],
  }
);

// Keep embedding text generation in one place for all Movie instances.
Movie.prototype.toEmbeddingText = function (genreNames = []) {
  const parts = [this.title, this.overview, genreNames.join(", "), this.mediaType];
  return parts.filter(Boolean).join(". ");
};

