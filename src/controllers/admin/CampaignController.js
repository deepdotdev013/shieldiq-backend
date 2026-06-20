const {
  validateCampaignData,
} = require("../../validations/CampaignValidation");
const { UUID, VALIDATION_EVENTS, RESPONSE_CODES, CAMPAIGN_STATUS } =
  require("../../../configs/constants").constants;
const { Campaign } = require("../../models");

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

      // Return the users
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
};
