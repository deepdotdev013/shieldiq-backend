// Import express
const { EXPRESS } = require("../../../configs/constants").constants;

// Create the router
const ROUTER = EXPRESS.Router();

// Import the policy
const { CheckUserAuth } = require("../../policies/CheckUserAuth");

// Import the controller
const DashboardController = require("../../controllers/user/DashboardController");

// Define the routes
ROUTER.get("/stats", [CheckUserAuth], DashboardController.getDashboardStats)
  .get("/trends", [CheckUserAuth], DashboardController.getDashboardTrends)
  .get(
    "/pending-simulations",
    [CheckUserAuth],
    DashboardController.getPendingSimulations,
  )
  .get(
    "/activity-ledger",
    [CheckUserAuth],
    DashboardController.getActivityLedger,
  );

// Export the router
module.exports = ROUTER;
