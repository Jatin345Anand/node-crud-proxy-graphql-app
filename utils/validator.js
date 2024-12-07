const Joi = require('joi');
const studentSchema = Joi.object({
    first_name: Joi.string().min(3).max(30).required(),
    last_name: Joi.string().min(3).max(30).required(),
    date_of_birth: Joi.date().required(),
    grade: Joi.number().integer().min(1).max(12).required(),
    phone: Joi.string().pattern(/^\+\d{10,15}$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().default('abc$123')
  });
  
  const validateStudent = (req, res, next) => {
    const { error } = studentSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
  };

  module.exports = {
    validateStudent
  }
  