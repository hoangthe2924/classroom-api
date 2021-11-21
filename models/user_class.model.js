module.exports = (sequelize, Sequelize) => {
  const UserClass = sequelize.define("user_class", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    class_id: {
      type: Sequelize.INTEGER,
    },
    role: {
      type: Sequelize.INTEGER,
    },
  });

  return UserClass;
};
