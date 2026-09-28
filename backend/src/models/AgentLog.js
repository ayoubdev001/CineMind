import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const AgentLog = sequelize.define(
  "AgentLog",
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

    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    requestMeta: {
      type: DataTypes.JSONB,
    },

    status: {
      type: DataTypes.ENUM("success", "refused", "error"),
      allowNull: false,
    },
  },
  {
    tableName: "agent_logs",
    timestamps: true,
  }
);