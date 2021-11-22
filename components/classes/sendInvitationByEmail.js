const nodemailer = require("nodemailer");

exports.sendInvitation = async (email, classInfo, sender, role) => {
  const link = 'http://localhost:3001/classroom/deltail/' + `${classInfo.id}?&cjc=${classInfo.CJC}`;

  let transporter = nodemailer.createTransport({
    // config mail server
    service: "Gmail",
    auth: {
      user: "botmailer4229@gmail.com",
      pass: process.env.CLASSROOM_MAIL_PASSWORD,
    },
  });
    
  let mailDetails = {
    from: "Classroom BOT",
    to: email,
    subject: `Invitation to classroom ${classInfo.className}`,
    html: `<h3>Hi user,</h3>
    <div>You have a invitation to class ${classInfo.className} as a ${role} from ${sender}!</div>
    <p>Click this link to enroll: ${link}</p>`,
  };

  return await transporter.sendMail(mailDetails, function (err, info) {
    if (err) {
      console.log('My Error',err);
      return null;
    } else {
      console.log('Email sent: ', info);
      return email;
    }
  });
};
