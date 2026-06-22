const { CampaignEmail } = require("../models");
const { UUID, SYSTEM_GENERATED_EMAIL } =
  require("../../configs/constants").constants;

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
          fromEmail: "support@internal-it-helpdesk.com",
          subject: "Security Alert: New VPN Login from Unknown Location",
          body: '<p>Security Alert,</p><p>A new login was detected on your VPN account from IP 192.168.42.19 (Moscow, RU). If this was not you, please secure your account immediately.</p><p><a href="{{link}}">Report Login Activity</a></p>',
          linkText: "Report Activity",
          isPhishing: true,
          isCreatedByAdmin: false,
          createdBy: SYSTEM_GENERATED_EMAIL.System,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: UUID.v4(),
          sender: "Secure Alert Service",
          fromEmail: "alerts@secure-bank-login.com",
          subject: "URGENT: Verify your online banking credentials",
          body: '<p>Dear Customer,</p><p>We detected unauthorized access attempts on your online bank portal. To prevent temporary account suspension, verify your identity immediately.</p><p><a href="{{link}}">Verify Bank Account Now</a></p>',
          linkText: "Verify Identity",
          isPhishing: true,
          isCreatedByAdmin: false,
          createdBy: SYSTEM_GENERATED_EMAIL.System,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      // bulk create default templates
      await CampaignEmail.bulkCreate(defaultTemplates);
      console.log("Default email templates seeded successfully! ✅");
    }
  } catch (error) {
    console.error("Error seeding default templates:", error);
  }
};

module.exports = { generateDefaultTemplates };
