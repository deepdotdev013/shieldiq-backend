/**
 * SimulationResult.js
 * @description :: A model definition. Represents a simulation result in the system.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/sequelize");
const { defaultAttributes } = require("../../configs/constants").constants;

const SimulationResult = sequelize.define(
  "SimulationResult",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    ...defaultAttributes,
    campaignEmailId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "campaign_emails",
        key: "id",
      },
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lesson: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "simulation_result",
    timestamps: false,
  },
);

module.exports = SimulationResult;
