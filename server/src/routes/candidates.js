const router = require('express').Router(); const fs = require('fs'); const path = require('path');
const Candidate = require('../models/Candidate'); const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload'); const { computeScore, JOBS } = require('../services/scoring');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const enumOf = (p) => Candidate.schema.path(p).enumValues;
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parse = (v, d) => { if (typeof v !== 'string') return v ?? d; try { return JSON.parse(v); } catch { return d; } };

function validate(b) {
  const e = [];
  ['firstName', 'lastName', 'desiredPosition'].forEach((f) => !String(b[f] || '').trim() && e.push(`${f} is required`));
  if (!EMAIL.test(b.email || '')) e.push('A valid email is required');
  const x = Number(b.experienceYears);
  if (b.experienceYears === '' || b.experienceYears == null || Number.isNaN(x) || x < 0 || x > 60) e.push('experienceYears must be a number between 0 and 60');
  if (!enumOf('education').includes(b.education)) e.push('Invalid education level');
  if (!enumOf('availability').includes(b.availability)) e.push('Invalid availability');
  if (!Array.isArray(b.skills) || !b.skills.length || b.skills.some((s) => typeof s !== 'string' || !s.trim() || s.length > 40)) e.push('At least one valid skill is required');
  if (!Array.isArray(b.languages) || b.languages.some((l) => !l.name || !['basic', 'intermediate', 'fluent', 'native'].includes(l.level))) e.push('Invalid languages');
  return e;
}
const body = (req) => ({ ...req.body, skills: parse(req.body.skills, []), languages: parse(req.body.languages, []) });
const withScore = (c) => Object.assign(c, computeScore(c));

// Public: application (multipart/form-data, file field "cv" = PDF)
router.post('/', (req, res) => upload(req, res, async (err) => {
  const drop = () => req.file && fs.unlink(req.file.path, () => {});
  if (err) return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'CV is too large' : err.message });
  const b = body(req); const errors = validate(b);
  if (errors.length) { drop(); return res.status(400).json({ message: 'Validation failed', errors }); }
  const { status, score, category, isDemo, ...safe } = b; // applicants cannot set these
  const c = new Candidate({ ...safe, cvUrl: req.file ? `/uploads/${req.file.filename}` : undefined });
  withScore(c); await c.save(); res.status(201).json({ id: c._id, score: c.score, category: c.category });
}));

router.use(protect);
router.get('/meta/positions', (_req, res) => res.json(Object.keys(JOBS)));

router.get('/', async (req, res) => {
  const { q, position, category, status, minScore, maxScore, minExp, sort = 'score_desc', page = 1, limit = 50 } = req.query;
  const f = {};
  if (q) f.$or = ['firstName', 'lastName', 'email'].map((k) => ({ [k]: new RegExp(esc(q), 'i') }));
  if (position) f.desiredPosition = String(position);
  if (category) f.category = String(category);
  if (status) f.status = String(status);
  if (minScore || maxScore) f.score = { ...(minScore && { $gte: +minScore }), ...(maxScore && { $lte: +maxScore }) };
  if (minExp) f.experienceYears = { $gte: +minExp };
  const sorts = { score_desc: { score: -1 }, score_asc: { score: 1 }, newest: { createdAt: -1 }, oldest: { createdAt: 1 } };
  const l = Math.min(+limit || 50, 200);
  const [items, total] = await Promise.all([
    Candidate.find(f).sort(sorts[sort] || sorts.score_desc).skip((Math.max(+page, 1) - 1) * l).limit(l), Candidate.countDocuments(f)]);
  res.json({ items, total, page: +page, pages: Math.ceil(total / l) });
});

const find = async (req, res) => {
  const c = await Candidate.findById(req.params.id).catch(() => null);
  if (!c) res.status(404).json({ message: 'Candidate not found' });
  return c;
};
router.get('/:id', async (req, res) => { const c = await find(req, res); if (c) res.json(c); });
router.put('/:id', async (req, res) => {
  const c = await find(req, res); if (!c) return;
  const b = body(req); const errors = validate({ ...c.toObject(), ...b });
  if (errors.length) return res.status(400).json({ message: 'Validation failed', errors });
  ['firstName', 'lastName', 'email', 'phone', 'country', 'city', 'desiredPosition', 'experienceYears', 'education', 'field', 'skills', 'languages', 'availability']
    .forEach((k) => b[k] !== undefined && (c[k] = b[k]));
  withScore(c); await c.save(); res.json(c);
});
router.delete('/:id', async (req, res) => {
  const c = await find(req, res); if (!c) return;
  if (c.cvUrl) fs.unlink(path.join(__dirname, '../..', c.cvUrl), () => {});
  await c.deleteOne(); res.json({ message: 'Candidate deleted' });
});
router.post('/:id/score', async (req, res) => { const c = await find(req, res); if (!c) return; withScore(c); await c.save(); res.json(c); });
router.get('/:id/score', async (req, res) => {
  const c = await find(req, res); if (!c) return;
  const { score, category, scoreBreakdown, scoreReasons, recommendation } = c; res.json({ score, category, scoreBreakdown, scoreReasons, recommendation });
});
router.patch('/:id/status', async (req, res) => {
  const ok = enumOf('status');
  if (!ok.includes(req.body.status)) return res.status(400).json({ message: `Status must be one of: ${ok.join(', ')}` });
  const c = await find(req, res); if (!c) return;
  c.status = req.body.status; await c.save(); res.json(c);
});
module.exports = router;
