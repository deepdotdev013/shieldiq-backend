const { Sequelize } = require('sequelize');
const { adapter, url } = require('./datastores');

module.exports.sequelize = new Sequelize(url, {
  dialect: adapter,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  },
  logging: console.log, // Enable logging to capture SQL queries in Render
});
