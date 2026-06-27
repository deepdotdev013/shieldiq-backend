const { CAMPAIGN_EVENTS, RESPONSE_CODES, USER_SIMULATION_STATUS } =
  require("../../../configs/constants").constants;
const { sequelize } = require("../../models");
const {
  calculateRate,
  calculateTrend,
} = require("../../utils/calculateDashboardStats");

module.exports = {
  /**
   * @name getDashboardStats
   * @path /user/dashboard/stats
   * @method GET
   * @schema User
   * @description This method is used to get the dashboard stats of the logged in user.
   * @returns {Object} JSON object containing the dashboard stats
   * @author Deep Panchal
   */
  getDashboardStats: async (req, res) => {
    try {
      const dashboardStatsQuery = `
      SELECT
            U."securityScore",
            ROUND(
                COUNT(
                    CASE
                        WHEN CE."eventType" = :linkClicked THEN 1
                    END
                ) * 100.0 / NULLIF(
                    COUNT(
                        CASE
                            WHEN CE."eventType" IN (:linkClicked, :reported) THEN 1
                        END
                    ),
                    0
                ),
                1
            ) AS "clickRate",
            ROUND(
                COUNT(
                    CASE
                        WHEN CE."eventType" = :reported THEN 1
                    END
                ) * 100.0 / NULLIF(
                    COUNT(
                        CASE
                            WHEN CE."eventType" IN (:linkClicked, :reported) THEN 1
                        END
                    ),
                    0
                ),
                1
            ) AS "reportRate",
            COUNT(
                CASE
                    WHEN CE."eventType" = :linkClicked
                    AND TO_TIMESTAMP(CE."createdAt" / 1000) >= DATE_TRUNC('week', CURRENT_DATE) THEN 1
                END
            ) AS "currentWeekClicks",
            COUNT(
                CASE
                    WHEN CE."eventType" = :reported
                    AND TO_TIMESTAMP(CE."createdAt" / 1000) >= DATE_TRUNC('week', CURRENT_DATE) THEN 1
                END
            ) AS "currentWeekReports",
            COUNT(
                CASE
                    WHEN CE."eventType" = :linkClicked
                    AND TO_TIMESTAMP(CE."createdAt" / 1000) >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'
                    AND TO_TIMESTAMP(CE."createdAt" / 1000) < DATE_TRUNC('week', CURRENT_DATE) THEN 1
                END
            ) AS "previousWeekClicks",
            COUNT(
                CASE
                    WHEN CE."eventType" = :reported
                    AND TO_TIMESTAMP(CE."createdAt" / 1000) >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'
                    AND TO_TIMESTAMP(CE."createdAt" / 1000) < DATE_TRUNC('week', CURRENT_DATE) THEN 1
                END
            ) AS "previousWeekReports",
            COALESCE(
                SUM(
                    CASE
                        WHEN TO_TIMESTAMP(CE."createdAt" / 1000) >= DATE_TRUNC('week', CURRENT_DATE) THEN CE."scoreImpact"
                        ELSE 0
                    END
                ),
                0
            ) AS "currentWeekScore",
            COALESCE(
                SUM(
                    CASE
                        WHEN TO_TIMESTAMP(CE."createdAt" / 1000) >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'
                        AND TO_TIMESTAMP(CE."createdAt" / 1000) < DATE_TRUNC('week', CURRENT_DATE) THEN CE."scoreImpact"
                        ELSE 0
                    END
                ),
                0
            ) AS "previousWeekScore"
        FROM
            "users" U
            LEFT JOIN "campaign_events" CE ON CE."userId" = U."id"
            AND CE."isDeleted" = FALSE
        WHERE
            U."id" = :userId
            AND U."isDeleted" = FALSE
        GROUP BY
            U."securityScore"`;

      // Get the dashboard stats
      const dashboardStats = await sequelize.query(dashboardStatsQuery, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: req.user.id,
          linkClicked: CAMPAIGN_EVENTS.LinkClicked,
          reported: CAMPAIGN_EVENTS.Reported,
        },
      });

      // If the dashboard stats are not found, send an error
      if (!dashboardStats) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("DASHBOARD_STATS_NOT_FOUND"),
          data: null,
        });
      }

      // Weekly click/report rates
      const currentWeek = calculateRate(
        dashboardStats[0].currentWeekClicks,
        dashboardStats[0].currentWeekReports,
      );

      const previousWeek = calculateRate(
        dashboardStats[0].previousWeekClicks,
        dashboardStats[0].previousWeekReports,
      );

      // Trends
      const securityScoreTrend = calculateTrend(
        dashboardStats[0].currentWeekScore,
        dashboardStats[0].previousWeekScore,
      );

      const clickRateTrend = calculateTrend(
        currentWeek.clickRate,
        previousWeek.clickRate,
      );

      const reportRateTrend = calculateTrend(
        currentWeek.reportRate,
        previousWeek.reportRate,
      );

      // Return the campaign details
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("DASHBOARD_STATS_FETCHED_SUCCESS"),
        data: {
          securityScore: dashboardStats[0].securityScore,
          clickRate: dashboardStats[0].clickRate,
          reportRate: dashboardStats[0].reportRate,
          securityScoreTrend,
          clickRateTrend,
          reportRateTrend,
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
   * @name getDashboardTrends
   * @path /user/dashboard/trends
   * @method GET
   * @schema User
   * @description This method is used to get the dashboard trends of the logged in user.
   * @returns {Object} JSON object containing the dashboard trends
   * @author Deep Panchal
   */
  getDashboardTrends: async (req, res) => {
    try {
      const trendsQuery = `
      SELECT
        EXTRACT(
            WEEK
            FROM
                TO_TIMESTAMP(CE."createdAt" / 1000)
        )::INT AS "week",
        COUNT(
            CASE
                WHEN CE."eventType" = :linkClicked THEN 1
            END
        ) AS "clicks",
        COUNT(
            CASE
                WHEN CE."eventType" = :reported THEN 1
            END
        ) AS "reports"
    FROM
        "campaign_events" CE
    WHERE
        CE."userId" = :userId
        AND CE."isDeleted" = FALSE
        AND TO_TIMESTAMP(CE."createdAt" / 1000) >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '5 weeks'
    GROUP BY
        EXTRACT(
            WEEK
            FROM
                TO_TIMESTAMP(CE."createdAt" / 1000)
        )
    ORDER BY
        "week";`;

      // Get the dashboard trends
      const dashboardTrends = await sequelize.query(trendsQuery, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: req.user.id,
          linkClicked: CAMPAIGN_EVENTS.LinkClicked,
          reported: CAMPAIGN_EVENTS.Reported,
        },
      });

      // Return the dashboard trends
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: null,
        data: dashboardTrends,
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
   * @name getPendingSimulations
   * @path /user/dashboard/pending-simulations
   * @method GET
   * @schema Campaign
   * @description This method is used to get the pending simulations of the logged in user.
   * @returns {Object} JSON object containing the pending simulations
   * @author Deep Panchal
   */
  getPendingSimulations: async (req, res) => {
    try {
      const pendingSimulationsQuery = `
      SELECT
        C."id",
        C."title",
        C."description",
        C."endDate",
        C."status",
        COUNT(DISTINCT CEM."id") * 10 AS "points",
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
      GROUP BY
        CEM."campaignId",
        C."id"
      ORDER BY
        C."createdAt" DESC`;

      // Run the sql query using sequelize query.
      const getPendingSimulations = await sequelize.query(
        pendingSimulationsQuery,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: {
            userId: req.user.id,
            notStarted: USER_SIMULATION_STATUS.NOT_STARTED,
            completed: USER_SIMULATION_STATUS.COMPLETED,
            inProgress: USER_SIMULATION_STATUS.IN_PROGRESS,
            linkClicked: CAMPAIGN_EVENTS.LinkClicked,
            reported: CAMPAIGN_EVENTS.Reported,
          },
        },
      );

      // Success Response
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: null,
        data: getPendingSimulations || {},
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
