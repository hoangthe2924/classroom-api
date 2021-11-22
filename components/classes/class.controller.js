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
  const ownerId = req.body.ownerId; // Replace currentId with req.user.id
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
// Check current user -> get all classes of user
exports.findAll = (req, res) => {
  const className = req.query.className;
  var condition = className
    ? { className: { [Op.like]: `%${className}%` } }
    : null;

  Class.findAll({
    where: condition,
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
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving classes.",
      });
    });
};

// Get class detail
exports.findOne = (req, res) => {
  const id = req.params.id;

  Class.findByPk(id, {
    include: [
      {
        model: User,
        as: "users",
        attributes: ["id", "username", "studentId"],
        through: {
          attributes: [],
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