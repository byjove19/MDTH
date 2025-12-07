const express = require('express');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { isInstructor } = require('../middleware/admin');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, isInstructor, createQuiz);

router.route('/:id')
  .get(protect, getQuiz)
  .put(protect, isInstructor, updateQuiz)
  .delete(protect, isInstructor, deleteQuiz);

router.post('/:id/attempt', protect, submitQuiz);

module.exports = router;