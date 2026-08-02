const express = require('express');
const router = express.Router();
const { createQuiz, getCourseQuizzes, getQuiz, attemptQuiz, getMyResults, deleteQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.get('/my-results', protect, authorize('student'), getMyResults);
router.get('/course/:courseId', protect, getCourseQuizzes);
router.get('/:id', protect, getQuiz);
router.post('/:id/attempt', protect, authorize('student'), attemptQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);

module.exports = router;
