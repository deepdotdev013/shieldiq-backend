/**
 * CampaignEvent.js
 * @description :: A model definition. Represents a campaign event in the system.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/sequelize");
const { defaultAttributes } = require("../../configs/constants").constants;

const CampaignEvent = sequelize.define(
  "CampaignEvent",
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
      allowNull: true,
      references: {
        model: "campaign_emails",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scoreImpact: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "campaign_events",
    timestamps: false,
  },
);

module.exports = CampaignEvent;
