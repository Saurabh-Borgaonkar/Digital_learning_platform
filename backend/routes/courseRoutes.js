const express = require('express');
const router = express.Router();
const {
  getCourses, getCourse, createCourse, updateCourse,
  deleteCourse, togglePublish, getMyCourses, addLesson, getLessons
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getCourses);
router.get('/my-courses', protect, authorize('teacher', 'admin'), getMyCourses);
router.get('/:id', getCourse);
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);
router.put('/:id/publish', protect, authorize('teacher', 'admin'), togglePublish);
router.post('/:id/lessons', protect, authorize('teacher', 'admin'), addLesson);
router.get('/:id/lessons', protect, getLessons);

module.exports = router;
