const express = require("express");
const router = express.Router();
const users = require("./user.controller");

router.get("/", (req, res) => users.findAll(req, res));

router.post("/", (req, res) => users.create(req, res));

router.get("/:id", (req, res) => users.findOne(req, res));

module.exports = router;
