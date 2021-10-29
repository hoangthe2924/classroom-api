const db = require("../../utils/database")

module.exports = {
    getClassList() {
        return db("Classes");
    },
    getClassListByID(id) {
        return db("Classes").where("Id",id);
    },
    addClass(className){
        return db('Classes').insert({className:className });
    }
}