const db = require("../../models");
const Class = db.class;
const User = db.user;
const Op = db.Sequelize.Op;
const classService = require("./class.service");
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

const addToClassIfHasAnAccount = async (email) => {
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
    //do nothing
  }

  if (result.length === 0) {
    res.status(404).json({ message: "error" });
  } else {
    res.status(200).res({ message: "Invitation has been sent successfully!" });
  }
};

// Create and Save a new Class
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.className) {
    res.status(400).send({
      message: "Content cannot be empty!",
    });
    return;
  }
  const ownerId = req.body.ownerId || 1; // Replace this with id from token
  const owner = await User.findByPk(ownerId);
  if (!owner) {
    res.status(400).send({
      message: "You don't have permission!",
    });
    return;
  }

  const myClass = {
    className: req.body.className,
    subject: req.body.subject,
    description: req.body.description,
    cjc: req.body.cjc,
  };

  // Save Class in the database
  const createdClass = await Class.create(myClass);
  // .then((data) => {
  //   console.log("created", data);
  //   res.send(data);
  // })
  // .catch((err) => {
  //   res.status(500).send({
  //     message: err.message || "Some error occurred while creating the Class.",
  //   });
  // });
  createdClass.setUser(owner);
  // Owner is teacher
  createdClass.addUser(owner, { through: { role: "teacher" } });

  createdClass
    .save()
    .then((data) => {
      console.log("created", data);
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Class.",
      });
    });
};

// Retrieve all Classes from the database.
// Check token of current user from header -> get all classes of user
exports.findAll = async (req, res) => {
  const className = req.query.className;

  // Get token
  const token = req.headers["Authorization"];
  // Convert token to currentUserId
  console.log("header", req.headers);
  const currentUserId = req.headers["userid"] || 1;
  const currentUser = await User.findOne({
    where: { id: currentUserId },
    attributes: ["id", "username"],
    include: [
      {
        model: Class,
        as: "classes",
        attributes: ["id", "classname", "subject"],
        through: {
          attributes: [],
        },
      },
    ],
  });
  if (!currentUser) {
    res.status(400).send({
      message: "You don't have permission!",
    });
    return;
  }
  console.log(JSON.stringify(currentUser.classes));
  res.send(currentUser.classes);
  // let userClass = await currentUser.getClasses({
  //   attributes: ["id", "classname", "subject"],
  // });
  // console.log("uc", JSON.stringify(userClass));

  // console.log(JSON.stringify(currentUser));
  // let classes = await Class.findAll({
  //   where: { ownerId: currentUserId },
  //   attributes: ["id", "classname", "subject"],
  // });
  // console.log("ss", JSON.stringify(classes));
};

// Get class detail, including student + teacher list
exports.findOne = (req, res) => {
  const id = req.params.id;

  // Check user from req token is the member of class ?

  Class.findByPk(id, {
    include: [
      {
        model: User,
        as: "users",
        attributes: ["id", "username", "studentId"],
        through: {
          attributes: ["role"],
        },
      },
    ],
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Class with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Class with id=" + id,
      });
    });
};

// Add user to class (student)
exports.addUser = (req, res) => {
  const classId = req.params.id;
  const newMember = {
    id: req.body.id,
    email: req.body.email,
    studentId: req.body.studentId,
  };
  //check current user is owner of this class ?

  Class.findByPk(classId)
    .then((foundClass) => {
      if (!foundClass) {
        res.status(500).send({
          message: "Error retrieving Class with id=" + classId,
        });
        console.log("Class not found!");
      }
      //find by email -> send mail

      //find by studentId -> add
      User.findOne({ where: { studentId: newMember.studentId } }).then(
        (member) => {
          if (!member) {
            console.log("Member not found!");
            res.status(500).send({
              message:
                "Error retrieving Member with studentId=" + newMember.studentId,
            });
          }

          // Role student
          foundClass.addUser(member, { through: { role: "student" } });
          console.log(
            `>> added member id=${member.id} to Class id=${foundClass.id}`
          );
          res.send(foundClass);
        }
      );
    })
    .catch((err) => {
      console.log(">> Error while adding Member to Class: ", err);
    });
};
