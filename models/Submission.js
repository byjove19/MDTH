const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: true
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    url: String,
    filename: String,
    size: Number,
    mimetype: String
  }],
  submissionText: String,
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: String,
  gradedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  gradedAt: Date,
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late', 'needs_revision'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);