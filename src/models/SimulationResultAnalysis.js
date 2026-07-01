/**
 * SimulationResultAnalysis.js
 * @description :: A model definition. Represents a simulation result analysis in the system.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/sequelize");
const { defaultAttributes } = require("../../configs/constants").constants;

const SimulationResultAnalysis = sequelize.define(
  "SimulationResultAnalysis",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    ...defaultAttributes,
    simulationResultId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "simulation_results",
        key: "id",
      },
    },
    redFlag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    displayOrder: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    tableName: "simulation_result_analysis",
    timestamps: false,
  },
);

module.exports = SimulationResultAnalysis;
