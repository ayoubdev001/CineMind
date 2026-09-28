import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const UserPreference = sequelize.define(
  "UserPreference",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    favoriteGenres: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },

  },
  {
    tableName: "user_preferences",
    timestamps: true,
  }
);