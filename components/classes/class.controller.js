const { user } = require("../../models");
const db = require("../../models");
const Class = db.class;
const User = db.user;
const Op = db.Sequelize.Op;
const classService = require("./class.service");
const emailTransport = require("./sendInvitationByEmail");

const sendListInvitation = async (listEmail, classInfo, sender, role) => {
  const sendedEmailList = [];
  for (const email of listEmail) {
    const hasEnrolled = await classService.checkAlreadyEnrollment(
      email,
      classInfo.id
    );
    if (hasEnrolled) {
      continue;
    }

    //Gui mail cho nhung ai chua enroll
    const res = emailTransport.sendInvitation(email, classInfo, sender, role); //lay thong tin nguoi gui tu token
    if (res) {
      sendedEmailList.push(email);
      //Kiem tra neu ho co tai khoan, add vo luon lop hoc
      const accountID = await classService.getAccountIDByEmail(email);
      if (accountID > 0) {
        classService.addUserToClass(accountID, classInfo.id, role);
      }
    }
  }

  return sendedEmailList;
};

exports.invitePeople = async function (req, res) {
  const listEmail = req.body.listEmail;
  const classID = req.body.classID;
  const role = req.body.role.trim().toLowerCase();
  const user = req.user;
  let result = false;

  const classInfo = await classService.getClassInfoByID(classID);
  console.log(classInfo);
  const sendedEmailList = sendListInvitation(listEmail, classInfo, user, role);
  //const sendedEmailList = sendListInvitation(listEmail, {className: "Haha", id: 3, cjc: "AhbkHd"}, role);

  if (role === "teacher") {
    result = await classService.addToTeacherWaitingRoom(
      classID,
      sendedEmailList
    );
    if (!result) {
      res.status(404).json({ message: "error" });
    }
  }else if (role === "student") {
    //do nothing
  }

  res.status(200).json({ message: "Invitation has been sent successfully!" });
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
exports.findOne = async (req, res) => {
  const id = req.params.id;
  const userID = req.userID;

  if (await !classService.checkIfUserIsInClass(userID)) {
    const cjc = req.query.cjc;
    if (await classService.checkCJC(id, cjc)) {
      if (await classService.checkUserIsInWaitingList(userID)) {
        classService.addUserToClass(userID, id, "teacher");
      } else {
        classService.addUserToClass(userID, id, "student");
      }
    } else {
      res
        .status(403)
        .json({ message: "You don't have permission to access this class!" });
    }
  }

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
