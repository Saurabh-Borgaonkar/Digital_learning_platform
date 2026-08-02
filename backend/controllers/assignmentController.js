const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Teacher
const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate, maxMarks } = req.body;
    const assignment = await Assignment.create({
      course: courseId,
      createdBy: req.user._id,
      title, description, dueDate,
      maxMarks: maxMarks || 100
    });
    res.status(201).json({ success: true, message: 'Assignment created', assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Auth
const getCourseAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      course: req.params.courseId,
      isActive: true
    }).sort({ dueDate: 1 });
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Auth
const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title')
      .populate('createdBy', 'name');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Teacher
const deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Student
const submitAssignment = async (req, res) => {
  try {
    const { content } = req.body;
    const existing = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already submitted' });
    }
    const submission = await Submission.create({
      assignment: req.params.id,
      student: req.user._id,
      content
    });
    res.status(201).json({ success: true, message: 'Assignment submitted', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Grade submission
// @route   PUT /api/assignments/submissions/:id/grade
// @access  Teacher
const gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { grade, feedback, isGraded: true },
      { new: true }
    ).populate('student', 'name email').populate('assignment', 'title maxMarks');

    res.json({ success: true, message: 'Graded successfully', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my submissions
// @route   GET /api/assignments/my-submissions
// @access  Student
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title maxMarks dueDate')
      .sort({ submittedAt: -1 });
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get submissions for an assignment (teacher)
// @route   GET /api/assignments/:id/submissions
// @access  Teacher
const getAssignmentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email avatar')
      .sort({ submittedAt: -1 });
    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAssignment, getCourseAssignments, getAssignment, deleteAssignment,
  submitAssignment, gradeSubmission, getMySubmissions, getAssignmentSubmissions
};
