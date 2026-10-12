const router = require('express').Router(); const Candidate = require('../models/Candidate'); const { protect } = require('../middleware/auth');
router.get('/stats', protect, async (_req, res) => {
  const grp = (k) => Candidate.aggregate([{ $group: { _id: k, n: { $sum: 1 } } }]);
  const [total, avg, cat, st, dist] = await Promise.all([
    Candidate.countDocuments(), Candidate.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }]), grp('$category'), grp('$status'),
    Candidate.aggregate([{ $bucket: { groupBy: '$score', boundaries: [0, 20, 40, 60, 80, 101], default: 'other', output: { n: { $sum: 1 } } } }])]);
  const m = (a) => Object.fromEntries(a.map((x) => [x._id, x.n])); const d = m(dist);
  res.json({ total, averageScore: Math.round((avg[0]?.avg || 0) * 10) / 10, byCategory: m(cat), byStatus: m(st),
    distribution: [0, 20, 40, 60, 80].map((b, i) => ({ range: ['0-19', '20-39', '40-59', '60-79', '80-100'][i], count: d[b] || 0 })) });
});
module.exports = router;
