const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Student
const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check already enrolled
    const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId
    });

    // Update course student count
    await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });

    res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my enrollments
// @route   GET /api/enrollments/my
// @access  Student
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' }
      })
      .sort({ enrolledAt: -1 });

    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if enrolled
// @route   GET /api/enrollments/check/:courseId
// @access  Auth
const checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    });
    res.json({ success: true, isEnrolled: !!enrollment, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get enrollments for a course (teacher)
// @route   GET /api/enrollments/course/:courseId
// @access  Teacher/Admin
const getCourseEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email avatar')
      .sort({ enrolledAt: -1 });

    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { enrollCourse, getMyEnrollments, checkEnrollment, getCourseEnrollments };
