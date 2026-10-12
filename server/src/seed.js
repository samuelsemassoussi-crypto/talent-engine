require('dns').setServers(['8.8.8.8', '1.1.1.1']); // workaround for networks that block SRV lookups
// DEMO DATA ONLY: fictional people, reserved example.com emails.
require('dotenv').config();
const bcrypt = require('bcryptjs'); const mongoose = require('mongoose');
const User = require('./models/User'); const Candidate = require('./models/Candidate'); const { computeScore } = require('./services/scoring');
const S = { fs: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'], be: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JWT', 'Docker'], da: ['SQL', 'Excel', 'Python', 'Power BI', 'Statistics'] };
const FR = [{ name: 'French', level: 'native' }, { name: 'English', level: 'fluent' }], EN = [{ name: 'English', level: 'intermediate' }], FRb = [{ name: 'French', level: 'fluent' }, { name: 'English', level: 'basic' }];
const ST = ['New', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Hired'];
// [first,last,position,years,edu,skills,langs,avail]
const rows = [
  ['Amina', 'Diallo', 'Full Stack Developer', 7, 'master', S.fs, FR, 'immediate'], ['Lucas', 'Martin', 'Full Stack Developer', 5, 'master', S.fs.slice(0, 5), FR, 'immediate'],
  ['Sofia', 'Rossi', 'Full Stack Developer', 4, 'bachelor', S.fs.slice(0, 5), FR, '1_month'], ['Kofi', 'Mensah', 'Full Stack Developer', 3, 'bachelor', S.fs.slice(0, 4), FRb, '1_month'],
  ['Emma', 'Bernard', 'Full Stack Developer', 1, 'bachelor', S.fs.slice(0, 3), EN, '3_months'], ['Noah', 'Dubois', 'Full Stack Developer', 0, 'highschool', ['HTML', 'CSS'], EN, 'later'],
  ['Fatou', 'Sow', 'Backend Developer', 6, 'phd', S.be, FR, 'immediate'], ['Hugo', 'Petit', 'Backend Developer', 4, 'master', S.be.slice(0, 4), FR, '1_month'],
  ['Yasmine', 'Haddad', 'Backend Developer', 2, 'bachelor', S.be.slice(0, 3), EN, '3_months'], ['Ethan', 'Moreau', 'Backend Developer', 1, 'other', ['Node.js'], EN, 'later'],
  ['Chloe', 'Laurent', 'Frontend Developer', 5, 'bachelor', ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'], FR, 'immediate'], ['Mehdi', 'Benali', 'Frontend Developer', 2, 'bachelor', ['HTML', 'CSS', 'JavaScript'], EN, '1_month'],
  ['Ines', 'Garcia', 'Data Analyst', 6, 'master', S.da, FR, '1_month'], ['Tom', 'Leroy', 'Data Analyst', 3, 'bachelor', ['SQL', 'Excel'], FRb, '3_months'], ['Zoe', 'Fabre', 'Data Analyst', 0, 'other', ['Excel'], EN, 'later'],
  ['Adam', 'Keita', 'Full Stack Developer', 2, 'master', ['JavaScript', 'React'], FR, 'immediate'],
];
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Candidate.deleteMany({ isDemo: true });
  await User.deleteMany({ email: { $in: ['admin@talentengine.demo', 'recruiter@talentengine.demo'] } });
  const pw = await bcrypt.hash('Demo1234!', 12);
  await User.create([{ name: 'Demo Admin', email: 'admin@talentengine.demo', password: pw, role: 'admin' }, { name: 'Demo Recruiter', email: 'recruiter@talentengine.demo', password: pw, role: 'recruiter' }]);
  const docs = rows.map(([firstName, lastName, desiredPosition, experienceYears, education, skills, languages, availability], i) => {
    const c = { firstName, lastName, email: `${firstName}.${lastName}@example.com`.toLowerCase(), phone: '+000 000 000', country: 'Demo', city: 'Demoville', desiredPosition,
      experienceYears, education, skills, languages, availability, cvUrl: i % 4 === 3 ? undefined : '/uploads/demo.pdf', status: ST[i % ST.length], isDemo: true,
      createdAt: new Date(Date.now() - i * 86400000 * 2) };
    return { ...c, ...computeScore(c) };
  });
  await Candidate.insertMany(docs);
  console.log(`Seeded ${docs.length} demo candidates + 2 users`); await mongoose.disconnect();
})();
