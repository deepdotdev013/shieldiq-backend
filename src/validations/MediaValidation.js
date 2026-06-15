const { VALIDATOR, VALIDATION_EVENTS, FILE_TYPES } =
  require('../../configs/constants').constants;

// Create a function to validate the data.
const validateMediaData = (bodyData) => {
  let rules = {};

  // Validate the data according to the eventCode.
  switch (bodyData.eventCode) {
    case VALIDATION_EVENTS.UploadMedia: {
      // Define the rules
      rules = {
        mediaType: [
          'string',
          'required',
          { in: [FILE_TYPES.Image, FILE_TYPES.Video] },
        ],
        mimetype: 'string|required',
        duration: 'numeric',
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

module.exports = { validateMediaData };
