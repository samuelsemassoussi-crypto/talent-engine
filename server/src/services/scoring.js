// Transparent scoring: 100 = experience 25 + skills 30 + education 15 + languages 10 + availability 10 + completeness 10
const JOBS = {
  'Full Stack Developer': { skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'], languages: ['English', 'French'] },
  'Frontend Developer': { skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS'], languages: ['English'] },
  'Backend Developer': { skills: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JWT', 'Docker'], languages: ['English'] },
  'Data Analyst': { skills: ['SQL', 'Excel', 'Python', 'Power BI', 'Statistics'], languages: ['English', 'French'] },
};
const EDU = { phd: [15, 'PhD'], master: [13, "Master's degree"], bachelor: [10, "Bachelor's degree"], highschool: [6, 'High school diploma'], other: [3, 'Other education'] };
const AVAIL = { immediate: [10, 'Immediate availability'], '1_month': [7, 'Available within 1 month'], '3_months': [4, 'Available within 3 months'], later: [2, 'Available in more than 3 months'] };
const LEVEL = { basic: 0.4, intermediate: 0.7, fluent: 1, native: 1 };
const n = (s) => String(s || '').trim().toLowerCase();

function getCategory(score) {
  if (score >= 80) return 'Priority';
  if (score >= 60) return 'Recommended';
  if (score >= 40) return 'To Review';
  return 'Low Match';
}

function computeScore(c) {
  const job = JOBS[c.desiredPosition] || { skills: [], languages: [] };
  const reasons = [];
  const years = Number(c.experienceYears) || 0;
  const experience = Math.min(years, 5) * 5;
  reasons.push(years >= 5 ? '5+ years of experience' : `${years} year${years === 1 ? '' : 's'} of experience`);

  const have = new Set((c.skills || []).map(n));
  const matched = job.skills.filter((s) => have.has(n(s)));
  const skills = job.skills.length ? Math.round((matched.length / job.skills.length) * 30) : 0;
  reasons.push(job.skills.length ? `${matched.length}/${job.skills.length} required skills matched` : 'No predefined skill profile for this position');

  const [education, eduLabel] = EDU[c.education] || EDU.other;
  reasons.push(eduLabel);

  let languages = 0;
  if (job.languages.length) {
    const lv = Object.fromEntries((c.languages || []).map((l) => [n(l.name), LEVEL[l.level] || 0]));
    languages = Math.round((job.languages.reduce((a, l) => a + (lv[n(l)] || 0), 0) / job.languages.length) * 10);
    reasons.push(`Languages: ${languages}/10 (required: ${job.languages.join(', ')})`);
  }

  const [availability, availLabel] = AVAIL[c.availability] || AVAIL.later;
  reasons.push(availLabel);

  const checks = [c.firstName, c.lastName, c.email, c.phone, c.country, c.city, c.desiredPosition, c.education, c.cvUrl,
    (c.skills || []).length && (c.languages || []).length];
  const completeness = checks.filter(Boolean).length;
  reasons.push(completeness === 10 ? 'Complete profile' : `Profile ${completeness * 10}% complete`);

  const scoreBreakdown = { experience, skills, education, languages, availability, completeness };
  const score = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0);
  const category = getCategory(score);
  const recommendation = { Priority: 'Priority candidate', Recommended: 'Recommended candidate', 'To Review': 'Candidate to review', 'Low Match': 'Low match for this position' }[category];
  return { score, category, scoreBreakdown, scoreReasons: reasons, recommendation };
}
module.exports = { computeScore, getCategory, JOBS };
