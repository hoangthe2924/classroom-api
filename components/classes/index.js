const express = require("express");
const router = express.Router();
const classController = require("./class.controller");
const authTeacher = require("../../middleware/teacher.mdw");

router.get("/", (req, res) => classController.findAll(req, res));

router.post("/", (req, res) => classController.create(req, res));

router.post("/people/invite", authTeacher, classController.invitePeople);

router.post("/assignments", authTeacher, classController.createAssignment);

router.put("/assignments",authTeacher, classController.updateAssignment);

router.put("/assignments/order",authTeacher, classController.updateAssignmentOrder);

router.delete("/:classID/assignments/:assignmentID", authTeacher, classController.deleteAssignment);

router.get("/:classID/assignments", authTeacher, classController.getListAssignment);

router.post("/:id/user", (req, res) => classController.addUser(req, res));

router.get("/:id", (req, res) => classController.findOne(req, res));

module.exports = router;
