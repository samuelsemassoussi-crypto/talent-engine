const mongoose = require('mongoose');
const ROLES = ['recruiter', 'admin']; // extensible: add roles here
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, default: 'recruiter' },
}, { timestamps: true });
module.exports = mongoose.model('User', schema);
module.exports.ROLES = ROLES;
