const {
  CampaignEmail,
  SimulationResult,
  SimulationResultAnalysis,
} = require("../models");
const { UUID, SYSTEM_GENERATED_EMAIL } =
  require("../../configs/constants").constants;
const {
  generateSystemSimulationResult,
  generateSystemSimulationAnalysis,
} = require("../utils/generateEmailResults");

// generateDefaultTemplates async function for seeding default templates.
const generateDefaultTemplates = async () => {
  try {
    // Find templates which are not created by admin and are system generated.
    const count = await CampaignEmail.count({
      where: {
        isCreatedByAdmin: false,
        createdBy: SYSTEM_GENERATED_EMAIL.System,
        isDeleted: false,
      },
    });

    // If count is 0, then seed default templates.
    if (count === 0) {
      console.log("Seeding default phishing email templates...");
      const defaultTemplates = [
        {
          id: UUID.v4(),
          sender: "Microsoft Security",
          fromEmail: "no-reply@micr0soft-security-alert.com",
          subject: "Action Required: Reset your Microsoft 365 Password",
          body: '<p>Dear User,</p><p>We detected suspicious activity on your Microsoft 365 account. To keep your account secure, please reset your password immediately by clicking the link below.</p><p><a href="{{link}}">Reset Password Now</a></p>',
          linkText: "Reset Password",
          isPhishing: true,
          isCreatedByAdmin: false,
          createdBy: SYSTEM_GENERATED_EMAIL.System,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: UUID.v4(),
          sender: "Google Drive Notifications",
          fromEmail: "notify@google-drive-shared.com",
          subject: "Document shared with you: 'Q3 Financial Review.xlsx'",
          body: '<p>Hi there,</p><p>A document has been shared with you via Google Drive. Click the link below to access and edit the spreadsheet.</p><p><a href="{{link}}">View Document</a></p>',
          linkText: "View Document",
          isPhishing: true,
          isCreatedByAdmin: false,
          createdBy: SYSTEM_GENERATED_EMAIL.System,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: UUID.v4(),
          sender: "HR Department",
          fromEmail: "hr@internal-company.com",
          subject: "Confidential: HR Salary Revision and Performance Update",
          body: '<p>All Employees,</p><p>Please find attached the salary revision details for the current financial quarter. Review the details by logging into the employee portal below.</p><p><a href="{{link}}">View Portal</a></p>',
          linkText: "View Details",
          isPhishing: true,
          isCreatedByAdmin: false,
          createdBy: SYSTEM_GENERATED_EMAIL.System,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: UUID.v4(),
          sender: "IT Helpdesk",
          fromEmail: "support@yourcompany.com",
          subject: "Scheduled Maintenance: VPN Service Downtime This Weekend",
          body: "<p>Hi Team,</p><p>Please note that the VPN service will undergo scheduled maintenance this Saturday from 10 PM to 2 AM. During this window, remote access may be intermittent. No action is required on your part.</p><p>If you experience issues after the maintenance window, please raise a ticket through the internal helpdesk portal.</p>",
          linkText: null,
          isPhishing: false,
          isCreatedByAdmin: false,
          createdBy: SYSTEM_GENERATED_EMAIL.System,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: UUID.v4(),
          sender: "People Operations",
          fromEmail: "people-ops@yourcompany.com",
          subject: "Reminder: Submit Your Quarterly Timesheet by Friday",
          body: "<p>Hi all,</p><p>This is a friendly reminder to submit your timesheet for this quarter by end of day Friday. You can do this directly through the HR portal you already use to log in each day.</p><p>Thanks for your cooperation!</p>",
          linkText: null,
          isPhishing: false,
          isCreatedByAdmin: false,
          createdBy: SYSTEM_GENERATED_EMAIL.System,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      // bulk create default templates
      await CampaignEmail.bulkCreate(defaultTemplates);

      // generate simulation results and analysis.
      const simulationResults = [];
      const simulationResultAnalysis = [];

      // loop through all the templates and generate simulation results and analysis.
      for (const template of defaultTemplates) {
        // generate simulation results.
        const result = generateSystemSimulationResult(template);

        // loop through all the results and generate simulation results.
        result.forEach((result) => {
          const simulationResultId = UUID.v4();

          simulationResults.push({
            id: simulationResultId,
            campaignEmailId: template.id,
            eventType: result.eventType,
            lesson: result.lesson,
            createdBy: SYSTEM_GENERATED_EMAIL.System,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          // generate simulation analysis.
          const analysis = generateSystemSimulationAnalysis(
            template,
            result.eventType,
          );

          // loop through all the analysis and generate simulation analysis.
          analysis.forEach((item) => {
            simulationResultAnalysis.push({
              id: UUID.v4(),
              simulationResultId,
              redFlag: item.redFlag,
              explanation: item.explanation,
              displayOrder: item.displayOrder,
              createdBy: SYSTEM_GENERATED_EMAIL.System,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          });
        });
      }

      // Bulk Create the simulation results and analaysis
      await SimulationResult.bulkCreate(simulationResults);
      await SimulationResultAnalysis.bulkCreate(simulationResultAnalysis);
      console.log("Default email templates seeded successfully! ✅");
    }
  } catch (error) {
    console.error("Error seeding default templates:", error);
  }
};

module.exports = { generateDefaultTemplates };
