const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secureConnection: false, // TLS requires secureConnection to be false
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        ciphers: "SSLv3",
      },
    });

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
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