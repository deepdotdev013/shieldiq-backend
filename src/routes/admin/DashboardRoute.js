// Import express
const { EXPRESS } = require("../../../configs/constants").constants;

// Create the router
const ROUTER = EXPRESS.Router();

// Import the policy
const { CheckAdminAuth } = require("../../policies/CheckAdminAuth");

// Import the controller
const DashboardController = require("../../controllers/admin/DashboardController");

// Define the routes
ROUTER.get(
  "/stats",
  [CheckAdminAuth],
  DashboardController.getDashboardStats,
).get("/trends", [CheckAdminAuth], DashboardController.getDashboardTrends);

// Export the router
module.exports = ROUTER;
