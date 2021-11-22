module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
    },
    fullname: {
      type: Sequelize.STRING,
    },
    studentId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
  });

  return User;
};
