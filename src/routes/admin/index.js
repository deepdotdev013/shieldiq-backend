const { EXPRESS } = require("../../../configs/constants").constants;
const ROUTER = EXPRESS.Router();

// Importing routes
const UserRoute = require("./UserRoute");
const CampaignRoute = require("./CampaignRoute");

// Admin Routes
ROUTER.use("/", UserRoute);
ROUTER.use("/campaigns", CampaignRoute);

module.exports = ROUTER;
