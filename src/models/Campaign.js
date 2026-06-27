/**
 * Campaign.js
 * @description :: A model definition. Represents a campaign in the system.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/sequelize");
const { defaultAttributes, CAMPAIGN_STATUS } =
  require("../../configs/constants").constants;

const Campaign = sequelize.define(
  "Campaign",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    ...defaultAttributes,
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    targetDepartment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: CAMPAIGN_STATUS.Draft,
    },
  },
  {
    tableName: "campaigns",
    timestamps: false,
  },
);

module.exports = Campaign;
