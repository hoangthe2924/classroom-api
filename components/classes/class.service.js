const db = require("../../models");
const Class = db.class;
const User = db.user;
const UserClass = db.user_class;
const Op = db.Sequelize.Op;

module.exports = {
    async getClassInfoByID(classID){
        const res = await Class.findByPk(classID)
        return res;
    },

    async checkAlreadyEnrollment(email, classID){
        const res = await UserClass.findOne({where: {email: email, classId: classID}}); //note
        if(res === null)
            return false;
        return true;
    },

    async addUserToClass(userID, classID, role){
        try {
            const resCls = await Class.findByPk(classID);
            const resUser = await User.findByPk(userID);
            if(!resCls || !resUser)
                return 404;
            
            resCls.addUser(resUser, { through: { role: role } });
            return 201;     
        } catch (error) {
            console.log(error);
            return 500;
        }
    },

    async checkIfUserIsInClass(userID, classID){
        const res = await UserClass.findOne({classId: classID, userId: userID});
        return (res===null)? false:true;
    },

    async checkCJC(classID, cjc){
        const res = await Class.findOne({id: classID, cjc: cjc});
        return (res===null)? false:true;
    },

    async checkUserIsInWaitingList(userID, classID){
        return null; //dummy
    },

    addToTeacherWaitingRoom(classID, emailList){
        const array = emailList.map(email => ({classid: classID, email: email, status: 0}));

        //dummy
        return true;
    },

    getAccountIDByEmail(email){
        const res = await User.findOne({email: email});
        if(res===null)
            return -1;
        return res.id;
    },
};