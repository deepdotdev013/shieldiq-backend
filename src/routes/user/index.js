const { EXPRESS } = require("../../../configs/constants").constants;
const ROUTER = EXPRESS.Router();

// Importing routes
const UserRoute = require("./UserRoute");
const SimulationRoute = require("./SimulationRoute");

// User Routes
ROUTER.use("/", UserRoute);
ROUTER.use("/simulations", SimulationRoute);

module.exports = ROUTER;
