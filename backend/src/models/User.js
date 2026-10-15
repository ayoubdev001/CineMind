import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);