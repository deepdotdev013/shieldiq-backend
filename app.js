// Load envionment variables from .env file
require("dotenv").config();

// Load modules
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const CORS = require("cors");
const { createServer } = require("http");
const { I18n } = require("i18n");

// Load routes and configs
const authRoutes = require("./src/routes/user/AuthRoute");
const userRoutes = require("./src/routes/user");
const adminRoutes = require("./src/routes/admin");
const { locales, defaultLocale } = require("./configs/i18n");
const { cors } = require("./configs/security");
const sessionMiddleware = require("./configs/session");
const { sequelize } = require("./src/models");
const { startServer } = require("./src/utils/listenServer");

// Initialize i18n
const i18n = new I18n({
  locales,
  directory: __dirname + "/configs/locales",
  defaultLocale,
  objectNotation: true,
});

// Create express app
const app = express();
const server = createServer(app);

// Middlewares & Session
app.use(sessionMiddleware);
app.use(CORS(cors));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(i18n.init);

// Routes
app.use("/api/v1", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, async () => {
  await startServer(server, sequelize, PORT);
});
