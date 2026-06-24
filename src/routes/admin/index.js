const { EXPRESS } = require("../../../configs/constants").constants;
const ROUTER = EXPRESS.Router();

// Importing routes
const UserRoute = require("./UserRoute");
const CampaignRoute = require("./CampaignRoute");
const CampaignEmailRoute = require("./CampaignEmailRoute");
const DashboardRoute = require("./DashboardRoute");

// Admin Routes
ROUTER.use("/", UserRoute);
ROUTER.use("/campaigns", CampaignRoute);
ROUTER.use("/campaign-emails", CampaignEmailRoute);
ROUTER.use("/dashboard", DashboardRoute);

module.exports = ROUTER;
