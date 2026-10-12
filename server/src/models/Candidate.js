const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: String, country: String, city: String,
  desiredPosition: { type: String, required: true, index: true },
  experienceYears: { type: Number, required: true, min: 0, max: 60 },
  education: { type: String, enum: ['phd', 'master', 'bachelor', 'highschool', 'other'], required: true },
  field: String,
  skills: [String],
  languages: [{ _id: false, name: String, level: { type: String, enum: ['basic', 'intermediate', 'fluent', 'native'] } }],
  availability: { type: String, enum: ['immediate', '1_month', '3_months', 'later'], required: true },
  cvUrl: String,
  score: { type: Number, default: 0, index: true },
  scoreBreakdown: { experience: Number, skills: Number, education: Number, languages: Number, availability: Number, completeness: Number },
  scoreReasons: [String],
  recommendation: String,
  category: { type: String, enum: ['Priority', 'Recommended', 'To Review', 'Low Match'], default: 'Low Match', index: true },
  status: { type: String, enum: ['New', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Hired'], default: 'New', index: true },
  isDemo: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Candidate', schema);
