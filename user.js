var jwt = require('jsonwebtoken');

const users = [];
 
const addUser = ({socketId, token}) => {
    const username = jwt.verify(token, process.env.JWT_SECRET)?.username
    const existingUser = users.find((user) => {
        console.log(user.username);
        return user.username === username
    });
 
    if(existingUser) {
        return 
    }
    const user = {socketId,username};
 
    users.push(user);
    console.log(users);
    return {user};
 
}
 
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        user.id === id
    });
 
    if(index !== -1) {
        return users.splice(index,1)[0];
    }
}
 
const getUser = (id) => users
        .find((user) => user.id === id);
 
const getUsersInRoom = (room) => users
        .filter((user) => user.room === room);
 
module.exports = {addUser, removeUser,
        getUser, getUsersInRoom};