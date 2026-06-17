const {
  RESPONSE_CODES,
  VALIDATION_EVENTS,
  BCRYPT,
  SALT_ROUNDS,
  UUID,
  JWT_TYPE,
  EMAIL_EVENTS,
  JWT_EXPIRY,
  Op,
  ROLES,
} = require("../../../configs/constants").constants;
const { validateUserData } = require("../../validations/UserValidation");
const { User, sequelize } = require("../../models");
const { generateToken, verifyToken } = require("../../utils/tokenUtils");
const { sendMail } = require("../../helpers/sendMail");

module.exports = {
  /**
   * @name signUpUserEmail
   * @path /user/signup
   * @method POST
   * @schema User
   * @param {string} - req.body.email - Email of the user
   * @param {string} - req.body.password - Password of the user
   * @param {string} - req.body.confirmPassword - To confirm the entered password
   * @param {string} - req.body.fullName - Full Name of the user
   * @param {string} - req.body.department - Department of the user
   * @description This method is used to register a user using email.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  signUpUserEmail: async (req, res) => {
    try {
      // Create the bodyData
      const bodyData = {
        id: UUID.v4(),
        email: req.body.email && req.body.email.toLowerCase().trim(),
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        fullName: req.body.fullName && req.body.fullName.trim(),
        department: req.body.department && req.body.department.toLowerCase(),
        eventCode: VALIDATION_EVENTS.SignUpUserEmail,
      };

      // Validate the incoming data
      const result = validateUserData(bodyData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Check if the email is already registered
      const isExistingEmail = await User.findOne({
        where: {
          email: bodyData.email,
          isDeleted: false,
        },
      });
      if (isExistingEmail) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("EMAIL_ALREADY_REGISTERED"),
          data: null,
        });
      }

      // Compare the password and confirm password
      if (bodyData.password !== bodyData.confirmPassword) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("PASSWORD_MISMATCH"),
          data: null,
        });
      }

      // Hash the password using bcrypt
      const hashedPassword = await BCRYPT.hash(bodyData.password, SALT_ROUNDS);

      // Generate the JWT Token
      const generateVerificationToken = await generateToken({
        id: bodyData.id,
        email: bodyData.email,
        role: ROLES.User,
        type: JWT_TYPE.VerifyEmail,
      });

      // If any error occurs while generating the token, then send an error
      if (generateVerificationToken.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("TOKEN_GENERATION_ERROR"),
          error: generateVerificationToken.error,
        });
      }

      // Append the updated fields in the bodyData
      bodyData.password = hashedPassword;
      bodyData.verificationToken = generateVerificationToken.data;

      // Create a new user
      const newUser = await User.create(bodyData);

      // Create the input params.
      const inputs = {
        subType: EMAIL_EVENTS.VerifyUser,
        payload: {
          lang: "en",
          name: newUser.fullName || "User",
          toUser: newUser.email,
          MailSubject: req.__("VERIFY_EMAIL_TITLE"),
          link: `${process.env.FRONTEND_URL}/verify-email?token=${generateVerificationToken.data}`,
          supportEmail: process.env.SMTP_SENDER,
          websiteLink: process.env.WEBSITE_URL || "www.google.com",
        },
      };

      // Send the email
      await sendMail(inputs);

      // Success Response
      return res.status(RESPONSE_CODES.Created).json({
        status: RESPONSE_CODES.Created,
        message: req.__("USER_SIGNUP_SUCCESS"),
        data: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(RESPONSE_CODES.ServerError).json({
        status: RESPONSE_CODES.ServerError,
        message: req.__("WENTS_WRONG"),
        data: null,
      });
    }
  },

  /**
   * @name verifyUserEmail
   * @path /user/verify-email
   * @method POST
   * @schema User
   * @param {string} - req.body.token - Token of the created user
   * @description This method is used to verify a user's email using key token.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  verifyUserEmail: async (req, res) => {
    try {
      // Create the bodyData
      const bodyData = {
        token: req.body.token,
        eventCode: VALIDATION_EVENTS.VerifyUserEmail,
      };

      // Validate the incoming data
      const result = validateUserData(bodyData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Find the user with the incoming token in its verificationToken.
      const user = await User.findOne({
        where: {
          verificationToken: bodyData.token,
          isDeleted: false,
        },
      });
      if (!user) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("USER_NOT_FOUND"),
          error: error,
        });
      }

      // Verify the token
      const verifiedToken = await verifyToken(
        bodyData.token,
        JWT_TYPE.VerifyEmail,
      ).catch((error) => {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("INVALID_TOKEN"),
          error: error,
        });
      });

      // Check if the user's email is already verified.
      if (verifiedToken?.data?.isEmailVerified) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("EMAIL_ALREADY_VERIFIED"),
          data: null,
        });
      }

      // Verify the user's email.
      await User.update(
        {
          isEmailVerified: true,
          verificationToken: null,
          updatedAt: Date.now(),
          updatedBy: user.id,
        },
        {
          where: {
            id: verifiedToken.data.id,
            isDeleted: false,
          },
        },
      );

      // Success Response
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("EMAIL_VERIFY_SUCCESS"),
        data: null,
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(RESPONSE_CODES.ServerError).json({
        status: RESPONSE_CODES.ServerError,
        message: req.__("WENTS_WRONG"),
        data: null,
      });
    }
  },

  /**
   * @name signInUserEmail
   * @path /user/signin
   * @method POST
   * @schema User
   * @param {string} - req.body.email - Email of the user
   * @param {string} - req.body.password - Password of the user
   * @description This method is used to sign-in a user.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  signInUserEmail: async (req, res) => {
    try {
      // Create the bodyData
      const bodyData = {
        email: req.body.email && req.body.email.trim().toLowerCase(),
        password: req.body.password,
        eventCode: VALIDATION_EVENTS.SignInUserEmail,
      };

      // Validate the incoming data
      const result = validateUserData(bodyData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Check if the user exists.
      const isExistingUser = await User.findOne({
        where: {
          email: bodyData.email,
          isDeleted: false,
        },
      });
      if (!isExistingUser) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("USER_NOT_FOUND"),
          data: null,
        });
      }

      // Check if the email is not verified.
      if (!isExistingUser.isEmailVerified) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("EMAIL_NOT_VERIFIED"),
          data: null,
        });
      }

      // Check if the user is active.
      if (!isExistingUser.isActive) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("USER_NOT_ACTIVE"),
          data: null,
        });
      }

      // Match the incoming password with the user's saved password.
      const isPasswordMatch = await BCRYPT.compare(
        bodyData.password,
        isExistingUser.password,
      );

      // If the password didn't matched, send error.
      if (!isPasswordMatch) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("INCORRECT_CREDS"),
          data: null,
        });
      }

      // Generate the JWT Access Token
      const accessToken = await generateToken(
        {
          id: isExistingUser.id,
          email: isExistingUser.email,
          role: isExistingUser.role,
          type: JWT_TYPE.LoginUser,
        },
        JWT_EXPIRY.Access,
      );

      // If any error occurs while generating the token, then send an error
      if (accessToken.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("TOKEN_GENERATION_ERROR"),
          error: accessToken.error,
        });
      }

      // Generate the JWT Refresh Token
      const refreshToken = await generateToken(
        {
          id: isExistingUser.id,
          email: isExistingUser.email,
          role: isExistingUser.role,
          type: JWT_TYPE.LoginUser,
        },
        JWT_EXPIRY.Refresh,
      );

      // If any error occurs while generating the token, then send an error
      if (refreshToken.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("TOKEN_GENERATION_ERROR"),
          error: refreshToken.error,
        });
      }

      // Update the user.
      await User.update(
        {
          accessToken: accessToken.data,
          refreshToken: refreshToken.data,
          lastLoginAt: Date.now(),
          updatedAt: Date.now(),
          updatedBy: isExistingUser.id,
        },
        {
          where: {
            id: isExistingUser.id,
          },
        },
      );

      // Success Response
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("LOGIN_SUCCESS"),
        data: {
          id: isExistingUser.id,
          email: isExistingUser.email,
          fullName: isExistingUser.fullName,
          role: isExistingUser.role,
          accessToken: accessToken.data,
          refreshToken: refreshToken.data,
        },
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(RESPONSE_CODES.ServerError).json({
        status: RESPONSE_CODES.ServerError,
        message: req.__("WENTS_WRONG"),
        data: null,
      });
    }
  },

  /**
   * @name getUserDetails
   * @path /user/me
   * @method GET
   * @schema User
   * @description This method is used to fetch all the details of logged in user.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  getUserDetails: async (req, res) => {
    try {
      // Query to fetch users details.
      const fetchUserDetails = `SELECT
        	U."id",
        	U."profilePhotoId",
        	U."fullName",
        	U."email",
        	U."department",
          U."role",
        	U."accessToken",
        	U."refreshToken",
        	U."isEmailVerified",
          U."securityScore",
          CASE WHEN U."profilePhotoId" IS NULL AND M."mediaUrl" IS NULL THEN NULL
            ELSE JSONB_BUILD_OBJECT(
                  'id', U."profilePhotoId",
                  'mediaUrl', M."mediaUrl"
          ) END AS "profilePhoto"
        FROM
        	"users" U LEFT JOIN "media" M ON U."profilePhotoId" = M."id" AND M."isDeleted" = FALSE
        WHERE
        	U."isDeleted" = FALSE
        	AND U."id" = :userId`;

      // Run the sql query using sequelize query.
      const getUserDetails = await sequelize.query(fetchUserDetails, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: req.user.id,
        },
      });

      // Success Response
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: null,
        data: getUserDetails?.[0] || {},
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(RESPONSE_CODES.ServerError).json({
        status: RESPONSE_CODES.ServerError,
        message: req.__("WENTS_WRONG"),
        data: null,
      });
    }
  },

  /**
   * @name preventServerAsleep
   * @path /user/prevent-asleep
   * @method GET
   * @schema User
   * @description This method is used to keep the server awake and prevent from asleep.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  preventServerAsleep: async (req, res) => {
    try {
      // Ping the database to fetch the requested record.
      const user = await User.findAll({
        where: {
          isDeleted: false,
        },
        limit: 1,
        attributes: ["role"],
      });

      console.log("USER ==> ", user?.[0].dataValues.role);

      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("SERVER_AWAKE"),
        data: user?.[0].dataValues.role,
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(RESPONSE_CODES.ServerError).json({
        status: RESPONSE_CODES.ServerError,
        message: req.__("WENTS_WRONG"),
        data: null,
      });
    }
  },

  /**
   * @name logoutUser
   * @path /user/logout
   * @method POST
   * @schema User
   * @description This method is used to logout the user.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  logoutUser: async (req, res) => {
    try {
      // Find the user to logout.
      const user = await User.findOne({
        where: {
          id: req.user.id,
          isEmailVerified: true,
          isActive: true,
          isDeleted: false,
          [Op.and]: [
            {
              accessToken: {
                [Op.ne]: null,
              },
            },
            {
              refreshToken: {
                [Op.ne]: null,
              },
            },
          ],
        },
      });
      if (!user) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("USER_NOT_FOUND"),
          data: null,
        });
      }

      // Logout the user by removing the access token and refresh token.
      await User.update(
        {
          accessToken: null,
          refreshToken: null,
          updatedAt: Date.now(),
          updatedBy: req.user.id,
        },
        {
          where: {
            id: user.id,
          },
        },
      );

      // Send the success response.
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("LOGOUT_SUCCESS"),
        data: null,
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(RESPONSE_CODES.ServerError).json({
        status: RESPONSE_CODES.ServerError,
        message: req.__("WENTS_WRONG"),
        data: null,
      });
    }
  },

  /**
   * @name forgetPassword
   * @path /user/forget-password
   * @method POST
   * @schema User
   * @description This method is used to generate a forget password token and send an email to the user.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  forgetPassword: async (req, res) => {
    try {
      // Create the bodyData
      const bodyData = {
        email: req.body.email && req.body.email.trim().toLowerCase(),
        eventCode: VALIDATION_EVENTS.ForgetPassword,
      };

      // Validate the incoming data
      const result = validateUserData(bodyData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Check if the user exists.
      const isExistingUser = await User.findOne({
        where: {
          email: bodyData.email,
          isDeleted: false,
        },
      });
      if (!isExistingUser) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("USER_NOT_FOUND"),
          data: null,
        });
      }

      // Check if the email is not verified.
      if (!isExistingUser.isEmailVerified) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("EMAIL_NOT_VERIFIED"),
          data: null,
        });
      }

      // Check if the user is active.
      if (!isExistingUser.isActive) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("USER_NOT_ACTIVE"),
          data: null,
        });
      }

      // Generate forget password token
      const forgetPasswordToken = UUID.v4();

      // Update the user's forget password token and set the forget password timestamp.
      await User.update(
        {
          forgotPasswordAt: Date.now(),
          forgotPasswordToken: forgetPasswordToken,
          updatedAt: Date.now(),
          updatedBy: isExistingUser.id,
        },
        {
          where: {
            id: isExistingUser.id,
          },
        },
      );

      // Create the input params.
      const inputs = {
        subType: EMAIL_EVENTS.ForgetPassword,
        payload: {
          lang: "en",
          name: isExistingUser.fullName || "User",
          toUser: isExistingUser.email,
          MailSubject: req.__("FORGET_PASSWORD_TITLE"),
          link: `${process.env.FRONTEND_URL}/reset-password?token=${forgetPasswordToken}`,
          supportEmail: process.env.SMTP_SENDER,
          websiteLink: process.env.WEBSITE_URL || "www.google.com",
        },
      };

      // Send the email
      await sendMail(inputs);

      // Success Response
      return res.status(RESPONSE_CODES.Created).json({
        status: RESPONSE_CODES.Created,
        message: req.__("FORGET_PASSWORD_LINK_SENT_SUCCESSFULLY"),
        data: null,
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(RESPONSE_CODES.ServerError).json({
        status: RESPONSE_CODES.ServerError,
        message: req.__("WENTS_WRONG"),
        data: null,
      });
    }
  },

  /**
   * @name resetPassword
   * @path /user/reset-password
   * @method POST
   * @schema User
   * @description This method is used to reset the user's password.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  resetPassword: async (req, res) => {
    try {
      const bodyData = {
        token: req.body.token && req.body.token.trim(),
        password: req.body.password && req.body.password.trim(),
        eventCode: VALIDATION_EVENTS.ResetPassword,
      };

      // Validate the incoming data
      const result = validateUserData(bodyData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Check if the forget password token is valid.
      const user = await User.findOne({
        where: {
          forgotPasswordToken: bodyData.token,
          isDeleted: false,
        },
      });
      if (!user) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("INVALID_FORGOT_PASSWORD_TOKEN"),
          data: null,
        });
      }

      // Check if the forget password token is expired.
      if (user.forgotPasswordAt < Date.now() - 15 * 60 * 1000) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("FORGOT_PASSWORD_TOKEN_EXPIRED"),
          data: null,
        });
      }

      // Check if the password is the same as the old password.
      const isOldPassword = await BCRYPT.compare(
        bodyData.password,
        user.password,
      );
      if (isOldPassword) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("OLD_PASSWORD_NOT_ALLOWED"),
          data: null,
        });
      }

      // Hash the user's new password
      const newHashedPassword = await BCRYPT.hash(bodyData.password, 10);

      // Update the user's password and clear the forget password token.
      await User.update(
        {
          password: newHashedPassword,
          forgotPasswordToken: null,
          forgotPasswordAt: null,
          updatedAt: Date.now(),
          updatedBy: user.id,
        },
        {
          where: {
            id: user.id,
          },
        },
      );

      // Success Response
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("PASSWORD_RESET_SUCCESS"),
        data: null,
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(RESPONSE_CODES.ServerError).json({
        status: RESPONSE_CODES.ServerError,
        message: req.__("WENTS_WRONG"),
        data: null,
      });
    }
  },

  /**
   * @name refreshToken
   * @path /user/refresh-token
   * @method POST
   * @description This method is used to refresh the user's access token.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  refreshToken: async (req, res) => {
    try {
      const bodyData = {
        accessToken: req.body.accessToken,
        refreshToken: req.body.refreshToken,
        eventCode: VALIDATION_EVENTS.RefreshToken,
      };

      // Validate the incoming data
      const result = validateUserData(bodyData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // 1. Verify Refresh Token
      const verifiedToken = await verifyToken(
        bodyData.refreshToken,
        JWT_TYPE.RefreshToken,
      );
      if (verifiedToken.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("INVALID_REFRESH_TOKEN"),
          error: verifiedToken.error,
        });
      }

      const user = verifiedToken.data;

      // 2. Check User Exists (And is active/not deleted)
      if (!user || user.isDeleted) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("USER_NOT_FOUND"),
          data: null,
        });
      }

      if (!user.isActive) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("USER_NOT_ACTIVE"),
          data: null,
        });
      }

      // 3. Compare Refresh Token with DB
      if (user.refreshToken !== bodyData.refreshToken) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("INVALID_REFRESH_TOKEN"),
          data: null,
        });
      }

      // 4. Generate New Access Token
      const accessTokenResult = await generateToken(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          type: JWT_TYPE.LoginUser,
        },
        JWT_EXPIRY.Access,
      );

      if (accessTokenResult.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("TOKEN_GENERATION_ERROR"),
          error: accessTokenResult.error,
        });
      }

      // 5. Generate New Refresh Token (Token Rotation)
      const refreshTokenResult = await generateToken(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          type: JWT_TYPE.RefreshToken,
        },
        JWT_EXPIRY.Refresh,
      );

      if (refreshTokenResult.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("TOKEN_GENERATION_ERROR"),
          error: refreshTokenResult.error,
        });
      }

      const newAccessToken = accessTokenResult.data;
      const newRefreshToken = refreshTokenResult.data;

      // 6. Update DB
      await User.update(
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          updatedAt: Date.now(),
          updatedBy: user.id,
        },
        {
          where: {
            id: user.id,
          },
        },
      );

      // 7. Return New Tokens
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("REFRESH_TOKEN_SUCCESS"),
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(RESPONSE_CODES.ServerError).json({
        status: RESPONSE_CODES.ServerError,
        message: req.__("WENTS_WRONG"),
        data: null,
      });
    }
  },
};
