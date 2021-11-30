const classService = require("../components/classes/class.service");

module.exports = async function authTeacher(req, res, next) {
    const classID = (req.body.classID || req.params.classID);
    const isInClassAsTeacher = await classService.checkIfUserIsTeacher(req.user.id, classID);
    if (!isInClassAsTeacher) {
      res.status(403).json({message: "You don't have permission to use this api!"});
    }else{
        next();
    }
};