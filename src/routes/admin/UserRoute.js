// Import express
const { EXPRESS } = require("../../../configs/constants").constants;

// Create the router
const ROUTER = EXPRESS.Router();

// Import the policy
const { CheckAdminAuth } = require("../../policies/CheckAdminAuth");

// Import the controller
const UserController = require("../../controllers/admin/UserController");

// Define the routes
ROUTER.get("/users", [CheckAdminAuth], UserController.getAllUsers)
  .get("/users/:id", [CheckAdminAuth], UserController.getSingleUserDetails)
  .patch("/users/:id", [CheckAdminAuth], UserController.updateSingleUser)
  .post("/users/:id", [CheckAdminAuth], UserController.deleteSingleUser);

// Export the router
module.exports = ROUTER;
