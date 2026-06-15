/**
 * Media.js
 * @description :: A model definition. Represents a user in the system.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/sequelize");
const { defaultAttributes } = require("../../configs/constants").constants;

const Media = sequelize.define(
  "Media",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    ...defaultAttributes,
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mediaType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullPath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.DECIMAL(1000, 2),
      defaultValue: 0,
    },
  },
  {
    tableName: "media",
    timestamps: false,
  },
);

module.exports = Media;
