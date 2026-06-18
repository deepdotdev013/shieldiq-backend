// Import express
const { EXPRESS } = require("../../../configs/constants").constants;

// Create the router
const ROUTER = EXPRESS.Router();

// Import the policy
const { CheckAdminAuth } = require("../../policies/CheckAdminAuth");

// Import the controller
const UserController = require("../../controllers/admin/UserController");

// Define the routes
ROUTER.get("/users", [CheckAdminAuth], UserController.getAllUsers);

// Export the router
module.exports = ROUTER;
