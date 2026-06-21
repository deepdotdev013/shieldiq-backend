const { VALIDATOR, VALIDATION_EVENTS, CAMPAIGN_STATUS } =
  require("../../configs/constants").constants;

// Create a function to validate the data.
const validateCampaignData = (bodyData) => {
  let rules = {};

  // Validate the data according to the eventCode.
  switch (bodyData.eventCode) {
    case VALIDATION_EVENTS.CreateCampaign: {
      // Define the rules
      rules = {
        title: "string|required",
        description: "string|required",
        startDate: "string",
        endDate: "string|required",
        targetDepartment: "string|required",
        emailType: "string|required",
        status: [
          "string",
          "required",
          {
            in: [
              CAMPAIGN_STATUS.Draft,
              CAMPAIGN_STATUS.Active,
              CAMPAIGN_STATUS.Completed,
              CAMPAIGN_STATUS.Cancelled,
            ],
          },
        ],
      };
      break;
    }

    case VALIDATION_EVENTS.GetCampaign: {
      rules = {
        campaignId: "string|required",
      };
      break;
    }

    case VALIDATION_EVENTS.ListAllCampaigns: {
      rules = {
        search: "string",
        limit: "integer|required",
        skip: "integer|required",
        sort: "string|required",
        sortOrder: "string|required",
      };
      break;
    }

    case VALIDATION_EVENTS.UpdateCampaign: {
      rules = {
        campaignId: "string|required",
        title: "string",
        description: "string",
        startDate: "string",
        endDate: "string",
        targetDepartment: "string",
        emailType: "string",
        status: [
          "string",
          {
            in: [
              CAMPAIGN_STATUS.Draft,
              CAMPAIGN_STATUS.Active,
              CAMPAIGN_STATUS.Completed,
              CAMPAIGN_STATUS.Cancelled,
            ],
          },
        ],
      };
      break;
    }

    case VALIDATION_EVENTS.DeleteCampaign: {
      rules = {
        campaignId: "string|required",
      };
      break;
    }

    default:
      break;
  }

  // Validate the data on the defined rules.
  const validation = new VALIDATOR(bodyData, rules);

  // If validation fails, set the error.
  if (validation.fails()) {
    return {
      hasError: true,
      errors: validation.errors.all(),
    };
  }

  // Else do not send any error.
  return {
    hasError: false,
    errors: null,
  };
};

module.exports = { validateCampaignData };
