const { CAMPAIGN_EVENTS } = require("../../configs/constants").constants;

// generateSystemSimulationResult is a function that will generate simulation result for the system generated templates.
const generateSystemSimulationResult = (template) => {
  switch (template.subject) {
    case "Action Required: Reset your Microsoft 365 Password":
      return [
        {
          eventType: CAMPAIGN_EVENTS.LinkClicked,
          lesson:
            "This was a phishing email impersonating Microsoft Security. By clicking the password reset link, you could have exposed your Microsoft credentials to an attacker. Always verify the sender's domain and avoid using links in unexpected password reset emails.",
        },
        {
          eventType: CAMPAIGN_EVENTS.Reported,
          lesson:
            "Excellent work! You correctly identified this phishing email. The sender used a fake Microsoft domain and attempted to create urgency to trick you into resetting your password. Reporting these emails helps protect everyone in your organization.",
        },
      ];

    case "Document shared with you: 'Q3 Financial Review.xlsx'":
      return [
        {
          eventType: CAMPAIGN_EVENTS.LinkClicked,
          lesson:
            "This email attempted to impersonate Google Drive. Clicking the shared document link could have redirected you to a fake login page designed to steal your Google credentials. Always confirm unexpected document shares with the sender before opening them.",
        },
        {
          eventType: CAMPAIGN_EVENTS.Reported,
          lesson:
            "Great job! You recognized this as a phishing attempt. Unexpected file-sharing notifications are a common tactic used by attackers to steal credentials. Reporting suspicious emails helps prevent similar attacks across the organization.",
        },
      ];

    case "Confidential: HR Salary Revision and Performance Update":
      return [
        {
          eventType: CAMPAIGN_EVENTS.LinkClicked,
          lesson:
            "This phishing email exploited curiosity by pretending to contain confidential salary information. Clicking the portal link could have exposed sensitive credentials or downloaded malicious software. Sensitive HR announcements should always be verified through official company channels.",
        },
        {
          eventType: CAMPAIGN_EVENTS.Reported,
          lesson:
            "Excellent decision! You identified a phishing email that attempted to exploit employee curiosity regarding salary revisions. Reporting suspicious HR emails is always safer than interacting with unexpected requests.",
        },
      ];

    case "Scheduled Maintenance: VPN Service Downtime This Weekend":
      return [
        {
          eventType: CAMPAIGN_EVENTS.LinkClicked,
          lesson:
            "Good decision. This was a legitimate IT notification informing employees about scheduled VPN maintenance. It contained no suspicious requests or phishing indicators. Continue reviewing sender details before interacting with future emails.",
        },
        {
          eventType: CAMPAIGN_EVENTS.Reported,
          lesson:
            "This email was legitimate. While it's good to remain cautious, reporting genuine IT notifications can create unnecessary work for your security team. Before reporting an email, review the sender, purpose, and content carefully.",
        },
      ];

    case "Reminder: Submit Your Quarterly Timesheet by Friday":
      return [
        {
          eventType: CAMPAIGN_EVENTS.LinkClicked,
          lesson:
            "Correct choice. This was a legitimate reminder from your People Operations team. The email contained expected business communication without suspicious indicators. Continue verifying the sender and email context before taking action.",
        },
        {
          eventType: CAMPAIGN_EVENTS.Reported,
          lesson:
            "This email was safe and originated from a trusted internal department. Although staying vigilant is encouraged, reporting legitimate internal communications may delay responses to actual phishing incidents.",
        },
      ];

    default:
      return [];
  }
};

