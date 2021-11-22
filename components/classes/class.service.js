const db = require("../../models");
const Class = db.class;
const User = db.user;
const Op = db.Sequelize.Op;

module.exports = {
    async getClassInfoByID(classID){
        const res = await db('Classes').where('id',classID).select('id','className');
        if(res.length===0)
            return null;
        return res[0];
    },

    addToWaitingEnrollmentList(emailList, classID, role){
        console.log('emailList', emailList);
        const array = emailList.map(email => ({classid: classID, email: email, status: 0}));
        if(role==='teacher')
            return db('class_teacher_list_waiting').insert(array);
        if(role==='student')
            return db('class_student_list_waiting').insert(array);
        return null;
    },

    async checkAlreadyEnrollment(email, classID){
        const res = await db('class_people').where('classid',classID).andWhere('email',email);
        if(res.length===0)
            return false;
        return true;
    },

    joinClassByStudent(classID, email){

    },

    joinClassByTeacher(classID, email){

    },

    addToTeacherWaitingRoom(classID, emailList){
        return this.addToWaitingEnrollmentList(emailList,classID,'teacher');
    },

    addToStudentWaitingRoom(classID, emailList){
        return this.addToWaitingEnrollmentList(emailList,classID,'student');
    }
};