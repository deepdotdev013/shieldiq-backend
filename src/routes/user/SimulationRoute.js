// Import express
const { EXPRESS } = require("../../../configs/constants").constants;

// Create the router
const ROUTER = EXPRESS.Router();

// Import the policy
const { CheckUserAuth } = require("../../policies/CheckUserAuth");

// Import the controller
const SimulationController = require("../../controllers/user/SimulationController");

// Define the routes
ROUTER.get("/", [CheckUserAuth], SimulationController.getAllSimulations)
  .post(
    "/:campaignId/events",
    [CheckUserAuth],
    SimulationController.createSimulationEvent,
  )
  .get(
    "/:campaignId/emails",
    [CheckUserAuth],
    SimulationController.getAllSimulationEmails,
  );

// Export the router
module.exports = ROUTER;
