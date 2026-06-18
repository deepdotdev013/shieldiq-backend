const { EXPRESS } = require("../../configs/constants").constants;
const ROUTER = EXPRESS.Router();

// Importing routes
const AuthRoute = require("./user/AuthRoute");
const UserRoute = require("./user/UserRoute");

// Mounting prefixes routes
ROUTER.use("/", AuthRoute);
ROUTER.use("/user", UserRoute);

module.exports = ROUTER;
