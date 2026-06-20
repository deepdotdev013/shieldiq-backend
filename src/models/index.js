const { sequelize } = require("../../configs/sequelize");
const User = require("./User");
const Media = require("./Media");
const Campaign = require("./Campaign");

module.exports = {
  sequelize,
  User,
  Media,
  Campaign,
};
