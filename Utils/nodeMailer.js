const nodemailer = require("nodemailer");

sendMail = async (options) => {
  //1. create a transport.
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASS,
    },
  });
  //2. use transport.sendMail(with options) and send the mail to user.
  await transporter.sendMail({
    from: "IPL App<admin@ipl.com>",
    to: "chitre.manish@gmail.com",
    subject: options.subject,
    text: options.message,
  });
};

module.exports = sendMail;
