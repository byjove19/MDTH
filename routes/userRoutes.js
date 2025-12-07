const express = require('express');
const {
  getDashboard,
  getProgress,
  getNotifications,
  markNotificationAsRead,
  getCertificates
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/progress', getProgress);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);
router.get('/certificates', getCertificates);

module.exports = router;