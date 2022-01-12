const { where } = require("sequelize/dist");
const db = require("../../models");
const Assignment = db.assignment;
const User = db.user;
const Grade = db.grade;
const StudentFullname = db.studentFullname;
const GradeReview = db.gradeReview;
const CommentGradeReview = db.commentGradeReview;
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

  async updateStudentGrades(assignmentID, classId, studentGrades) {
    try {
      for (let grade of studentGrades) {
        if (!grade[assignmentID]) continue;
        const studentIdFk = await StudentFullname.findOne({
          where: {
            studentId: grade.studentId,
            classId: classId,
          },
        });
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
            grade: grade[assignmentID],
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
      console.log(assignmentID);
      return Assignment.update(
        { finalize: Sequelize.literal("NOT finalize") },
        {
          where: {
            id: assignmentID,
          },
        }
      );
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  getStudentGradeDetail(studentId, classId) {
    try {
      return StudentFullname.findOne({
        where: { studentId: studentId, classId: classId },
        include: [
          {
            model: Assignment,
            as: "assignments",
            attributes: ["id", "title", "point", "order", "finalize"],
            through: {
              attributes: ["grade"],
            },
            where: { finalize: 1 },
          },
        ],
        order: [["assignments", "order", "ASC"]],
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  getGradeReviewDetail(studentId, assignmentId) {
    try {
      return User.findOne({
        where: { studentId: studentId },
        attributes: ["id", "fullName", "studentId"],
        include: [
          {
            model: GradeReview,
            as: "gradeReviewRequests",
            attributes: ["id", "expectedGrade", "reviewMessage", "status"],
            where: { assignmentId: assignmentId },
            include: [
              {
                model: CommentGradeReview,
                as: "gdCommentList",
                attributes: ["id", "content", "createdAt"],
                include: [
                  {
                    model: User,
                    attributes: ["id", "fullName"],
                  },
                ][0],
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async createGradeReviewRequest(assignmentId, userID, newGRR) {
    try {
      const assignment = await Assignment.findByPk(assignmentId);
      const user = await User.findByPk(userID);

      if (assignment && user) {
        const createdGradeReviewRequest = await GradeReview.create(newGRR);
        createdGradeReviewRequest.setAssignment(assignment);
        createdGradeReviewRequest.setUser(user);
        return createdGradeReviewRequest;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async changeGradeReviewRequestStatus(grID, status) {
    try {
      return GradeReview.update({status: status},{where: {id: grID}});
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async createGradeReviewComment(userID, gradeReviewId, newGRC) {
    try {
      const gradeReview = await GradeReview.findByPk(gradeReviewId);
      const user = await User.findByPk(userID);

      if (gradeReview && user) {
        const createdGradeReviewComment = await CommentGradeReview.create(newGRC);
        createdGradeReviewComment.setGradeReview(gradeReview);
        createdGradeReviewComment.setUser(user);
        return createdGradeReviewComment;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async getListGradeReview(classId) {
    try {
      return GradeReview.findAll({
        attributes: ["id", "expectedGrade", "reviewMessage", "status"],
        include: [
          {
            model: Assignment,
            attributes: ["id","title"],
            where: {classId: classId}
          },
          {
            model: User,
            attributes: ["id", "studentId", "fullName"],
          },
        ],
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async getGradeReviewSummary(studentId, assignmentId){
    try {
      return StudentFullname.findAll({
        where: { studentId: studentId },
        attributes: ["id", "studentId", "fullName"],
        include: [
          {
            model: Assignment,
            as: "assignments",
            attributes: ["id", "title"],
            through: {
              attributes: ["grade"],
            },
            where: { finalize: 1, id: assignmentId },
          },
        ],
      });
    } catch (error) {
      return false;
    }
  },
};
