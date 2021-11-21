const db = require("../../models");
const Class = db.class;
const Op = db.Sequelize.Op;

// Create and Save a new Class
exports.create = (req, res) => {
  // Validate request
  if (!req.body.className) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  const myClass = {
    className: req.body.className,
    subject: req.body.subject,
    year: req.body.year,
  };

  // Save Class in the database
  Class.create(myClass)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Class.",
      });
    });
};

// Retrieve all Classes from the database.
exports.findAll = (req, res) => {
  const className = req.query.className;
  var condition = className
    ? { className: { [Op.like]: `%${className}%` } }
    : null;

  Class.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Class.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Tutorial with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Tutorial with id=" + id,
      });
    });
};
