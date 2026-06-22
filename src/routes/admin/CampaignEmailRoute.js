// Import express
const { EXPRESS } = require("../../../configs/constants").constants;

// Create the router
const ROUTER = EXPRESS.Router();

// Import the policy
const { CheckAdminAuth } = require("../../policies/CheckAdminAuth");

// Import the controller
const CampaignEmailController = require("../../controllers/admin/CampaignEmailController");

// Define the routes
ROUTER.post("/", [CheckAdminAuth], CampaignEmailController.createCampaignEmail)
  .get("/", [CheckAdminAuth], CampaignEmailController.listAllCampaignEmails)
  .get("/:id", [CheckAdminAuth], CampaignEmailController.getCampaignEmail)
  .patch("/:id", [CheckAdminAuth], CampaignEmailController.updateCampaignEmail)
  .post("/:id", [CheckAdminAuth], CampaignEmailController.deleteCampaignEmail);

// Export the router
module.exports = ROUTER;