// generateSystemSimulationAnalysis function will generate the analysis for the system generated templates.
const generateSystemSimulationAnalysis = (template, eventType) => {
  switch (template.subject) {
    case "Action Required: Reset your Microsoft 365 Password":
      if (eventType === CAMPAIGN_EVENTS.LinkClicked) {
        return [
          {
            redFlag: "Suspicious Sender Domain",
            explanation:
              "The sender used 'micr0soft-security-alert.com' instead of the legitimate Microsoft domain. Attackers often replace letters with similar-looking characters.",
            displayOrder: 1,
          },
          {
            redFlag: "Creates Urgency",
            explanation:
              "The email pressured you to reset your password immediately to avoid account compromise. Urgency is a common phishing tactic.",
            displayOrder: 2,
          },
          {
            redFlag: "Unexpected Password Reset",
            explanation:
              "You didn't initiate a password reset request. Unexpected security notifications should always be verified independently.",
            displayOrder: 3,
          },
        ];
      }

      return [
        {
          redFlag: "Fake Microsoft Domain",
          explanation:
            "You noticed the sender wasn't an official Microsoft domain.",
          displayOrder: 1,
        },
        {
          redFlag: "Urgent Language",
          explanation:
            "You recognized the pressure tactics used to rush your decision.",
          displayOrder: 2,
        },
        {
          redFlag: "Credential Harvesting Attempt",
          explanation:
            "The password reset link was intended to steal your Microsoft credentials.",
          displayOrder: 3,
        },
      ];

    case "Document shared with you: 'Q3 Financial Review.xlsx'":
      if (eventType === CAMPAIGN_EVENTS.LinkClicked) {
        return [
          {
            redFlag: "Unexpected File Share",
            explanation:
              "Receiving an unexpected financial spreadsheet from an unknown sender should raise suspicion.",
            displayOrder: 1,
          },
          {
            redFlag: "Fake Google Drive",
            explanation: "The sender was not an official Google domain.",
            displayOrder: 2,
          },
          {
            redFlag: "Credential Theft",
            explanation:
              "The document link could have redirected you to a fake Google login page.",
            displayOrder: 3,
          },
        ];
      }

      return [
        {
          redFlag: "Unexpected Shared Document",
          explanation:
            "You correctly questioned why this document was shared unexpectedly.",
          displayOrder: 1,
        },
        {
          redFlag: "Suspicious Sender",
          explanation: "The sender's email address did not belong to Google.",
          displayOrder: 2,
        },
        {
          redFlag: "Potential Credential Harvesting",
          explanation:
            "Reporting prevented a possible credential theft attempt.",
          displayOrder: 3,
        },
      ];

    case "Confidential: HR Salary Revision and Performance Update":
      if (eventType === CAMPAIGN_EVENTS.LinkClicked) {
        return [
          {
            redFlag: "Sensitive Topic",
            explanation:
              "Salary information is commonly used by attackers to attract attention.",
            displayOrder: 1,
          },
          {
            redFlag: "Unexpected Portal",
            explanation:
              "The email requested access through a portal without prior notice.",
            displayOrder: 2,
          },
          {
            redFlag: "Social Engineering",
            explanation:
              "Attackers exploited curiosity to encourage you to click the link.",
            displayOrder: 3,
          },
        ];
      }

      return [
        {
          redFlag: "Too Good To Ignore",
          explanation:
            "You questioned an unexpected salary revision announcement.",
          displayOrder: 1,
        },
        {
          redFlag: "Portal Verification",
          explanation:
            "You recognized that official HR announcements should be verified using trusted internal channels.",
          displayOrder: 2,
        },
        {
          redFlag: "Curiosity-Based Attack",
          explanation:
            "Reporting prevented a common social engineering attack.",
          displayOrder: 3,
        },
      ];

    case "Scheduled Maintenance: VPN Service Downtime This Weekend":
      if (eventType === CAMPAIGN_EVENTS.LinkClicked) {
        return [
          {
            redFlag: "Trusted Internal Sender",
            explanation:
              "The sender belonged to your organization's official IT department.",
            displayOrder: 1,
          },
          {
            redFlag: "Expected Communication",
            explanation:
              "Maintenance notifications are a normal part of IT operations.",
            displayOrder: 2,
          },
          {
            redFlag: "No Phishing Indicators",
            explanation:
              "The email contained no suspicious requests, fake links, or urgency tactics.",
            displayOrder: 3,
          },
        ];
      }

      return [
        {
          redFlag: "Verified Sender",
          explanation: "The sender was a legitimate internal IT address.",
          displayOrder: 1,
        },
        {
          redFlag: "Expected Maintenance Notice",
          explanation:
            "This communication matched normal organizational announcements.",
          displayOrder: 2,
        },
        {
          redFlag: "Safe Email",
          explanation:
            "There were no phishing characteristics present in this email.",
          displayOrder: 3,
        },
      ];

    case "Reminder: Submit Your Quarterly Timesheet by Friday":
      if (eventType === CAMPAIGN_EVENTS.LinkClicked) {
        return [
          {
            redFlag: "Recognized Internal Communication",
            explanation:
              "The sender belonged to the organization's People Operations team.",
            displayOrder: 1,
          },
          {
            redFlag: "Routine Business Email",
            explanation:
              "Quarterly timesheet reminders are expected organizational communications.",
            displayOrder: 2,
          },
          {
            redFlag: "No Suspicious Content",
            explanation:
              "The email contained no malicious indicators or phishing techniques.",
            displayOrder: 3,
          },
        ];
      }

      return [
        {
          redFlag: "Trusted Department",
          explanation:
            "The reminder originated from an official internal department.",
          displayOrder: 1,
        },
        {
          redFlag: "Expected Reminder",
          explanation: "This was a routine organizational notification.",
          displayOrder: 2,
        },
        {
          redFlag: "Legitimate Communication",
          explanation: "No phishing indicators were present in the email.",
          displayOrder: 3,
        },
      ];

    default:
      return [];
  }
};

module.exports = {
  generateSystemSimulationResult,
  generateSystemSimulationAnalysis,
};
