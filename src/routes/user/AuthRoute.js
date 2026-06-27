// Import express
const { EXPRESS } = require("../../../configs/constants").constants;

// Create the router
const ROUTER = EXPRESS.Router();

// Import the policy
const { CheckUserAuth } = require("../../policies/CheckUserAuth");

// Import the controller
const AuthController = require("../../controllers/user/AuthController");

// Define the routes
ROUTER.post("/signup", AuthController.signUpUserEmail)
  .post("/verify-email", AuthController.verifyUserEmail)
  .post("/signin", AuthController.signInUserEmail)
  .post("/refresh-token", AuthController.refreshToken)
  .post("/logout", [CheckUserAuth], AuthController.logoutUser)
  .post("/forget-password", AuthController.forgetPassword)
  .post("/reset-password", AuthController.resetPassword);

// Export the router
module.exports = ROUTER;
