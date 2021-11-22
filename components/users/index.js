const express = require("express");
const jwt = require('jsonwebtoken');

const router = express.Router();
const users = require("./user.controller");
const passport = require('../../middleware/passport/index');


router.get("/", (req, res) => users.findAll(req, res));

router.get("/:id", (req, res) => users.findOne(req, res));

/* POST login */
router.post('/login', passport.authenticate('local',{session: false}), function(req, res, next) {
    console.log('login success');
    const token = jwt.sign({username: req.body.username,
    }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    return res.setHeader('Access-Control-Allow-Credentials', true).setHeader('Access-Control-Allow-Origin', 'http://localhost:3001')
    .cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({ message: "Logged in successfully 😊 👌" });
});

/* POST register */
router.post("/register", (req, res, next) => users.create(req, res));

module.exports = router;
