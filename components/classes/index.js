const express = require("express");
const router = express.Router();
const classController = require("./class.controller");
const authTeacher = require("../../middleware/teacher.mdw");

router.post("/people/invite", authTeacher, classController.invitePeople);

router.get("/", passport.authenticate("jwt", { session: false }), (req, res) =>
  classController.findAll(req, res)
);

router.post("/", passport.authenticate("jwt", { session: false }), (req, res) =>
  classController.create(req, res)
);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => classController.findOne(req, res)
);

router.post(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => classController.addUser(req, res)
);

module.exports = router;
