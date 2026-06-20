const { VALIDATOR, VALIDATION_EVENTS, DEPARTMENT } =
  require("../../configs/constants").constants;

// Create a function to validate the data.
const validateUserData = (bodyData) => {
  let rules = {};

  // Validate the data according to the eventCode.
  switch (bodyData.eventCode) {
    case VALIDATION_EVENTS.SignUpUserEmail: {
      // Define the rules
      rules = {
        email: "email|required",
        password: [
          "string",
          "required",
          "regex:/^(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$/",
        ],
        confirmPassword: [
          "string",
          "required",
          "regex:/^(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$/",
        ],
        fullName: "string",
        department: [
          "string",
          "required",
          {
            in: [
              DEPARTMENT.IT_SECURITY,
              DEPARTMENT.ENGINEERING,
              DEPARTMENT.HR,
              DEPARTMENT.FINANCE,
              DEPARTMENT.SALES,
              DEPARTMENT.MARKETING,
              DEPARTMENT.EXECUTIVE,
            ],
          },
        ],
      };
      break;
    }

    case VALIDATION_EVENTS.VerifyUserEmail: {
      // Define the rules
      rules = {
        token: "string|required",
      };
      break;
    }

    case VALIDATION_EVENTS.SignInUserEmail: {
      // Define the rules
      rules = {
        email: "email|required",
        password: [
          "string",
          "required",
          "regex:/^(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$/",
        ],
      };
      break;
    }

    case VALIDATION_EVENTS.ForgetPassword: {
      // Define the rules
      rules = {
        email: "email|required",
      };
      break;
    }

    case VALIDATION_EVENTS.ResetPassword: {
      // Define the rules
      rules = {
        token: "string|required",
        password: [
          "string",
          "required",
          "regex:/^(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$/",
        ],
      };
      break;
    }

    case VALIDATION_EVENTS.RefreshToken: {
      // Define the rules
      rules = {
        accessToken: "string|required",
        refreshToken: "string|required",
      };
      break;
    }

    case VALIDATION_EVENTS.GetAllUsers: {
      // Define the rules
      rules = {
        search: "string",
        department: "string",
        limit: "integer|required",
        skip: "integer|required",
        sort: "string|required",
        sortOrder: "string|required",
      };
      break;
    }

    case VALIDATION_EVENTS.GetSingleUserDetails: {
      // Define the rules
      rules = {
        userId: "string|required",
      };
      break;
    }

    case VALIDATION_EVENTS.UpdateSingleUser: {
      // Define the rules
      rules = {
        userId: "string|required",
        fullName: "string",
        department: [
          "string",
          {
            in: [
              DEPARTMENT.IT_SECURITY,
              DEPARTMENT.ENGINEERING,
              DEPARTMENT.HR,
              DEPARTMENT.FINANCE,
              DEPARTMENT.SALES,
              DEPARTMENT.MARKETING,
              DEPARTMENT.EXECUTIVE,
            ],
          },
        ],
        isActive: "boolean",
      };
      break;
    }

    case VALIDATION_EVENTS.DeleteSingleUser: {
      // Define the rules
      rules = {
        userId: "string|required",
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

module.exports = { validateUserData };
