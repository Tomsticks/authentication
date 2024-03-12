const nodemailer = require("nodemailer");

async function sendEmail(options) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "miracleolaniyan60@gmail.com",
      pass: "bhvowmqyfehirtrl",
    },
  });

  const mailOptions = {
    from: "Tomzor <miracleolaniyan@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: '<b>Hello world?</b>'
  };
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
