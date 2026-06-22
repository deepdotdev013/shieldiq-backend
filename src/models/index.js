const { sequelize } = require("../../configs/sequelize");
const User = require("./User");
const Media = require("./Media");
const Campaign = require("./Campaign");
const CampaignEmail = require("./CampaignEmail");
const CampaignEmailMapping = require("./CampaignEmailMapping");

module.exports = {
  sequelize,
  User,
  Media,
  Campaign,
  CampaignEmail,
  CampaignEmailMapping,
};
