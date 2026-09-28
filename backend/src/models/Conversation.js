import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const Conversation = sequelize.define(
  "Conversation",
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

    title: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "conversations",
    timestamps: true,
  }
);