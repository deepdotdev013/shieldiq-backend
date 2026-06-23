const {
  validateCampaignData,
} = require("../../validations/CampaignValidation");
const { UUID, VALIDATION_EVENTS, RESPONSE_CODES, CAMPAIGN_STATUS } =
  require("../../../configs/constants").constants;
const { sequelize, Campaign, CampaignEmailMapping } = require("../../models");

module.exports = {
  /**
   * @name createCampaign
   * @path /admin/campaigns
   * @method POST
   * @schema Campaign
   * @param {string} - req.body.title - Title of the campaign
   * @param {string} - req.body.description - Description of the campaign
   * @param {string} - req.body.startDate - Start date of the campaign
   * @param {string} - req.body.endDate - End date of the campaign
   * @param {string} - req.body.targetDepartment - Target department of the campaign
   * @param {Array} - req.body.campaignEmailIds - Array of campaign email ids
   * @description This method is used to create a new campaign.
   * @returns {Object} JSON object containing the campaign data
   * @author Deep Panchal
   */
  createCampaign: async (req, res) => {
    try {
      const bodyData = {
        id: UUID.v4(),
        title: req?.body?.title,
        description: req?.body?.description,
        startDate: req?.body?.startDate || null,
        endDate: req?.body?.endDate,
        targetDepartment: req?.body?.targetDepartment,
        emailType: req?.body?.emailType,
        status: req?.body?.status || CAMPAIGN_STATUS.Draft,
        createdBy: req?.user?.id,
        campaignEmailIds: req?.body?.campaignEmailIds,
        eventCode: VALIDATION_EVENTS.CreateCampaign,
      };

      // Validate the incoming data
      const result = validateCampaignData(bodyData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      const today = new Date().toISOString().split("T")[0]; // "2025-07-22"

      // Check if the campaign start date is in the past.
      if (bodyData.startDate && bodyData.startDate < today) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("CAMPAIGN_START_DATE_NOT_BE_IN_PAST"),
          data: null,
        });
      }

      // Check if the campaign end date is in the past.
      if (bodyData.endDate && bodyData.endDate < today) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("CAMPAIGN_END_DATE_NOT_BE_IN_PAST"),
          data: null,
        });
      }

      // Check if the campaign end date is before the start date.
      if (
        bodyData.endDate &&
        bodyData.startDate &&
        bodyData.endDate < bodyData.startDate
      ) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("CAMPAIGN_END_DATE_CANT_BE_BEFORE_START_DATE"),
          data: null,
        });
      }

      // Create a campaign.
      const createdCampaign = await Campaign.create(bodyData);

      // Create mappings if campaignEmailIds array is provided.
      if (
        Array.isArray(bodyData.campaignEmailIds) &&
        bodyData.campaignEmailIds.length > 0
      ) {
        const mappings = bodyData.campaignEmailIds.map((campaignEmailId) => ({
          id: UUID.v4(),
          campaignId: createdCampaign.id,
          campaignEmailId,
          createdBy: req.user.id,
        }));

        // Create the mappings in bulk
        await CampaignEmailMapping.bulkCreate(mappings);
      }

      // Return the created campaign
      return res.status(RESPONSE_CODES.Created).json({
        status: RESPONSE_CODES.Created,
        message: req.__("CAMPAIGN_CREATED_SUCCESS"),
        data: createdCampaign,
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
   * @name getCampaign
   * @path /admin/campaigns/:id
   * @method GET
   * @schema Campaign
   * @param {string} - req.params.id - Campaign id
   * @description This method is used to get a single campaign's details.
   * @returns {Object} JSON object containing the campaign data
   * @author Deep Panchal
   */
  getCampaign: async (req, res) => {
    try {
      const queryData = {
        campaignId: req.params.id,
        eventCode: VALIDATION_EVENTS.GetCampaign,
      };

      // Validate the incoming data
      const result = validateCampaignData(queryData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      let campaignDetailsQuery = `
      SELECT
        C."id",
        C."title",
        C."description",
        C."startDate",
        C."endDate",
        C."targetDepartment",
	      C."emailType",
	      C."status",
	      C."createdAt",
        CASE
            WHEN CEM."campaignId" IS NULL THEN NULL
            ELSE COALESCE(
                JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', CE."id",
                        'sender', CE."sender",
                        'fromEmail', CE."fromEmail",
                        'subject', CE."subject",
                        'body', CE."body",
                        'linkText', CE."linkText",
                        'createdAt', CE."createdAt"
                    )
                    ORDER BY CE."createdAt" ASC
                ) FILTER (WHERE CE."id" IS NOT NULL),
                '[]'::jsonb
            )
        END AS "campaignEmails"
      FROM
	      "campaigns" C
	    LEFT JOIN "campaign_email_mappings" CEM ON CEM."campaignId" = C."id"
	      AND CEM."isDeleted" = FALSE
	    LEFT JOIN "campaign_emails" CE ON CE."id" = CEM."campaignEmailId"
	      AND CE."isDeleted" = FALSE
      WHERE
	      C."isDeleted" = FALSE
	      AND C."id" =:campaignId
      GROUP BY
	      C."id",
	      C."title",
	      C."description",
	      C."startDate",
	      C."endDate",
	      C."targetDepartment",
	      C."emailType",
	      C."status",
	      C."createdAt",
        CEM."campaignId";`;

      // Execute the query
      const campaign = await sequelize.query(campaignDetailsQuery, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          campaignId: queryData?.campaignId,
        },
      });

      if (!campaign) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("CAMPAIGN_NOT_FOUND"),
          data: null,
        });
      }

      // Return the campaign details
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("CAMPAIGN_FETCHED_SUCCESS"),
        data: campaign[0] || {},
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
   * @name listAllCampaigns
   * @path /admin/campaigns
   * @method GET
   * @schema Campaign
   * @param {string} - req.query.search - Search query
   * @param {number} - req.query.limit - Limit of the campaigns
   * @param {number} - req.query.skip - Skip of the campaigns
   * @param {string} - req.query.sort - Sort of the campaigns
   * @param {string} - req.query.sortOrder - Sort order of the campaigns
   * @description This method is used to get all the campaigns along with filters.
   * @returns {Object} JSON object containing the campaign data
   * @author Deep Panchal
   */
  listAllCampaigns: async (req, res) => {
    try {
      const queryData = {
        search: req.query.search || "",
        limit: req.query.limit ? Number(req.query.limit) : 10,
        skip: req.query.skip ? Number(req.query.skip) : 0,
        sort: req.query.sort || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
        eventCode: VALIDATION_EVENTS.ListAllCampaigns,
      };

      // Validate the incoming data
      const result = validateCampaignData(queryData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Build the SQL query to get all campaigns
      let allCampaignsQueryCount = `SELECT
        COUNT(*)::INTEGER AS "count"`;

      let allCampaignsQuery = `
      SELECT
        C."id",
        C."title",
        C."description",
        C."startDate",
        C."endDate",
        C."targetDepartment",
        C."emailType",
        C."status",
        C."createdAt"`;

      let whereClause = ` FROM
        "campaigns" C
      WHERE
        C."isDeleted" = FALSE`;

      // Apply conditions on the query.
      if (queryData?.search && queryData?.search !== "") {
        whereClause += ` AND (C."title" LIKE :search OR C."description" LIKE :search OR C."targetDepartment" LIKE :search)`;
      }

      // Map and whitelist sort column to prevent SQL injection
      const allowedSortColumns = {
        createdAt: "createdAt",
        title: "title",
        startDate: "startDate",
        endDate: "endDate",
        status: "status",
      };
      const sortBy = allowedSortColumns[queryData.sort] || "createdAt";
      const sortOrder =
        queryData.sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

      // Build the queries
      const countQuery = `${allCampaignsQueryCount} ${whereClause}`;
      const selectQuery = `${allCampaignsQuery} ${whereClause} ORDER BY C."${sortBy}" ${sortOrder} LIMIT :limit OFFSET :offset`;

      const [getAllCampaignsDetails, getAllCampaignsCount] = await Promise.all([
        sequelize.query(selectQuery, {
          type: sequelize.QueryTypes.SELECT,
          replacements: {
            search: `%${queryData?.search || ""}%`,
            limit: queryData?.limit,
            offset: queryData?.skip,
          },
        }),
        sequelize.query(countQuery, {
          type: sequelize.QueryTypes.SELECT,
          replacements: {
            search: `%${queryData?.search || ""}%`,
          },
        }),
      ]);

      // Return the campaigns
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("CAMPAIGNS_FETCHED_SUCCESS"),
        data: {
          totalCount: Number(getAllCampaignsCount?.[0]?.count || 0),
          campaigns: getAllCampaignsDetails,
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
   * @name updateCampaign
   * @path /admin/campaigns/:id
   * @method PATCH
   * @schema Campaign
   * @param {string} - req.params.id - Campaign id
   * @param {string} - req.body.title - Title of the campaign
   * @param {string} - req.body.description - Description of the campaign
   * @param {string} - req.body.startDate - Start date of the campaign
   * @param {string} - req.body.endDate - End date of the campaign
   * @param {string} - req.body.targetDepartment - Target department of the campaign
   * @param {string} - req.body.emailType - Email type of the campaign
   * @param {string} - req.body.status - Status of the campaign
   * @param {Array} - req.body.deletedCampaignEmailIds - Array of campaign email ids to be deleted
   * @param {Array} - req.body.newCampaignEmailIds - Array of campaign email ids to be added
   * @description This method is used to update a single campaign's details.
   * @returns {Object} JSON object containing the campaign data
   * @author Deep Panchal
   */
  updateCampaign: async (req, res) => {
    try {
      const queryData = {
        campaignId: req.params.id,
        title: req.body.title,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        targetDepartment: req.body.targetDepartment,
        emailType: req.body.emailType,
        status: req.body.status,
        deletedCampaignEmailIds: req.body.deletedCampaignEmailIds,
        newCampaignEmailIds: req.body.newCampaignEmailIds,
        eventCode: VALIDATION_EVENTS.UpdateCampaign,
      };

      // Validate the incoming data
      const result = validateCampaignData(queryData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Check if the campaign exists.
      const campaign = await Campaign.findOne({
        where: {
          id: queryData.campaignId,
          isDeleted: false,
        },
      });

      if (!campaign) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("CAMPAIGN_NOT_FOUND"),
          data: null,
        });
      }

      // Set the new dates after checking that the new dates are not in past and end date is not before start date.
      const today = new Date().toISOString().split("T")[0];
      const newStartDate =
        queryData.startDate !== undefined
          ? queryData.startDate
          : campaign.startDate;
      const newEndDate =
        queryData.endDate !== undefined ? queryData.endDate : campaign.endDate;

      // Check if the campaign start date is in the past.
      if (queryData.startDate && queryData.startDate < today) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("CAMPAIGN_START_DATE_NOT_BE_IN_PAST"),
          data: null,
        });
      }

      // Check if the campaign end date is in the past.
      if (queryData.endDate && queryData.endDate < today) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("CAMPAIGN_END_DATE_NOT_BE_IN_PAST"),
          data: null,
        });
      }

      // Check if the campaign end date is before the start date.
      if (newEndDate && newStartDate && newEndDate < newStartDate) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("CAMPAIGN_END_DATE_CANT_BE_BEFORE_START_DATE"),
          data: null,
        });
      }

      // Update data mappings
      let updatedValue = {};

      if (queryData.title !== undefined) updatedValue.title = queryData.title;
      if (queryData.description !== undefined)
        updatedValue.description = queryData.description;
      if (queryData.startDate !== undefined)
        updatedValue.startDate = queryData.startDate;
      if (queryData.endDate !== undefined)
        updatedValue.endDate = queryData.endDate;
      if (queryData.targetDepartment !== undefined)
        updatedValue.targetDepartment = queryData.targetDepartment;
      if (queryData.emailType !== undefined)
        updatedValue.emailType = queryData.emailType;
      if (queryData.status !== undefined)
        updatedValue.status = queryData.status;

      updatedValue.updatedAt = Date.now();
      updatedValue.updatedBy = req.user.id;

      try {
        await sequelize.transaction(async (t) => {
          // Update the campaign details
          await Campaign.update(updatedValue, {
            where: {
              id: campaign.id,
            },
          });
          if (
            Array.isArray(queryData.deletedCampaignEmailIds) &&
            queryData.deletedCampaignEmailIds.length > 0
          ) {
            await CampaignEmailMapping.destroy({
              where: {
                campaignId: queryData.campaignId,
                campaignEmailId: queryData.deletedCampaignEmailIds,
                isDeleted: false,
              },
              transaction: t,
            });
          }

          // Add new mappings
          if (
            Array.isArray(queryData.newCampaignEmailIds) &&
            queryData.newCampaignEmailIds.length > 0
          ) {
            const mappings = queryData.newCampaignEmailIds.map(
              (campaignEmailId) => ({
                id: UUID.v4(),
                campaignId: queryData.campaignId,
                campaignEmailId,
                createdBy: req.user.id,
              }),
            );

            // Bulk create the mappings.
            await CampaignEmailMapping.bulkCreate(mappings, { transaction: t });
          }
        });
      } catch (error) {
        console.log("transaction error: ", error);
        return res.status(RESPONSE_CODES.ServerError).json({
          status: RESPONSE_CODES.ServerError,
          message: req.__("TRANSACTION_WENTS_WRONG"),
          data: null,
        });
      }

      // Return the updated details
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("CAMPAIGN_UPDATED_SUCCESS"),
        data: updatedValue,
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
   * @name deleteCampaign
   * @path /admin/campaigns/:id
   * @method POST
   * @schema Campaign
   * @param {string} - req.params.id - Campaign id
   * @description This method is used to delete a single campaign.
   * @returns {Object} JSON object containing the status
   * @author Deep Panchal
   */
  deleteCampaign: async (req, res) => {
    try {
      const queryData = {
        campaignId: req.params.id,
        eventCode: VALIDATION_EVENTS.DeleteCampaign,
      };

      // Validate the incoming data
      const result = validateCampaignData(queryData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Check if the campaign exists.
      const campaign = await Campaign.findOne({
        where: {
          id: queryData.campaignId,
          isDeleted: false,
        },
      });

      if (!campaign) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("CAMPAIGN_NOT_FOUND"),
          data: null,
        });
      }

      // Soft delete the campaign.
      await Campaign.update(
        {
          isDeleted: true,
          updatedAt: Date.now(),
          updatedBy: req.user.id,
        },
        {
          where: {
            id: campaign.id,
          },
        },
      );

      // Return the success response.
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("CAMPAIGN_DELETED_SUCCESS"),
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
