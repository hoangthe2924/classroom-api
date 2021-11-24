const db = require("../../models");
const classModel = require("../../models/class.model");
const Class = db.class;
const User = db.user;
const UserClass = db.user_class;
const teacherWaitingList = db.teacherWaiting;
const Op = db.Sequelize.Op;

module.exports = {
    async getClassInfoByID(classID){
        const res = await Class.findByPk(classID)
        return res;
    },

    async checkAlreadyEnrollment(email, classID){
        const userID = this.getAccountIDByEmail(email);
        if(userID<0)
            return false;
        const res = await UserClass.findOne({where: {userId: userID, classId: classID}}); //note
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
        const res = await UserClass.findOne({where: {classId: classID, userId: userID}});
        return (res===null)? false:res.role;
    },

    async checkCJC(classID, cjc){
        const res = await Class.findOne({where: {id: classID, cjc: cjc}});
        return (res===null)? false:true;
    },

    async checkUserIsInWaitingList(userID, classID){
        const user = await User.findByPk(userID);
        if(user!==null){
            const listElement = await teacherWaitingList.findOne({where: {mail: user.email, classId: classID}})
            return (listElement===null)? false:true;
        }
        return false;
    },

    async addToTeacherWaitingRoom(classID, emailList){
        const cls = await Class.findByPk(classID);
        if(cls===null){
            return false;
        }
        
        const array = emailList.map(email => ({classid: classID, mail: email, classId: classID}));  
        teacherWaitingList.bulkCreate(array);
        return true;
    },

    async getAccountIDByEmail(email){
        const res = await User.findOne({where: {email: email}});
        if(res===null)
            return -1;
        return res.id;
    },

    async checkIfUserIsTeacher(userID, classID){
        const res = await UserClass.findOne({where: {userId: userID, classId: classID, role: "teacher"}});
        return (res!==null)? true:false;
    }
};