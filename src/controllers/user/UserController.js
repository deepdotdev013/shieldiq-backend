const { RESPONSE_CODES } = require("../../../configs/constants").constants;
const { sequelize } = require("../../models");

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
};
