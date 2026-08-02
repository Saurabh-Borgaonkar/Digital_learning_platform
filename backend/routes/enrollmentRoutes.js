const express = require('express');
const router = express.Router();
const { enrollCourse, getMyEnrollments, checkEnrollment, getCourseEnrollments } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('student'), enrollCourse);
router.get('/my', protect, getMyEnrollments);
router.get('/check/:courseId', protect, checkEnrollment);
router.get('/course/:courseId', protect, authorize('teacher', 'admin'), getCourseEnrollments);

module.exports = router;
