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
  const classId = req.query.classID;

  console.log("grading", req.body);
  const studentGrades = req.body.studentList;
  const result = await gradeService.updateStudentGrades(assignmentID,classId, studentGrades);

  if (result) {
    res.status(200).json(result);
  } else {
    res.status(500).json({ message: "Cannot update student grades!" });
  }
};

exports.finalizeGrades = async (req, res) => {
  const assignmentID = req.params.asssignmentID;
  console.log("grading", req.body);
  const result = await gradeService.finalizeGrades(assignmentID);
  if (result) {
    res.status(200).json(result);
  } else {
    res
      .status(500)
      .json({
        message: "Cannot get change finalize state of assignment id: " + assignmentID + "!",
      });
  }
};

exports.getStudentGradeDetail = async (req, res) => {
  const studentId = req.query.studentId;
  const classId = req.query.classId;

  const result = await gradeService.getStudentGradeDetail(studentId, classId);
  if(result === false){
    res.status(404).json({message: "Something went wrongg!"});
  }else if (result === null){
    res.status(500).json({message: "Resource is not available!"});
  }else{
    res.status(200).json(result);
  }
};