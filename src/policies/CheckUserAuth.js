const { RESPONSE_CODES, JWT_TYPE, ROLES } =
  require("../../configs/constants").constants;
const { verifyToken } = require("../utils/tokenUtils");

module.exports.CheckUserAuth = async (req, res, next) => {
  try {
    // access the token from the headers.
    const token = req.headers["authorization"];

    // If language is not set in headers then set 'en' automatically.
    const lang = req.headers.lang ? req.headers.lang : "en";

    // set local language.
    req.setLocale(lang);

    // If token not found,send required error.
    if (!token) {
      return res.status(RESPONSE_CODES.Unauthorized).send({
        status: RESPONSE_CODES.Unauthorized,
        message: req.__("AUTHORIZATION_TOKEN_REQUIRED"),
        data: null,
      });
    }

    // Decode the user and store the decoded user.
    const decodedUser = await verifyToken(token, JWT_TYPE.LoginUser);

    // If any issue occurs during decoding, send error.
    if (decodedUser.hasError) {
      return res.status(RESPONSE_CODES.Unauthorized).json({
        status: RESPONSE_CODES.Unauthorized,
        message: req.__("INVALID_AUTHORIZATION_TOKEN"),
        data: null,
      });
    }

    // Check if the user is authorized to access the resource.
    if (decodedUser.data.role !== ROLES.User) {
      return res.status(RESPONSE_CODES.Unauthorized).json({
        status: RESPONSE_CODES.Unauthorized,
        message: req.__("UNAUTHORIZED_ACCESS"),
        data: null,
      });
    }

    // Send the decoded user data in the req.user object.
    req.user = decodedUser.data;

    // Call to next function.
    next();
  } catch (error) {
    return res.status(RESPONSE_CODES.Unauthorized).send({
      status: RESPONSE_CODES.Unauthorized,
      message: req.__("INVALID_AUTHORIZATION_TOKEN"),
      data: null,
    });
  }
};
