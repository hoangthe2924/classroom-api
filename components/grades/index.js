const express = require("express");
const router = express.Router();
const gradeController = require("./grade.controller");
const authTeacher = require("../../middleware/teacher.mdw");


router.get(
  "/:asssignmentID/studentGrades",
  authTeacher,
  gradeController.getStudentGrades
);

router.put(
  "/:asssignmentID/studentGrades",
  authTeacher,
  gradeController.updateStudentGrades
);

module.exports = router;
