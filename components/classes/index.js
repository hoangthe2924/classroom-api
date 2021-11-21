const express = require("express");
const router = express.Router();
const classes = require("./class.controller");

router.get("/", (req, res) => classes.findAll(req, res));

router.post("/", (req, res) => classes.create(req, res));

router.get("/:id", (req, res) => classes.findOne(req, res));

module.exports = router;
