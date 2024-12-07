const mongoose = require('mongoose');
const Joi = require('joi');
const studentSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  grade: { type: Number, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token : { type: String, required: true }
});


module.exports = mongoose.model('Student', studentSchema);
