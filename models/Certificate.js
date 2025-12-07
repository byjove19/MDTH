const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
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
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  downloadUrl: String,
  verificationCode: {
    type: String,
    unique: true
  },
  metadata: {
    completionDate: Date,
    finalScore: Number,
    instructorName: String,
    courseDuration: Number
  }
});

module.exports = mongoose.model('Certificate', CertificateSchema);