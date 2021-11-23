const express = require("express");
const router = express.Router();
const classController = require("./class.controller");

// const {route} = require("express/lib/router");

// /* GET home page. */
// router.get('/', async function(req, res, next) {
//     const result = await func.getClassList();
//     console.log(result);
//     res.json(result);
// });
// router.get('/:id',async function (req,res,next) {
//     const result = await func.getClassListByID(req.params.id);
//     res.json(result);
// });
// router.post('/',async function (req,res){
//     await func.addClass(req.body.className);
//     res.send("OK");
// });

router.post("/people/invite", classController.invitePeople);

router.get("/", (req, res) => classController.findAll(req, res));

router.post("/", (req, res) => classController.create(req, res));

router.get("/:id", (req, res) => classController.findOne(req, res));

router.post("/:id", (req, res) => classController.addUser(req, res));

module.exports = router;
