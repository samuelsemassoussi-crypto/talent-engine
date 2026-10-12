require('express-async-errors');
const express = require('express'); const cors = require('cors'); const path = require('path'); const { protect } = require('./middleware/auth');
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', protect, express.static(path.join(__dirname, '../uploads'))); // CVs: recruiters only
app.use('/api/auth', require('./routes/auth'));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use((_r, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, _r, res, _n) => { console.error(err); res.status(500).json({ message: 'Server error' }); });
module.exports = app;
