const { VALIDATOR, VALIDATION_EVENTS, CAMPAIGN_STATUS, CAMPAIGN_EMAIL_TYPES } =
  require("../../configs/constants").constants;

// Create a function to validate the data.
const validateCampaignData = (bodyData) => {
  let rules = {};

  // Validate the data according to the eventCode.
  switch (bodyData.eventCode) {
    case VALIDATION_EVENTS.CreateCampaign: {
      // Define the rules
      rules = {
        title: "string|required|min:3|max:255",
        description: "string|required|min:3|max:255",
        startDate: "string",
        endDate: "string|required",
        targetDepartment: "string|required",
        emailType: [
          "string",
          "required",
          {
            in: [
              CAMPAIGN_EMAIL_TYPES.Phishing,
              CAMPAIGN_EMAIL_TYPES.Training,
              CAMPAIGN_EMAIL_TYPES.Alert,
            ],
          },
        ],
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
        emailType: [
          "string",
          {
            in: [
              CAMPAIGN_EMAIL_TYPES.Phishing,
              CAMPAIGN_EMAIL_TYPES.Training,
              CAMPAIGN_EMAIL_TYPES.Alert,
            ],
          },
        ],
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

    case VALIDATION_EVENTS.CreateCampaignEmail: {
      rules = {
        campaignId: "string",
        sender: "string|required|min:3|max:255",
        fromEmail: "string|required|min:3|max:255",
        subject: "string|required|min:3|max:255",
        body: "string|required|min:3",
        linkText: "string",
        isPhishing: "boolean",
        isCreatedByAdmin: "boolean",
      };
      break;
    }

    case VALIDATION_EVENTS.GetCampaignEmail: {
      rules = {
        campaignEmailId: "string|required",
      };
      break;
    }

    case VALIDATION_EVENTS.ListAllCampaignEmails: {
      rules = {
        search: "string",
        limit: "integer|required",
        skip: "integer|required",
        sort: "string|required",
        sortOrder: "string|required",
        campaignId: "string",
      };
      break;
    }

    case VALIDATION_EVENTS.UpdateCampaignEmail: {
      rules = {
        campaignEmailId: "string|required",
        sender: "string",
        fromEmail: "string",
        subject: "string",
        body: "string",
        linkText: "string",
        isPhishing: "boolean",
      };
      break;
    }

    case VALIDATION_EVENTS.DeleteCampaignEmail: {
      rules = {
        campaignEmailId: "string|required",
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
