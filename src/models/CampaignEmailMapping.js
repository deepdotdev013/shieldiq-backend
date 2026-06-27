/**
 * CampaignEmailMapping.js
 * @description :: A model definition. Represents a campaign email mapping in the system.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/sequelize");
const { defaultAttributes } = require("../../configs/constants").constants;

const CampaignEmailMapping = sequelize.define(
  "CampaignEmailMapping",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    ...defaultAttributes,
    campaignId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "campaigns",
        key: "id",
      },
    },
    campaignEmailId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "campaign_emails",
        key: "id",
      },
    },
  },
  {
    tableName: "campaign_email_mappings",
    timestamps: false,
  },
);

module.exports = CampaignEmailMapping;
