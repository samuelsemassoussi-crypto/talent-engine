const router = require('express').Router(); const bcrypt = require('bcryptjs'); const jwt = require('jsonwebtoken');
const User = require('../models/User'); const { protect } = require('../middleware/auth');
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const crypto = require('crypto');
const h = (v) => crypto.createHash('sha256').update(String(v)).digest();
const codeOk = (given) => !!process.env.RECRUITER_ACCESS_CODE && crypto.timingSafeEqual(h(given), h(process.env.RECRUITER_ACCESS_CODE));
// Basic brute-force protection on the access code: 5 failures / 15 min / IP (in-memory, fine for a single-instance MVP)
const fails = new Map();
const blocked = (ip) => { const f = fails.get(ip); return f && f.n >= 5 && Date.now() - f.t < 15 * 60 * 1000; };
const fail = (ip) => { const f = fails.get(ip); fails.set(ip, f && Date.now() - f.t < 15 * 60 * 1000 ? { n: f.n + 1, t: f.t } : { n: 1, t: Date.now() }); };
router.post('/register', async (req, res) => {
  const { name, email, password, accessCode } = req.body;
  if (!process.env.RECRUITER_ACCESS_CODE) return res.status(503).json({ message: 'Registration is disabled: no access code configured on the server' });
  if (blocked(req.ip)) return res.status(429).json({ message: 'Too many invalid codes. Try again in 15 minutes.' });
  if (!accessCode || !codeOk(accessCode)) { fail(req.ip); return res.status(403).json({ message: 'Invalid access code' }); }
  if (!name || !EMAIL.test(email || '') || (password || '').length < 8) return res.status(400).json({ message: 'Valid name, email and a password of 8+ characters are required' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
  // Role never comes from the request: a valid access code creates a recruiter. Admins are created via seed.
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: 'recruiter' });
  res.status(201).json({ token: sign(user), user: pub(user) });
});
router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: sign(user), user: pub(user) });
});
router.get('/me', protect, (req, res) => res.json({ user: pub(req.user) }));
module.exports = router;
