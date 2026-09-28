import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("user", "assistant", "system"),
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    toolCalls: {
      type: DataTypes.JSONB,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
    indexes: [{ fields: ["conversationId"] }],
  }
);