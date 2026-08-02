const { Quiz, QuizResult } = require('../models/Quiz');

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Teacher
const createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, questions, timeLimit, passingScore } = req.body;
    const quiz = await Quiz.create({
      course: courseId,
      createdBy: req.user._id,
      title, description, questions,
      timeLimit: timeLimit || 30,
      passingScore: passingScore || 60
    });
    res.status(201).json({ success: true, message: 'Quiz created', quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Auth
const getCourseQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId, isActive: true })
      .select('-questions.correctAnswer');
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single quiz (with answers hidden)
// @route   GET /api/quizzes/:id
// @access  Auth
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title')
      .select('-questions.correctAnswer');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Attempt quiz
// @route   POST /api/quizzes/:id/attempt
// @access  Student
const attemptQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Calculate score
    let score = 0;
    let totalMarks = 0;
    quiz.questions.forEach((q, i) => {
      totalMarks += q.marks;
      if (answers[i] === q.correctAnswer) {
        score += q.marks;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const result = await QuizResult.create({
      quiz: req.params.id,
      student: req.user._id,
      answers,
      score,
      totalMarks,
      percentage,
      passed
    });

    res.status(201).json({
      success: true,
      message: passed ? '🎉 Quiz passed!' : 'Quiz attempted',
      result: { score, totalMarks, percentage, passed }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my quiz results
// @route   GET /api/quizzes/my-results
// @access  Student
const getMyResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ student: req.user._id })
      .populate('quiz', 'title')
      .sort({ attemptedAt: -1 });
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Teacher/Admin
const deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createQuiz, getCourseQuizzes, getQuiz, attemptQuiz, getMyResults, deleteQuiz };
