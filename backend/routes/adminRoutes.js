const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser, getAnalytics, toggleCourse } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);
router.put('/courses/:id/toggle', toggleCourse);

module.exports = router;
