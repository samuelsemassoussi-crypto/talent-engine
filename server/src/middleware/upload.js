const multer = require('multer'); const path = require('path'); const crypto = require('crypto');
module.exports = multer({
  storage: multer.diskStorage({ destination: path.join(__dirname, '../../uploads'), filename: (_r, _f, cb) => cb(null, crypto.randomUUID() + '.pdf') }),
  limits: { fileSize: (Number(process.env.MAX_CV_MB) || 5) * 1024 * 1024 },
  fileFilter: (_r, f, cb) => (f.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('Only PDF files are allowed'))),
}).single('cv');
