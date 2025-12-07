const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getCourseProgress
} = require('../controllers/courseController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.route('/')
  .get(getCourses);

router.route('/:id')
  .get(getCourse);

// Protected routes
router.route('/')
  .post(protect, authorize('instructor', 'admin'), createCourse);

router.route('/:id')
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

// Enrollment routes
router.route('/:id/enroll')
  .post(protect, enrollInCourse);

router.route('/:id/progress')
  .get(protect, getCourseProgress);

module.exports = router;