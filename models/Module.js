const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a module title'],
    trim: true
  },
  description: {
    type: String
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  contentType: {
    type: String,
    enum: ['video', 'article', 'quiz', 'assignment', 'mixed'],
    default: 'mixed'
  },
  // YouTube integration
  videoUrl: {
    type: String,
    match: [
      /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
      'Please add a valid YouTube URL'
    ]
  },
  videoId: String,
  videoDuration: Number, // in seconds
  // Telegram integration for files
  telegramFileId: String,
  telegramMessageId: String,
  // PDF/Notes
  pdfUrl: String,
  notes: String,
  isLocked: {
    type: Boolean,
    default: false
  },
  unlockCriteria: {
    type: String,
    enum: ['previous_completed', 'manual', 'date', 'none'],
    default: 'previous_completed'
  },
  unlockDate: Date,
  requiredMinScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tasks: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Task'
  }],
  quizzes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Module', ModuleSchema);