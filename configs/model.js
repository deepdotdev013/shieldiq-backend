const { DataTypes } = require('sequelize');

// defaultAttributes to add in every model.
module.exports.defaultAttributes = {
  createdAt: {
    type: DataTypes.BIGINT,
    defaultValue: () => Date.now(),
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.BIGINT,
    defaultValue: () => Date.now(),
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
};
