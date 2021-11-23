const express = require("express");
const jwt = require('jsonwebtoken');

const router = express.Router();
const users = require("./user.controller");
const passport = require('../../middleware/passport/index');
const { user } = require("../../models");


router.get("/", (req, res) => users.findAll(req, res));

/* POST login */
router.post('/login', passport.authenticate('local',{session: false}), function(req, res, next) {
    console.log('login success');
    const token = jwt.sign({username: req.body.username,
    }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    return res.status(200).send({
        accessToken: token
      });
});

/* POST register */
router.post("/register", (req, res, next) => users.create(req, res));

/* Protected domain */
router.get("/info",passport.authenticate('jwt',{session: false}), function(req, res, next) {

    const userInfo = req.user;
    delete userInfo.password;

    return res.status(200).send({
        userInfo: userInfo
    });
});

router.get("/:id", (req, res) => users.findOne(req, res));

module.exports = router;
