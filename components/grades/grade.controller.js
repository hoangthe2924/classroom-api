const db = require("../../models");
const Class = db.class;
const User = db.user;
const Assignment = db.assignment;
const Op = db.Sequelize.Op;
const gradeService = require("./grade.service");

exports.getStudentGrades = async (req, res) => {
  const assignmentID = req.params.asssignmentID;
  console.log("grading", req.body);
  const result = await gradeService.getStudentGrades(assignmentID);
  if (result) {
    res.status(200).json(result);
  } else {
    res
      .status(500)
      .json({
        message: "Cannot get student grades of assignment id: " + assignmentID + "!",
      });
  }
};

exports.updateStudentGrades = async (req, res) => {
  const assignmentID = req.params.asssignmentID;
  console.log("grading", req.body);
  const studentGrades = req.body.studentList;
  const result = await gradeService.updateStudentGrades(assignmentID, studentGrades);

  if (result) {
    res.status(200).json(result);
  } else {
    res.status(500).json({ message: "Cannot update student grades!" });
  }
};
