const { EXPRESS } = require("../../../configs/constants").constants;
const ROUTER = EXPRESS.Router();

// Importing routes
const AuthRoute = require("./AuthRoute");

// Mounting prefixes routes
ROUTER.use("/", AuthRoute);

module.exports = ROUTER;
