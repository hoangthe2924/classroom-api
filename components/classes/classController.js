const classService = require("./classService");
const emailTransport = require("./sendInvitationByEmail");

const sendListInvitation = async (listEmail, classInfo, role) => {
  const sendedEmailList = [];
  for (const email of listEmail) {
    const hasEnrolled = await classService.checkAlreadyEnrollment(email,classInfo.id);
    if (hasEnrolled) {
      continue;
    }

    //Gui mail cho nhung ai chua enroll
    const res = emailTransport.sendInvitation(email, classInfo, "BOT", role); //lay thong tin nguoi gui tu token
    if (res) {
      sendedEmailList.push(email);
      //Kiem tra neu ho co tai khoan, add vo luon lop hoc
      addToClassIfHasAnAccount(email);
    }
  }

  return sendedEmailList;
};

const addToClassIfHasAnAccount = (email) => {
  const accountID = await classService.getAccountIDByEmail(email);
  if (accountID !== 0) {
    classService.addAccountToClass(accountID);
  }
};

exports.invitePeople = async function (req, res) {
  const listEmail = req.body.listEmail;
  const classID = req.body.classID;
  const role = req.body.role.trim().toLowerCase();
  let result;

  const classInfo = await classService.getClassInfoByID(classID);
  const sendedEmailList = sendListInvitation(listEmail, classInfo, role);

  if (role === "teacher") {
    result = await classService.addToTeacherWaitingRoom(
      classID,
      sendedEmailList
    );
  }
  if (role === "student") {
    result = await classService.addToStudentWaitingRoom(
      classID,
      sendedEmailList
    );
  }
  //dummy
  if (result.length === 0) {
    res.status(404).json({ message: "error" });
  } else {
    res.status(200).res({ message: "Invitation has been sent successfully!" });
  }
};
