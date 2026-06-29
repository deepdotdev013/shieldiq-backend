const {
  RESPONSE_CODES,
  CAMPAIGN_EVENTS,
  VALIDATION_EVENTS,
  UUID,
  USER_SIMULATION_STATUS,
  Op,
} = require("../../../configs/constants").constants;
const {
  validateSimulationData,
} = require("../../validations/SimulationValidation");
const { sequelize, CampaignEvent } = require("../../models");
const {
  computeScoreImpact,
  applyScoreImpact,
} = require("../../utils/scoreEngine");

module.exports = {
  /**
   * @name getAllSimulations
   * @path /user/simulations
   * @method GET
   * @schema User
   * @description This method is used to fetch all the details of logged in user.
   * @param {string} - req.query.search - Search query
   * @param {number} - req.query.limit - Limit
   * @param {number} - req.query.offset - Offset
   * @param {string} - req.query.status - Status
   * @param {string} - req.query.sortOrder - Sort order
   * @returns {Object} JSON object containing the user data
   * @author Deep Panchal
   */
  getAllSimulations: async (req, res) => {
    try {
      const queryData = {
        search: req?.query?.search || null,
        limit: req?.query?.limit || 4,
        offset: req?.query?.offset || 0,
        status: req?.query?.status || null,
        sortOrder: req?.query?.sortOrder || "DESC",
        eventCode: VALIDATION_EVENTS.GetAllSimulations,
      };

      // Validate the incoming data
      const result = validateSimulationData(queryData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          errors: result.errors,
        });
      }

      // Query to fetch users details.
      let simulationQuery = `
            SELECT
                C."id",
                C."title",
                C."description",
                C."startDate",
                C."endDate",
                C."status",
                C."createdAt",
                COUNT(DISTINCT CEM."id") AS "emails",
                COUNT(DISTINCT CEM."id") * 10 AS "points",
                COUNT(
                  DISTINCT CASE
                    WHEN CE."eventType" IN (:linkClicked, :reported) THEN CE."campaignEmailId"
                  END
                ) AS "completedEvents",
                CASE
                  WHEN COUNT(
                    DISTINCT CASE
                      WHEN CE."eventType" IN (:linkClicked, :reported) THEN CE."campaignEmailId"
                    END
                  ) = 0 THEN :notStarted
                  WHEN COUNT(DISTINCT CEM."campaignEmailId") = COUNT(
                    DISTINCT CASE
                      WHEN CE."eventType" IN (:linkClicked, :reported) THEN CE."campaignEmailId"
                    END
                  ) THEN :completed
                  ELSE :inProgress
                END AS "userSimulationStatus"
            FROM
                "campaigns" C
                LEFT JOIN "users" U ON U."department" = C."targetDepartment"
                AND U."isDeleted" = FALSE
                LEFT JOIN "campaign_email_mappings" CEM ON CEM."campaignId" = C."id"
                AND CEM."isDeleted" = FALSE
                LEFT JOIN "campaign_events" CE ON CE."campaignId" = C."id"
	              AND CE."isDeleted" = FALSE
            WHERE
                U."id" = :userId
                AND C."isDeleted" = FALSE
                AND C."startDate" <= CURRENT_DATE
	              AND C."endDate" >= CURRENT_DATE`;

      // If search is coming, search the input on the campaign's title and description.
      if (queryData.search) {
        simulationQuery += ` AND (C."title" LIKE :search OR C."description" LIKE :search)`;
      }

      // If status is coming, filter the campaigns based on the status.
      if (queryData.status) {
        simulationQuery += ` AND C."status" = :status`;
      }

      // Group by the campaign's id, title, description, startDate, endDate, status, createdAt.
      simulationQuery += ` GROUP BY
                CEM."campaignId",
                C."id"`;

      // Order by the campaign's created at.
      if (queryData.sortOrder) {
        simulationQuery += ` ORDER BY C."createdAt" ${queryData.sortOrder}`;
      }

      // Limit the results.
      if (queryData.limit) {
        simulationQuery += ` LIMIT :limit`;
      }
      if (queryData.offset) {
        simulationQuery += ` OFFSET :offset`;
      }

      // Run the sql query using sequelize query.
      const getSimulationsDetails = await sequelize.query(simulationQuery, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: req.user.id,
          search: `%${queryData.search}%`,
          notStarted: USER_SIMULATION_STATUS.NOT_STARTED,
          completed: USER_SIMULATION_STATUS.COMPLETED,
          inProgress: USER_SIMULATION_STATUS.IN_PROGRESS,
          linkClicked: CAMPAIGN_EVENTS.LinkClicked,
          reported: CAMPAIGN_EVENTS.Reported,
          status: queryData.status,
          limit: queryData.limit,
          offset: queryData.offset,
        },
      });

      // Success Response
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: null,
        data: getSimulationsDetails || {},
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
   * @name getAllSimulationEmails
   * @path /user/simulations/:campaignId/emails
   * @method GET
   * @schema User
   * @description This method is used to fetch all the simulation emails.
   * @returns {Object} JSON object containing the simulation emails data
   * @author Deep Panchal
   */
  getAllSimulationEmails: async (req, res) => {
    try {
      const queryData = {
        campaignId: req.params.campaignId,
        eventCode: VALIDATION_EVENTS.GetAllSimulationEmails,
      };

      // Validate the incoming data
      const result = validateSimulationData(queryData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Query to fetch simulation emails details.
      const simulationEmailsQuery = `
            SELECT
                CE."id",
                CE."sender",
                CE."fromEmail",
                CE."subject",
                CE."body",
                CE."linkText",
                CE."isPhishing"
            FROM
                "campaign_emails" CE
                LEFT JOIN "campaign_email_mappings" CEM ON CEM."campaignEmailId" = CE."id"
            WHERE
                CEM."campaignId" = :campaignId
                AND CE."isDeleted" = FALSE
                AND CEM."isDeleted" = FALSE
            GROUP BY
                CEM."campaignId",
                CE."id"
            ORDER BY
                CE."createdAt" DESC`;

      // Run the sql query using sequelize query.
      const getSimulationsDetails = await sequelize.query(
        simulationEmailsQuery,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: {
            campaignId: queryData.campaignId,
          },
        },
      );

      // Success Response
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: null,
        data: getSimulationsDetails || {},
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
   * @name createSimulationEvent
   * @path /user/simulations/:campaignId/events
   * @method POST
   * @schema CampaignEmailMapping
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
  createSimulationEvent: async (req, res) => {
    try {
      const bodyData = {
        userId: req.user.id,
        campaignId: req.params.campaignId,
        campaignEmailId: req.body.campaignEmailId,
        eventType: req.body.eventType,
        eventCode: VALIDATION_EVENTS.CreateSimulationEvent,
      };

      // Validate the incoming data
      const result = validateSimulationData(bodyData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("VALIDATION_ERROR"),
          error: result.errors,
        });
      }

      // Query to check for the existing simulation and fetch the isPhishing for scoreEngine.
      const query = `
      SELECT
          CE."isPhishing",
          C."startDate",
	        C."endDate"
      FROM
          "campaign_email_mappings" CEM
          INNER JOIN "campaign_emails" CE
              ON CE."id" = CEM."campaignEmailId"
              AND CE."isDeleted" = FALSE
          LEFT JOIN "campaigns" C ON CEM."campaignId" = C."id"
          AND C."isDeleted" = FALSE
      WHERE
          CEM."campaignId" = :campaignId
          AND CEM."campaignEmailId" = :campaignEmailId
          AND CEM."isDeleted" = FALSE
      LIMIT 1;`;

      // Run the sql query using sequelize query.
      const simulationData = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          campaignId: bodyData.campaignId,
          campaignEmailId: bodyData.campaignEmailId,
        },
      });

      if (!simulationData) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("SIMULATION_NOT_FOUND"),
          data: null,
        });
      }

      // Check if the duration of the simulation is over and prevent events on it.
      const today = Date.now();
      if (
        new Date(simulationData[0].startDate) >= today ||
        new Date(simulationData[0].endDate) <= today
      ) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__("CANNOT_INTERACT_WITH_INACTIVE_SIMULATION"),
          data: null,
        });
      }

      // Check if the event is a quit event.
      const isQuitEvent = bodyData.eventType === CAMPAIGN_EVENTS.Quit;

      // If it is not a quit event, check for duplicate event for the same user, campaign, and campaign email.
      if (!isQuitEvent) {
        const isDuplicateEvent = await CampaignEvent.findOne({
          where: {
            campaignId: bodyData.campaignId,
            campaignEmailId: bodyData.campaignEmailId,
            userId: bodyData.userId,
            eventType: {
              [Op.ne]: CAMPAIGN_EVENTS.Quit,
            },
            isDeleted: false,
          },
        });
        if (isDuplicateEvent) {
          return res.status(RESPONSE_CODES.BadRequest).json({
            status: RESPONSE_CODES.BadRequest,
            message: req.__("DUPLICATE_EVENT"),
            data: null,
          });
        }
      }

      // Compute the score impact based on the event type and whether the email is phishing.
      const scoreImpact = await computeScoreImpact(
        bodyData.eventType,
        simulationData[0].isPhishing,
      );

      let newEvent;
      try {
        await sequelize.transaction(async (t) => {
          // Create new event for the user.
          newEvent = await CampaignEvent.create(
            {
              id: UUID.v4(),
              campaignId: bodyData.campaignId,
              campaignEmailId: isQuitEvent ? null : bodyData.campaignEmailId,
              userId: bodyData.userId,
              eventType: bodyData.eventType,
              scoreImpact: scoreImpact,
              createdBy: bodyData.userId,
            },
            { transaction: t },
          );

          // Apply the score impact to the user
          await applyScoreImpact(bodyData.userId, scoreImpact, t);
        });
      } catch (error) {
        console.log("transaction error: ", error);
        return res.status(RESPONSE_CODES.ServerError).json({
          status: RESPONSE_CODES.ServerError,
          message: req.__("TRANSACTION_WENTS_WRONG"),
          data: null,
        });
      }

      // Return the success response.
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: null,
        data: newEvent,
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
