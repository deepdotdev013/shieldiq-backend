const { EXPRESS } = require("../../../configs/constants").constants;
const ROUTER = EXPRESS.Router();

// Importing routes
const UserRoute = require("./UserRoute");
const SimulationRoute = require("./SimulationRoute");
const DashboardRoute = require("./DashboardRoute");

// User Routes
ROUTER.use("/", UserRoute);
ROUTER.use("/simulations", SimulationRoute);
ROUTER.use("/dashboard", DashboardRoute);

module.exports = ROUTER;
