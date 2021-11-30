module.exports = (sequelize, Sequelize) => {
    const Assignment = sequelize.define("assignment", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      title: {
        type: Sequelize.STRING,
      },
      point: {
        type: Sequelize.FLOAT,
      },
      order: {
        type: Sequelize.FLOAT,
      },
    });
  
    return Assignment;
  };
  