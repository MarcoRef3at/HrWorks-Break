const nodemailer = require("nodemailer");
const SMTP_HOST="smtp-mail.outlook.com",
SMTP_PORT=587,
SMTP_EMAIL="test.ttest1234@outlook.com",
SMTP_PASSWORD="Tt.123456",
FROM_EMAIL="test.ttest1234@outlook.com",
FROM_NAME="Test"
const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secureConnection: false, // TLS requires secureConnection to be false
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD,
      },
      tls: {
        ciphers: "SSLv3",
      },
    });

    const message = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: process.env.EMAIL,
      subject: options.subject,
      text: options.message
    };

    return new Promise(async (resolve, reject) => {
      try {
        const info = await transporter.sendMail(message);
        console.log("Message Sent: %s", info.messageId);
        resolve();
      } catch (error) {
        console.log("Send Email error:", error);
        reject();
      }
    });
  } catch (error) {
    console.log('Send Email Error:', error)
  }
};

module.exports = sendEmail;