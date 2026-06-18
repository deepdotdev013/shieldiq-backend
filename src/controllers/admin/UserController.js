const { RESPONSE_CODES, VALIDATION_EVENTS } =
  require("../../../configs/constants").constants;
const { validateUserData } = require("../../validations/UserValidation");
const { sequelize } = require("../../models");

module.exports = {
  /**
   * @name getAllUsers
   * @path /admin/users
   * @method GET
   * @schema User
   * @param {string} - req.query.search - Search query
   * @param {string} - req.query.department - Department of the user
   * @param {number} - req.query.limit - Limit of the users
   * @param {number} - req.query.skip - Skip of the users
   * @param {string} - req.query.sort - Sort of the users
   * @param {string} - req.query.sortOrder - Sort order of the users
   * @description This method is used to get all the users along with filters.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  getAllUsers: async (req, res) => {
    try {
      const queryData = {
        search: req.query.search || "",
        department: req.query.department || "",
        limit: req.query.limit ? Number(req.query.limit) : 10,
        skip: req.query.skip ? Number(req.query.skip) : 0,
        sort: req.query.sort || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
        eventCode: VALIDATION_EVENTS.GetAllUsers,
      };

      // Validate the incoming data
      const result = validateUserData(queryData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Build the SQL query to get all users
      let allUsersQuery = `
      SELECT
        U."id",
        U."email",
        U."fullName",
        U."department",
        U."securityScore",
        U."role",
        U."isActive",
        CASE
          WHEN U."profilePhotoId" IS NULL
          AND M."mediaUrl" IS NULL THEN NULL
          ELSE JSONB_BUILD_OBJECT(
            'id',
            U."profilePhotoId",
            'mediaUrl',
            M."mediaUrl"
          )
        END AS "profilePhoto",
        U."createdAt"
      FROM
        "users" U
        LEFT JOIN "media" M ON U."profilePhotoId" = M."id"
        AND M."isDeleted" = FALSE
      WHERE
        U."role" != 'admin'
        AND U."isDeleted" = FALSE`;

      // Apply conditions on the query.
      if (queryData?.department && queryData?.department !== "") {
        allUsersQuery += ` AND U."department" = :department`;
      }

      // Apply conditions on the query.
      if (queryData?.search && queryData?.search !== "") {
        allUsersQuery += ` AND (U."fullName" LIKE :search OR U."email" LIKE :search OR U."department" LIKE :search)`;
      }

      // Map and whitelist sort column to prevent SQL injection
      const allowedSortColumns = {
        createdAt: "createdAt",
        fullName: "fullName",
        email: "email",
        securityScore: "securityScore",
      };
      const sortBy = allowedSortColumns[queryData.sort] || "createdAt";
      const sortOrder =
        queryData.sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

      // Add sorting to the query.
      allUsersQuery += ` ORDER BY U."${sortBy}" ${sortOrder}`;

      // Add limit and offset to the query.
      allUsersQuery += ` LIMIT :limit OFFSET :offset`;

      // Run the sql query using sequelize query.
      const getAllUsersDetails = await sequelize.query(allUsersQuery, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: req.user.id,
          department: queryData?.department || "",
          search: `%${queryData?.search || ""}%`,
          limit: queryData?.limit,
          offset: queryData?.skip,
        },
      });

      // Return the users
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("USERS_FETCHED_SUCCESS"),
        data: getAllUsersDetails,
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
