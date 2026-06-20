const { EXPRESS } = require("../../../configs/constants").constants;
const ROUTER = EXPRESS.Router();

// Importing routes
const UserRoute = require("./UserRoute");

// User Routes
ROUTER.use("/", UserRoute);

module.exports = ROUTER;
