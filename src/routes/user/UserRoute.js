// Import express
const { EXPRESS } = require("../../../configs/constants").constants;

// Create the router
const ROUTER = EXPRESS.Router();

// Import the policy
const { CheckUserAuth } = require("../../policies/CheckUserAuth");

// Import the controller
const UserController = require("../../controllers/user/UserController");

// Define the routes
ROUTER.get("/me", [CheckUserAuth], UserController.getUserDetails).post(
  "/update-profile",
  [CheckUserAuth],
  UserController.updateProfileDetails,
);

// Export the router
module.exports = ROUTER;
