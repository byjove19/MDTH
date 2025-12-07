const express = require('express');
const {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  updateVideoProgress,
  completeModule
} = require('../controllers/moduleController');
const { protect } = require('../middleware/auth');
const { isInstructor } = require('../middleware/admin');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getModules)
  .post(protect, isInstructor, createModule);

router.route('/:id')
  .get(protect, getModule)
  .put(protect, isInstructor, updateModule)
  .delete(protect, isInstructor, deleteModule);

router.put('/:id/video-progress', protect, updateVideoProgress);
router.put('/:id/complete', protect, completeModule);

// Task routes
router.use('/:moduleId/tasks', require('./taskRoutes'));

// Quiz routes
router.use('/:moduleId/quizzes', require('./quizRoutes'));

module.exports = router;