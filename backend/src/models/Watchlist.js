import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const Watchlist = sequelize.define(
  "Watchlist",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "watchlists",
    timestamps: true,
    indexes: [{ unique: true, fields: ["userId", "movieId"] }],
  }
);