const db = require("../../models");
const User = db.user;
const Op = db.Sequelize.Op;
const bcrypt = require("bcryptjs");

// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body.username || !req.body.password || !req.body.email) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  const hash = bcrypt.hashSync(req.body.password, 10);

  const newUser = {
    username: req.body.username,
    email: req.body.email,
    password: hash,
    fullname: req.body.fullname,
    studentId: req.body.studentId,
  };

  // Save User in the database
  User.create(newUser)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  User.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find User with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id,
      });
    });
};

exports.getInfo = (req, res) => {
  const id = req.params.username;

  User.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find User with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id,
      });
    });
};

exports.update = async (req, res) => {
  const userInfo = req.user;
  console.log("in", userInfo);
  const updateUser = {
    fullname: req.body.fullname,
    studentId: req.body.studentId,
  };
  const existingStudentId = await User.findOne({
    where: { studentId: req.body.studentId },
  });
  if (existingStudentId && existingStudentId.id !== userInfo.id) {
    console.log("existed");
    res
      .status(499)
      .send(
        "Student Id " +
          existingStudentId.studentId +
          " already existed. Please login with your account!"
      );
    return;
  }

  User.findOne({
    where: { id: userInfo.id },
    attributes: { exclude: ["password"] },
  })
    .then((member) => {
      if (!member) {
        console.log("Member not found!");
        res
          .status(500)
          .send("Error retrieving Member with studentId=" + member.studentId);
        return;
      }
      if (!member.studentId || member.studentId === "") {
        member.update(updateUser);
      } else {
        member.update({ fullname: req.body.fullname });
      }
      res.send(member);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    });
};
