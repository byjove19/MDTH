const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Task = require('../models/Task');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('enrolledCourses.course');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get all courses (admin view)
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name email')
      .populate('modules')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get course progress for all users
// @route   GET /api/admin/courses/:id/progress
// @access  Private/Admin
exports.getCourseProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ course: req.params.id })
      .populate('user', 'name email')
      .populate('course');

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalModules,
      totalTasks,
      totalQuizzes,
      activeUsers,
      totalProgress,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Module.countDocuments(),
      Task.countDocuments(),
      Quiz.countDocuments(),
      User.countDocuments({ isActive: true }),
      Progress.countDocuments(),
      User.find().sort('-createdAt').limit(5).select('name email role createdAt')
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalModules,
        totalTasks,
        totalQuizzes,
        activeUsers,
        totalProgress,
        recentUsers
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Send announcement to all users
// @route   POST /api/admin/announcement
// @access  Private/Admin
exports.sendAnnouncement = async (req, res, next) => {
  try {
    const { title, message } = req.body;

    const users = await User.find({ isActive: true });

    const notifications = users.map(user => ({
      user: user._id,
      type: 'announcement',
      title,
      message,
      data: {}
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: `Announcement sent to ${users.length} users`
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};