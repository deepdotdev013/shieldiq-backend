const { EMAIL_EVENTS, FS } = require("../../configs/constants").constants;
let handlebars = require("handlebars");

const { mailSender } = require("./mailSender");

const sendMail = (inputs) => {
  let subType = inputs.subType;
  let payload = inputs.payload;
  let lang = payload.lang ? payload.lang : "en";

  try {
    switch (subType) {
      case EMAIL_EVENTS.VerifyUser: {
        try {
          FS.readFile(
            `assets/templates/${lang}/verifyUser.html`,
            {
              encoding: "utf-8",
            },
            async (error, html) => {
              if (error) return error;
              if (html) {
                let template = handlebars.compile(html);
                let replacements = {
                  fullName: payload.name,
                  verificationLink: payload.link,
                  websiteLink: payload.websiteLink,
                  supportEmail: payload.supportEmail,
                  year: new Date().getFullYear(),
                };

                let htmlToSend = template(replacements);
                mailSender({
                  mailTo: payload.toUser,
                  mailSubject: payload.MailSubject,
                  mailBody: htmlToSend,
                });
              }
            },
          );
          break;
        } catch (error) {
          console.log("Error --> ", error);
        }
        break;
      }

      case EMAIL_EVENTS.ForgetPassword: {
        try {
          FS.readFile(
            `assets/templates/${lang}/forgetPassword.html`,
            {
              encoding: "utf-8",
            },
            async (error, html) => {
              if (error) return error;
              if (html) {
                let template = handlebars.compile(html);
                let replacements = {
                  fullName: payload.name,
                  resetPasswordLink: payload.link,
                  websiteLink: payload.websiteLink,
                  supportEmail: payload.supportEmail,
                  year: new Date().getFullYear(),
                };

                let htmlToSend = template(replacements);
                mailSender({
                  mailTo: payload.toUser,
                  mailSubject: payload.MailSubject,
                  mailBody: htmlToSend,
                });
              }
            },
          );
          break;
        } catch (error) {
          console.log("Error --> ", error);
        }
        break;
      }

      case EMAIL_EVENTS.WelcomeUser: {
        try {
          FS.readFile(
            `assets/templates/${lang}/welcomeUser.html`,
            {
              encoding: "utf-8",
            },
            async (error, html) => {
              if (error) return error;
              if (html) {
                let template = handlebars.compile(html);
                let replacements = {
                  fullName: payload.name,
                  email: payload.toUser,
                  password: payload.password,
                  websiteLink: payload.websiteLink,
                  supportEmail: payload.supportEmail,
                  year: new Date().getFullYear(),
                };

                let htmlToSend = template(replacements);
                mailSender({
                  mailTo: payload.toUser,
                  mailSubject: payload.MailSubject,
                  mailBody: htmlToSend,
                });
              }
            },
          );
          break;
        } catch (error) {
          console.log("Error --> ", error);
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.log("SendMail Error --> ", error);
  }
};

module.exports = { sendMail };
