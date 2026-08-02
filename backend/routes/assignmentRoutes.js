const express = require('express');
const router = express.Router();
const {
  createAssignment, getCourseAssignments, getAssignment, deleteAssignment,
  submitAssignment, gradeSubmission, getMySubmissions, getAssignmentSubmissions
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('teacher', 'admin'), createAssignment);
router.get('/my-submissions', protect, authorize('student'), getMySubmissions);
router.get('/course/:courseId', protect, getCourseAssignments);
router.get('/:id', protect, getAssignment);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAssignment);
router.post('/:id/submit', protect, authorize('student'), submitAssignment);
router.put('/submissions/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);
router.get('/:id/submissions', protect, authorize('teacher', 'admin'), getAssignmentSubmissions);

module.exports = router;
