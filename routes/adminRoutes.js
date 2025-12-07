const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getCourses,
  getCourseProgress,
  getStats,
  sendAnnouncement
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Course management
router.get('/courses', getCourses);
router.get('/courses/:id/progress', getCourseProgress);

// Statistics
router.get('/stats', getStats);

// Announcements
router.post('/announcement', sendAnnouncement);

module.exports = router;