const express = require("express");
const router = express.Router();
const classController = require("./class.controller");
const authTeacher = require("../../middleware/teacher.mdw");
const passport = require("../../middleware/passport/index");

router.post("/people/invite", authTeacher, classController.invitePeople);

router.get("/", (req, res) => classController.findAll(req, res));

router.post("/", (req, res) => classController.create(req, res));

router.get("/:id", (req, res) => classController.findOne(req, res));

router.post("/:id", (req, res) => classController.addUser(req, res));

module.exports = router;
