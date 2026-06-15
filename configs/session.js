const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./sequelize'); // Adjust the path to your Sequelize instance

// Configure Sequelize Store
const sessionStore = new SequelizeStore({
  db: sequelize,
});

// Sync the session store with the database
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET, // Replace with a secure secret
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});

module.exports = sessionMiddleware;
