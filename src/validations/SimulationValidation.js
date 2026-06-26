const { VALIDATOR, VALIDATION_EVENTS } = require("../../configs/constants").constants;

// Create a function to validate the data.
const validateSimulationData = (bodyData) => {
    let rules = {};

    // Validate the data according to the eventCode.
    switch (bodyData.eventCode) {
        case VALIDATION_EVENTS.GetAllSimulations: {
            // Define the rules
            rules = {
                search: "string",
                limit: "integer|required",
                offset: "integer|required",
                status: "string",
                sortOrder: "string|required",
            };
            break;
        }

        case VALIDATION_EVENTS.CreateSimulationEvent: {
            rules = {
                userId: "string|required",
                campaignId: "string|required",
                campaignEmailId: "string|required",
                eventType: "string|required",
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

module.exports = { validateSimulationData };
