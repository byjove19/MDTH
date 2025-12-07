const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const { calculateProgress } = require('../utils/progressCalculator');

// @desc    Get user dashboard
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const user = req.user;

    // Get enrolled courses with progress
    const progress = await Progress.find({ user: user._id })
      .populate('course')
      .sort('-lastActivity');

    const coursesWithProgress = await Promise.all(
      progress.map(async (p) => {
        const progressData = await calculateProgress(user._id, p.course._id);
        return {
          ...p.course.toObject(),
          progress: progressData
        };
      })
    );

    // Get recent notifications
    const notifications = await Notification.find({ user: user._id })
      .sort('-createdAt')
      .limit(10);

    // Get upcoming deadlines
    const upcomingTasks = []; // Implement task deadline query

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        courses: coursesWithProgress,
        notifications,
        upcomingTasks,
        stats: {
          enrolledCourses: progress.length,
          completedCourses: progress.filter(p => p.certificateIssued).length,
          activeCourses: progress.filter(p => p.overallProgress < 100).length
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get user progress for all courses
// @route   GET /api/users/progress
// @access  Private
exports.getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ user: req.user.id })
      .populate('course', 'title thumbnail category')
      .sort('-lastActivity');

    const progressWithDetails = await Promise.all(
      progress.map(async (p) => {
        const details = await calculateProgress(req.user.id, p.course._id);
        return {
          ...p.toObject(),
          ...details
        };
      })
    );

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progressWithDetails
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt');

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get user certificates
// @route   GET /api/users/certificates
// @access  Private
exports.getCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('course', 'title thumbnail description')
      .sort('-issuedAt');

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};