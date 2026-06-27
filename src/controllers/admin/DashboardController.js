const { CAMPAIGN_EVENTS, RESPONSE_CODES, ROLES } =
  require("../../../configs/constants").constants;
const { sequelize } = require("../../models");

module.exports = {
  /**
   * @name getDashboardStats
   * @path /admin/dashboard/stats
   * @method GET
   * @description This method is used to get the dashboard stats.
   * @returns {Object} JSON object containing the dashboard stats
   * @author Deep Panchal
   */
  getDashboardStats: async (req, res) => {
    try {
      // Create a query to fetch dashboard stats
      const statsQuery = `
      SELECT
        ROUND(AVG(U."securityScore")) AS "averageSecurityScore",
        COUNT(
          CASE
            WHEN CEV."eventType" = :linkClicked THEN 1
          END
        ) AS "totalClicks",
        COUNT(
          CASE
            WHEN CEV."eventType" = :reported THEN 1
          END
        ) AS "totalReports",
        COUNT(
          DISTINCT CASE
            WHEN U."securityScore" > 80 THEN U."id"
          END
        ) AS "protectedEmployees",
        COUNT(DISTINCT C."id") AS "totalCampaigns"
      FROM
        "users" U
        LEFT JOIN "campaign_events" CEV ON CEV."userId" = U."id"
        AND CEV."isDeleted" = FALSE
        LEFT JOIN "campaigns" C ON C."isDeleted" = FALSE
      WHERE
        U."isDeleted" = FALSE
        AND U."isActive" = TRUE
        AND U."role" != :admin`;

      // Get the dashboard stats
      const dashboardStats = await sequelize.query(statsQuery, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          admin: ROLES.Admin,
          linkClicked: CAMPAIGN_EVENTS.LinkClicked,
          reported: CAMPAIGN_EVENTS.Reported,
        },
      });
      if (!dashboardStats) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("DASHBOARD_STATS_NOT_FOUND"),
          data: null,
        });
      }

      // Return the campaign details
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("DASHBOARD_STATS_FETCHED_SUCCESS"),
        data: dashboardStats[0] || {},
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
   * @path /admin/dashboard/trends
   * @method GET
   * @description This method is used to get the dashboard trends.
   * @returns {Object} JSON object containing the dashboard trends
   * @author Deep Panchal
   */
  getDashboardTrends: async (req, res) => {
    try {
      const trendsQuery = `
        SELECT
          EXTRACT(
            MONTH
            FROM
              TO_TIMESTAMP(CE."createdAt" / 1000)
          )::INT AS "month",
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
            CE."isDeleted" = FALSE
            AND TO_TIMESTAMP(CE."createdAt" / 1000) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
        GROUP BY
          EXTRACT(
            MONTH
            FROM
              TO_TIMESTAMP(CE."createdAt" / 1000)
          )
        ORDER BY
          EXTRACT(
            MONTH
            FROM
              TO_TIMESTAMP(CE."createdAt" / 1000)
          );`;

      // Get the trends
      const trends = await sequelize.query(trendsQuery, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          linkClicked: CAMPAIGN_EVENTS.LinkClicked,
          reported: CAMPAIGN_EVENTS.Reported,
        },
      });
      if (!trends) {
        return res.status(RESPONSE_CODES.NotFound).json({
          status: RESPONSE_CODES.NotFound,
          message: req.__("DASHBOARD_TRENDS_NOT_FOUND"),
          data: null,
        });
      }

      // Return the campaign details
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__("DASHBOARD_TRENDS_FETCHED_SUCCESS"),
        data: trends || [],
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
