// Import express
const { EXPRESS } = require("../../../configs/constants").constants;

// Create the router
const ROUTER = EXPRESS.Router();

// Import the policy
const { CheckAdminAuth } = require("../../policies/CheckAdminAuth");

// Import the controller
const CampaignController = require("../../controllers/admin/CampaignController");

// Define the routes
ROUTER.post("/", [CheckAdminAuth], CampaignController.createCampaign)
  .get("/", [CheckAdminAuth], CampaignController.listAllCampaigns)
  .get("/stats", [CheckAdminAuth], CampaignController.fetchCampaignStats)
  .get("/:id", [CheckAdminAuth], CampaignController.getCampaign)
  .patch("/:id", [CheckAdminAuth], CampaignController.updateCampaign)
  .post("/:id", [CheckAdminAuth], CampaignController.deleteCampaign);

// Export the router
module.exports = ROUTER;
