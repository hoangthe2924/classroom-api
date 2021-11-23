const express = require("express");
const jwt = require('jsonwebtoken');

const router = express.Router();
const users = require("./user.controller");
const passport = require('../../middleware/passport/index');
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const db = require("../../models");
const User = db.user;

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

    return res.status(200).send({
        userInfo: userInfo
    });
});

router.post("/google/login", async (req, res) => {
    const { token }  = req.body
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email } = ticket.getPayload();    
    console.log(name);
    // findOrCreate
    const [user, created] = await User.findOrCreate({
        where: { email: email },
        defaults: {
          email: email,
          fullname: name,
          username: email
        }
      });
    if (created) {
        console.log(user); // This will certainly be 'Technical Lead JavaScript'
    }    
    const serverToken = jwt.sign({username: user.username,
    }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    return res.status(200).send({
        accessToken: serverToken
      });
})


router.get("/:id", (req, res) => users.findOne(req, res));

module.exports = router;
