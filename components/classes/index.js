const express = require("express");
const router = express.Router();
const classController = require("./class.controller");
const authTeacher = require("../../middleware/teacher.mdw");

router.get("/", (req, res) => classController.findAll(req, res));

router.post("/", (req, res) => classController.create(req, res));

router.get("/detail/:id", (req, res) => classController.findOne(req, res));

router.post("/detail/:id/addUser", (req, res) => classController.addUser(req, res));

router.post("/people/invite", authTeacher, classController.invitePeople);

router.post("/assignments",authTeacher, classController.createAssignment); //ok

router.put("/assignments",authTeacher, classController.updateAssignment);

router.delete("/detail/:classID/assignments/:assignmentID",authTeacher, classController.deleteAssignment);

router.get("/detail/:classID/assignments/",authTeacher, classController.getListAssignment);

router.put("/assignments/order",authTeacher, classController.updateAssignmentOrder);

module.exports = router;
