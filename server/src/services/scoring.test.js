const assert = require('assert');
const { computeScore } = require('./scoring');
const top = computeScore({ firstName: 'A', lastName: 'B', email: 'a@b.co', phone: '1', country: 'BJ', city: 'X', desiredPosition: 'Full Stack Developer',
  experienceYears: 6, education: 'master', skills: ['HTML', 'css', 'JavaScript', 'React', 'Node.js'], languages: [{ name: 'English', level: 'fluent' }, { name: 'French', level: 'native' }],
  availability: 'immediate', cvUrl: '/x.pdf' });
console.log(top);
assert.strictEqual(top.scoreBreakdown.skills, 25);
assert.strictEqual(top.score, 25 + 25 + 13 + 10 + 10 + 10);
assert.strictEqual(top.category, 'Priority');
assert.strictEqual(computeScore({ desiredPosition: 'X', experienceYears: 0, education: 'other', availability: 'later' }).category, 'Low Match');
console.log('scoring OK');
