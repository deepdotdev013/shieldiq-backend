const { EXPRESS } = require("../../configs/constants").constants;
const ROUTER = EXPRESS.Router();

// Importing routes
const AuthRoute = require("./user/AuthRoute");
const UserRoute = require("./user/UserRoute");
const AdminUserRoute = require("./admin/UserRoute");

// User Routes
ROUTER.use("/", AuthRoute);
ROUTER.use("/user", UserRoute);

// Admin Routes
ROUTER.use("/admin", AdminUserRoute);

module.exports = ROUTER;
