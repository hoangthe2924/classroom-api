const express = require('express');
const router = express.Router();

const func = require('./functions')
const {route} = require("express/lib/router");
const classController = require("./classController");

/* GET home page. */
router.get('/', async function(req, res, next) {
    const result = await func.getClassList();
    console.log(result);
    res.json(result);
});
router.get('/:id',async function (req,res,next) {
    const result = await func.getClassListByID(req.params.id);
    res.json(result);
});
router.post('/',async function (req,res){
    await func.addClass(req.body.className);
    res.send("OK");
});

router.post('/people/invite', classController.invitePeople);



module.exports = router;
