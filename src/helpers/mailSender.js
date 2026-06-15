const { NODEMAILER } = require("../../configs/constants").constants;

// Use the createTransport method from nodemailer to create a transport.
const transporter = NODEMAILER.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Create a mailSender method.
const mailSender = async ({ mailTo, mailSubject, mailBody }) => {
  // Configure the mailOptions
  const mailOptions = {
    from: process.env.SMTP_SENDER,
    to: mailTo,
    subject: mailSubject,
    html: mailBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { mailSender };
