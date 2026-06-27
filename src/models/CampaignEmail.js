/**
 * CampaignEmail.js
 * @description :: A model definition. Represents a campaign email in the system.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/sequelize");
const { defaultAttributes, CAMPAIGN_STATUS } =
  require("../../configs/constants").constants;

const CampaignEmail = sequelize.define(
  "CampaignEmail",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    ...defaultAttributes,
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fromEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    linkText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPhishing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isCreatedByAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "campaign_emails",
    timestamps: false,
  },
);

module.exports = CampaignEmail;
