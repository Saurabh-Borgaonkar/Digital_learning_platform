const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const Certificate = require('../models/Certificate');

// @desc    Get progress for a course
// @route   GET /api/progress/:courseId
// @access  Student
const getProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    }).populate('completedLessons', 'title order');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' });
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark lesson as complete
// @route   PUT /api/progress/:courseId/lesson/:lessonId
// @access  Student
const markLessonComplete = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled' });
    }

    // Add lesson if not already completed
    if (!enrollment.completedLessons.includes(req.params.lessonId)) {
      enrollment.completedLessons.push(req.params.lessonId);
    }

    // Recalculate progress
    const totalLessons = await Lesson.countDocuments({ course: req.params.courseId });
    enrollment.progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    // Check if course is completed
    if (enrollment.progress === 100 && !enrollment.isCompleted) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();

      // Auto-generate certificate
      const certId = `CERT-${Date.now()}-${req.user._id.toString().slice(-4).toUpperCase()}`;
      await Certificate.create({
        student: req.user._id,
        course: req.params.courseId,
        certificateId: certId
      }).catch(() => {}); // ignore duplicate cert error
    }

    await enrollment.save();

    res.json({
      success: true,
      message: 'Progress updated',
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProgress, markLessonComplete };
