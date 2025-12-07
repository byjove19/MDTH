const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  module: {
    type: mongoose.Schema.ObjectId,
    ref: 'Module',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add task description']
  },
  instructions: String,
  maxScore: {
    type: Number,
    required: true,
    default: 100
  },
  deadline: {
    type: Date,
    required: true
  },
  allowedFormats: [String],
  maxFileSize: {
    type: Number, // in MB
    default: 10
  },
  submissions: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Submission'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', TaskSchema);