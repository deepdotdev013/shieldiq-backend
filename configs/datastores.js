require("dotenv").config();

module.exports = {
  adapter: process.env.DB_DIALECT,
  url: process.env.DB_URL,
};
