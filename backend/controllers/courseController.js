const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = { isPublished: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('lessons');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Teacher/Admin
const createCourse = async (req, res) => {
  try {
    const { title, description, category, duration, level, price, requirements, whatYouWillLearn, thumbnail } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      duration,
      level,
      price: price || 0,
      requirements: requirements || [],
      whatYouWillLearn: whatYouWillLearn || [],
      thumbnail: thumbnail || '',
      instructor: req.user._id
    });

    res.status(201).json({ success: true, message: 'Course created successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Teacher (own) / Admin
const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Only instructor or admin can update
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Course updated', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    await Course.findByIdAndDelete(req.params.id);
    await Lesson.deleteMany({ course: req.params.id });

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Publish/Unpublish course
// @route   PUT /api/courses/:id/publish
// @access  Teacher/Admin
const togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({ success: true, message: `Course ${course.isPublished ? 'published' : 'unpublished'}`, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get teacher's own courses
// @route   GET /api/courses/my-courses
// @access  Teacher
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add lesson to course
// @route   POST /api/courses/:id/lessons
// @access  Teacher
const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const { title, content, videoUrl, duration, order } = req.body;
    const lesson = await Lesson.create({
      course: req.params.id,
      title, content, videoUrl,
      duration: duration || '10 mins',
      order: order || (course.lessons.length + 1)
    });

    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({ success: true, message: 'Lesson added', lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get lessons for a course
// @route   GET /api/courses/:id/lessons
// @access  Auth (enrolled student or teacher/admin)
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.id }).sort({ order: 1 });
    res.json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCourses, getCourse, createCourse, updateCourse,
  deleteCourse, togglePublish, getMyCourses, addLesson, getLessons
};
