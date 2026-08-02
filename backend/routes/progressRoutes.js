const express = require('express');
const router = express.Router();
const { getProgress, markLessonComplete } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:courseId', protect, getProgress);
router.put('/:courseId/lesson/:lessonId', protect, markLessonComplete);

module.exports = router;
