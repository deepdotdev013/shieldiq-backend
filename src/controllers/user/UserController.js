const { RESPONSE_CODES, VALIDATION_EVENTS } = require("../../../configs/constants").constants;
const { validateUserData } = require("../../validations/UserValidation");
const { sequelize, User } = require("../../models");

module.exports = {
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
   * @name updateProfileDetails
   * @path /user/update-profile
   * @method POST
   * @schema User
   * @param {string} - req.body.fullName - Full Name of the user
   * @param {string} - req.body.department - Department of the user
   * @param {string} - req.body.profileMediaId - Profile media id of the user
   * @description This method is used to update the details of logged in user.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  updateProfileDetails: async (req, res) => {
    try {
      const bodyData = {
        userId: req.user.id,
        fullName: req.body.fullName,
        department: req.body.department,
        profileMediaId: req.body?.profilePhoto?.id || null,
        updatedBy: req.user.id,
        eventCode: VALIDATION_EVENTS.UpdateProfileDetails,
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

      // Check if the user with the userId exists or not
      const user = await User.findOne({
        where: {
          id: bodyData.userId,
          isDeleted: false,
        },
      });
      if (!user) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("USER_NOT_FOUND"),
          data: null,
        });
      }

      let updatedValues = {};

      if (bodyData.fullName) {
        updatedValues.fullName = bodyData.fullName;
      }
      if (bodyData.department) {
        updatedValues.department = bodyData.department;
      }
      if (bodyData.profileMediaId) {
        updatedValues.profileMediaId = bodyData.profileMediaId;
      }

      // Update the user details
      await User.update(updatedValues, {
        where: {
          id: user.id,
        },
      });

      // Return the users
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("USER_UPDATED_SUCCESS"),
        data: updatedValues,
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
