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

    duration: {
      type: DataTypes.INTEGER,
    },

    mediaType: {
      type: DataTypes.ENUM("movie", "tv_show"),
      allowNull: false,
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