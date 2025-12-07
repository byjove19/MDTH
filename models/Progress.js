const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  modules: [{
    module: {
      type: mongoose.Schema.ObjectId,
      ref: 'Module'
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    videoWatched: {
      type: Boolean,
      default: false
    },
    videoProgress: {
      type: Number, // percentage
      min: 0,
      max: 100,
      default: 0
    },
    lastWatchedAt: Date
  }],
  tasks: [{
    task: {
      type: mongoose.Schema.ObjectId,
      ref: 'Task'
    },
    submitted: Boolean,
    score: Number,
    graded: Boolean
  }],
  quizzes: [{
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz'
    },
    attempts: Number,
    bestScore: Number,
    lastAttemptAt: Date
  }],
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalModules: {
    type: Number,
    default: 0
  },
  completedModules: {
    type: Number,
    default: 0
  },
  totalTasks: {
    type: Number,
    default: 0
  },
  submittedTasks: {
    type: Number,
    default: 0
  },
  totalQuizzes: {
    type: Number,
    default: 0
  },
  attemptedQuizzes: {
    type: Number,
    default: 0
  },
  averageQuizScore: {
    type: Number,
    default: 0
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Certificate'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Progress', ProgressSchema);