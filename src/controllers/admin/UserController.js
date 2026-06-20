const { RESPONSE_CODES, VALIDATION_EVENTS, ROLES } =
  require("../../../configs/constants").constants;
const { validateUserData } = require("../../validations/UserValidation");
const { sequelize, User } = require("../../models");

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

  /**
   * @name getSingleUserDetails
   * @path /admin/users/:id
   * @method GET
   * @schema User
   * @param {string} - req.params.id - User id
   * @description This method is used to get a single user's details.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  getSingleUserDetails: async (req, res) => {
    try {
      const queryData = {
        userId: req.params.id,
        eventCode: VALIDATION_EVENTS.GetSingleUserDetails,
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

      // Build the SQL query to get the single user details
      let singleUserDetailsQuery = `
      SELECT
        U."id",
        U."email",
        U."fullName",
        U."department",
        U."securityScore",
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
        U."role" != :role
        AND U."isDeleted" = FALSE
        AND U."id" = :userId`;

      // Run the sql query using sequelize query.
      const getSingleUserDetails = await sequelize.query(
        singleUserDetailsQuery,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: {
            userId: queryData?.userId,
            role: ROLES.Admin,
          },
        },
      );

      // Return the user details
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("USER_DETAILS_FETCHED_SUCCESS"),
        data: getSingleUserDetails?.[0] || {},
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
   * @name updateSingleUser
   * @path /admin/users/:id
   * @method PATCH
   * @schema User
   * @param {string} - req.params.id - User id
   * @param {string} - req.body.fullName - User full name
   * @param {string} - req.body.department - User department
   * @param {boolean} - req.body.isActive - User active status
   * @description This method is used to update a single user's details.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  updateSingleUser: async (req, res) => {
    try {
      const queryData = {
        userId: req.params.id,
        fullName: req.body.fullName,
        department: req.body.department,
        isActive: req.body.isActive,
        eventCode: VALIDATION_EVENTS.UpdateSingleUser,
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

      // Check if the user exists.
      const isUserExists = await User.findOne({
        where: {
          id: queryData?.userId,
          isDeleted: false,
        },
      });

      if (!isUserExists) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("USER_NOT_FOUND"),
          data: null,
        });
      }

      // Update the user details
      await User.update(
        {
          fullName: req.body?.fullName,
          department: req.body?.department,
          isActive: req.body?.isActive,
        },
        {
          where: {
            id: isUserExists?.id,
          },
        },
      );

      // Return the user details
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("USER_DETAILS_UPDATED_SUCCESS"),
        data: {
          id: isUserExists.id,
          fullName: req.body?.fullName,
          department: req.body?.department,
          isActive: req.body?.isActive,
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
   * @name deleteSingleUser
   * @path /admin/users/:id
   * @method POST
   * @schema User
   * @param {string} - req.params.id - User id
   * @description This method is used to delete a single user.
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  deleteSingleUser: async (req, res) => {
    try {
      const queryData = {
        userId: req.params.id,
        eventCode: VALIDATION_EVENTS.DeleteSingleUser,
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

      // Check if the user exists.
      const isUserExists = await User.findOne({
        where: {
          id: queryData?.userId,
          isDeleted: false,
        },
      });

      if (!isUserExists) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("USER_NOT_FOUND"),
          data: null,
        });
      }

      // Soft delete the user and remove the access and refresh tokens.
      await User.update(
        {
          isDeleted: true,
          accessToken: null,
          refreshToken: null,
          isActive: false,
          isEmailVerified: false,
        },
        {
          where: {
            id: isUserExists.id,
          },
        },
      );

      // Return the success response.
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("USER_DETAILS_DELETED_SUCCESS"),
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
};
