const { where } = require("sequelize/dist");
const db = require("../../models");
const { finalizeGrades } = require("./grade.controller");
const Assignment = db.assignment;
const User = db.user;
const Grade = db.grade;
const StudentFullname = db.studentFullname;
const { Sequelize } = require("sequelize");


module.exports = {
  async getStudentGrades(assignmentID) {
    try {
      return Grade.findAll({
        where: { assignmentId: assignmentID },
        attributes: ["grade", "studentIdFk", "assignmentId"],
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async updateStudentGrades(assignmentID,classId, studentGrades) {
    try {
      for (let grade of studentGrades) {
        if (!grade[assignmentID]) continue;
        const studentIdFk = await StudentFullname.findOne({
          where: {
            studentId: grade.studentId,
            classId: classId
          }
        })
        const existedGrade = await Grade.findOne({
          where: { assignmentId: assignmentID, studentIdFk: studentIdFk.id },
        });
        if (existedGrade) {
          // update
          existedGrade.update({ grade: grade[assignmentID] });
        }
        // insert
        else {
          const newStudent = await Grade.create({
            studentIdFk: studentIdFk.id,
            assignmentId: assignmentID,
            grade: grade[assignmentID]
          });
        }
      }
      return Grade.findAll({
        where: { assignmentId: assignmentID },
        attributes: ["grade", "studentIdFk", "assignmentId"],
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async finalizeGrades(assignmentID) {
    try {
      console.log(assignmentID)
      return Assignment.update(
        { finalize: Sequelize.literal('NOT finalize') },
        {
          where:
          {
            id: assignmentID
          }
        },
      )
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async getStudentGradeDetail(studentId, classId){
    try {
      const res = await StudentFullname.findOne({
        where: {studentId: studentId, classId: classId},
        include: [{
          model: Assignment,
          as: "students",
          attributes: ["id", "title", "point", "order", "finalize"],
          through: {
            attributes: ["grade"],
          },
          where: { finalize: 1 }
        }],
        order: [["students", "order", "ASC"]],
      });

      return res;
    } catch (error) {
      console.log(error);
      return false;
    }  
  },

};
