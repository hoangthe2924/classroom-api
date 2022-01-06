const express = require("express");
const router = express.Router();
const gradeController = require("./grade.controller");
const authTeacher = require("../../middleware/teacher.mdw");


router.get("/:asssignmentID/studentGrades", authTeacher, gradeController.getStudentGrades);

router.put("/:asssignmentID/studentGrades", authTeacher, gradeController.updateStudentGrades);

router.put("/:asssignmentID/finalize", authTeacher, gradeController.finalizeGrades);

router.get("/studentGradeDetail", gradeController.getStudentGradeDetail);

module.exports = router;
