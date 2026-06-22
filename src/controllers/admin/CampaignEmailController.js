const {
  validateCampaignData,
} = require("../../validations/CampaignValidation");
const { UUID, VALIDATION_EVENTS, RESPONSE_CODES } =
  require("../../../configs/constants").constants;
const {
  sequelize,
  CampaignEmail,
  CampaignEmailMapping,
} = require("../../models");

module.exports = {
  /**
   * @name createCampaignEmail
   * @path /admin/campaign-emails
   * @method POST
   * @schema CampaignEmail
   * @param {string} - req.body.campaignId - Campaign ID
   * @param {string} - req.body.sender - Sender name
   * @param {string} - req.body.fromEmail - From email
   * @param {string} - req.body.subject - Email subject
   * @param {string} - req.body.body - Email body
   * @param {string} - req.body.linkText - Link text
   * @param {boolean} - req.body.isPhishing - Is phishing
   * @param {boolean} - req.body.isCreatedByAdmin - Is created by admin
   * @description This method is used to create a new campaign email template.
   * @returns {Object} JSON object containing the campaign email data
   * @author Deep Panchal
   */
  createCampaignEmail: async (req, res) => {
    try {
      const bodyData = {
        id: UUID.v4(),
        campaignId: req?.body?.campaignId || null,
        sender: req?.body?.sender,
        fromEmail: req?.body?.fromEmail,
        subject: req?.body?.subject,
        body: req?.body?.body,
        linkText: req?.body?.linkText || null,
        isPhishing:
          req?.body?.isPhishing !== undefined ? req.body.isPhishing : false,
        isCreatedByAdmin:
          req?.body?.isCreatedByAdmin !== undefined
            ? req.body.isCreatedByAdmin
            : true,
        createdBy: req?.user?.id,
        eventCode: VALIDATION_EVENTS.CreateCampaignEmail,
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

      // Create a campaign email.
      const emailData = {
        id: bodyData.id,
        sender: bodyData.sender,
        fromEmail: bodyData.fromEmail,
        subject: bodyData.subject,
        body: bodyData.body,
        linkText: bodyData.linkText,
        isPhishing: bodyData.isPhishing,
        isCreatedByAdmin: bodyData.isCreatedByAdmin,
        createdBy: bodyData.createdBy,
      };

      let createdCampaignEmail;
      await sequelize.transaction(async (t) => {
        createdCampaignEmail = await CampaignEmail.create(emailData, {
          transaction: t,
        });

        // If campaign id is present, create a mapping.
        if (bodyData?.campaignId) {
          await CampaignEmailMapping.create(
            {
              id: UUID.v4(),
              campaignId: bodyData?.campaignId,
              campaignEmailId: createdCampaignEmail?.id,
              createdBy: req?.user?.id,
            },
            { transaction: t },
          );
        }
      });

      // Return the created email
      return res.status(RESPONSE_CODES.Created).json({
        status: RESPONSE_CODES.Created,
        message: req.__("CAMPAIGN_EMAIL_CREATED_SUCCESS"),
        data: createdCampaignEmail,
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
   * @name getCampaignEmail
   * @path /admin/campaign-emails/:id
   * @method GET
   * @schema CampaignEmail
   * @param {string} - req.params.id - Campaign email id
   * @description This method is used to get a single campaign email/template details.
   * @returns {Object} JSON object containing the campaign email/template data
   * @author Deep Panchal
   */
  getCampaignEmail: async (req, res) => {
    try {
      const queryData = {
        campaignEmailId: req.params.id,
        eventCode: VALIDATION_EVENTS.GetCampaignEmail,
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

      // Check if the campaign email exists.
      const campaignEmail = await CampaignEmail.findOne({
        where: {
          id: queryData.campaignEmailId,
          isDeleted: false,
        },
      });

      if (!campaignEmail) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("CAMPAIGN_EMAIL_NOT_FOUND"),
          data: null,
        });
      }

      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("CAMPAIGN_EMAIL_FETCHED_SUCCESS"),
        data: campaignEmail,
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
   * @name listAllCampaignEmails
   * @path /admin/campaign-emails
   * @method GET
   * @schema CampaignEmail
   * @param {string} - req.query.search - Search text
   * @param {number} - req.query.limit - Limit
   * @param {number} - req.query.skip - Skip
   * @param {string} - req.query.sort - Sort
   * @param {string} - req.query.sortOrder - Sort order
   * @param {string} - req.query.campaignId - Campaign ID
   * @param {boolean} - req.query.templates - Templates
   * @description This method is used to get all campaign emails/templates along with filters.
   * @returns {Object} JSON object containing the campaign emails/templates data
   * @author Deep Panchal
   */
  listAllCampaignEmails: async (req, res) => {
    try {
      const queryData = {
        search: req?.query?.search || "",
        limit: req?.query?.limit ? parseInt(req?.query?.limit) : 10,
        skip: req?.query?.skip ? parseInt(req?.query?.skip) : 0,
        sort: req?.query?.sort || "createdAt",
        sortOrder: req?.query?.sortOrder || "desc",
        eventCode: VALIDATION_EVENTS.ListAllCampaignEmails,
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

      // Build the SQL query
      let countQueryStart = `SELECT COUNT(*)::INTEGER AS "count"`;
      let selectQueryStart = `SELECT
        E."id",
        E."sender",
        E."fromEmail",
        E."subject",
        E."body",
        E."linkText",
        E."isPhishing",
        E."isCreatedByAdmin",
        E."createdAt"`;

      let whereClause = ` FROM "campaign_emails" E WHERE E."isDeleted" = FALSE`;
      let replacements = {
        limit: queryData.limit,
        offset: queryData.skip,
      };

      // Filters
      if (queryData.search && queryData.search !== "") {
        whereClause += ` AND (E."sender" LIKE :search OR E."fromEmail" LIKE :search OR E."subject" LIKE :search OR E."body" LIKE :search)`;
        replacements.search = `%${queryData.search}%`;
      }

      // Sorting whitelist
      const allowedSortColumns = {
        createdAt: "createdAt",
        subject: "subject",
        sender: "sender",
      };
      const sortBy = allowedSortColumns[queryData.sort] || "createdAt";
      const sortOrder =
        queryData.sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

      // Build the select and count queries.
      const countQuery = `${countQueryStart} ${whereClause}`;
      const selectQuery = `${selectQueryStart} ${whereClause} ORDER BY E."${sortBy}" ${sortOrder} LIMIT :limit OFFSET :offset`;

      // Execute both the queries with promise.all
      const [details, countResult] = await Promise.all([
        sequelize.query(selectQuery, {
          type: sequelize.QueryTypes.SELECT,
          replacements,
        }),
        sequelize.query(countQuery, {
          type: sequelize.QueryTypes.SELECT,
          replacements,
        }),
      ]);

      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("CAMPAIGN_EMAILS_FETCHED_SUCCESS"),
        data: {
          totalCount: Number(countResult?.[0]?.count || 0),
          emails: details,
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
   * @name updateCampaignEmail
   * @path /admin/campaign-emails/:id
   * @method PATCH
   * @schema CampaignEmail
   * @param {string} - req.params.id - Campaign email id
   * @param {string} - req.body.campaignId - Campaign ID
   * @param {string} - req.body.sender - Sender name
   * @param {string} - req.body.fromEmail - From email
   * @param {string} - req.body.subject - Email subject
   * @param {string} - req.body.body - Email body
   * @param {string} - req.body.linkText - Link text
   * @param {boolean} - req.body.isPhishing - Is phishing
   * @description This method is used to update a campaign email/template.
   * @returns {Object} JSON object containing the campaign email/template data
   * @author Deep Panchal
   */
  updateCampaignEmail: async (req, res) => {
    try {
      const bodyData = {
        campaignEmailId: req.params.id,
        sender: req.body.sender,
        fromEmail: req.body.fromEmail,
        subject: req.body.subject,
        body: req.body.body,
        linkText: req.body.linkText,
        isPhishing: req.body.isPhishing,
        eventCode: VALIDATION_EVENTS.UpdateCampaignEmail,
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

      // Check if it exists
      const campaignEmail = await CampaignEmail.findOne({
        where: {
          id: bodyData.campaignEmailId,
          isCreatedByAdmin: true,
          isDeleted: false,
        },
      });

      if (!campaignEmail) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("CAMPAIGN_EMAIL_NOT_FOUND"),
          data: null,
        });
      }

      // Prepare updated values
      let updatedValue = {};
      if (bodyData.sender !== undefined) updatedValue.sender = bodyData.sender;
      if (bodyData.fromEmail !== undefined)
        updatedValue.fromEmail = bodyData.fromEmail;
      if (bodyData.subject !== undefined)
        updatedValue.subject = bodyData.subject;
      if (bodyData.body !== undefined) updatedValue.body = bodyData.body;
      if (bodyData.linkText !== undefined)
        updatedValue.linkText = bodyData.linkText;
      if (bodyData.isPhishing !== undefined)
        updatedValue.isPhishing = bodyData.isPhishing;

      updatedValue.updatedAt = Date.now();
      updatedValue.updatedBy = req.user.id;

      // Update the campaign
      await CampaignEmail.update(updatedValue, {
        where: {
          id: campaignEmail.id,
        },
      });

      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("CAMPAIGN_EMAIL_UPDATED_SUCCESS"),
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
   * @name deleteCampaignEmail
   * @path /admin/campaign-emails/:id
   * @method POST
   * @schema CampaignEmail
   * @param {string} - req.params.id - Campaign email id
   * @description This method is used to delete a campaign email/template.
   * @returns {Object} JSON object containing the campaign email/template data
   * @author Deep Panchal
   */
  deleteCampaignEmail: async (req, res) => {
    try {
      const queryData = {
        campaignEmailId: req.params.id,
        eventCode: VALIDATION_EVENTS.DeleteCampaignEmail,
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

      // Check if it exists
      const campaignEmail = await CampaignEmail.findOne({
        where: {
          id: queryData.campaignEmailId,
          isCreatedByAdmin: true,
          isDeleted: false,
        },
      });

      if (!campaignEmail) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("CAMPAIGN_EMAIL_NOT_FOUND"),
          data: null,
        });
      }
      // Add transaction
      await sequelize.transaction(async (t) => {
        // Soft delete a campaign
        await CampaignEmail.update(
          {
            isDeleted: true,
            updatedAt: Date.now(),
            updatedBy: req.user.id,
          },
          {
            where: {
              id: campaignEmail.id,
            },
            transaction: t,
          },
        );

        // Soft delete the mapping
        await CampaignEmailMapping.update(
          {
            isDeleted: true,
            updatedAt: Date.now(),
            updatedBy: req.user.id,
          },
          {
            where: {
              campaignEmailId: campaignEmail.id,
            },
            transaction: t,
          },
        );
      });

      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("CAMPAIGN_EMAIL_DELETED_SUCCESS"),
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
