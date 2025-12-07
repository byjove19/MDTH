const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['task_graded', 'new_module', 'deadline_reminder', 'quiz_result', 'certificate', 'announcement'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    courseId: mongoose.Schema.ObjectId,
    moduleId: mongoose.Schema.ObjectId,
    taskId: mongoose.Schema.ObjectId,
    quizId: mongoose.Schema.ObjectId,
    score: Number,
    link: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);