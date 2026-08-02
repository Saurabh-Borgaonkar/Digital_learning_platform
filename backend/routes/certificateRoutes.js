const express = require('express');
const router = express.Router();
const { getMyCertificates, getCertificate, generateCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyCertificates);
router.post('/generate', protect, generateCertificate);
router.get('/:id', protect, getCertificate);

module.exports = router;
