const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  // config mail server
  service: "Gmail",
  auth: {
    user: "botmailer4229@gmail.com",
    pass: process.env.BOTMAILER_PW,
  },
});

module.exports = transporter;