const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  duration: {
    type: String,
    default: '10 mins'
  },
  isPreview: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
