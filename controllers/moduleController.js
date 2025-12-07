const Module = require('../models/Module');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { markModuleCompleted, updateVideoProgress } = require('../utils/progressCalculator');

// @desc    Get all modules for a course
// @route   GET /api/courses/:courseId/modules
// @access  Private
exports.getModules = async (req, res, next) => {
  try {
    const modules = await Module.find({ course: req.params.courseId })
      .populate('tasks')
      .populate('quizzes')
      .sort('order');

    // Check user progress for each module
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    const modulesWithProgress = modules.map(module => {
      const moduleObj = module.toObject();
      if (progress) {
        const moduleProgress = progress.modules.find(
          m => m.module.toString() === module._id.toString()
        );
        if (moduleProgress) {
          moduleObj.progress = moduleProgress;
        }
      }
      return moduleObj;
    });

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modulesWithProgress
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single module
// @route   GET /api/modules/:id
// @access  Private
exports.getModule = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('tasks')
      .populate('quizzes')
      .populate('course');

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(module.course._id);
    const user = await User.findById(req.user.id);
    
    const isEnrolled = user.enrolledCourses.some(
      enrolled => enrolled.course.toString() === course._id.toString()
    );

    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not enrolled in this course'
      });
    }

    // Get user progress for this module
    const progress = await Progress.findOne({
      user: req.user.id,
      course: module.course._id
    });

    const moduleObj = module.toObject();
    
    if (progress) {
      const moduleProgress = progress.modules.find(
        m => m.module.toString() === module._id.toString()
      );
      if (moduleProgress) {
        moduleObj.userProgress = moduleProgress;
      }
    }

    res.status(200).json({
      success: true,
      data: moduleObj
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create module
// @route   POST /api/courses/:courseId/modules
// @access  Private (Instructor/Admin)
exports.createModule = async (req, res, next) => {
  try {
    req.body.course = req.params.courseId;

    // Check if user is course instructor or admin
    const course = await Course.findById(req.params.courseId);
    
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add modules to this course'
      });
    }

    // Set order if not provided
    if (!req.body.order) {
      const lastModule = await Module.findOne({ course: req.params.courseId })
        .sort('-order');
      req.body.order = lastModule ? lastModule.order + 1 : 1;
    }

    const module = await Module.create(req.body);

    // Add module to course
    course.modules.push(module._id);
    await course.save();

    res.status(201).json({
      success: true,
      data: module
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private (Instructor/Admin)
exports.updateModule = async (req, res, next) => {
  try {
    let module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Check if user is course instructor or admin
    const course = await Course.findById(module.course);
    
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this module'
      });
    }

    module = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: module
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private (Instructor/Admin)
exports.deleteModule = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Check if user is course instructor or admin
    const course = await Course.findById(module.course);
    
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this module'
      });
    }

    // Remove module from course
    const index = course.modules.indexOf(module._id);
    if (index > -1) {
      course.modules.splice(index, 1);
      await course.save();
    }

    await module.deleteOne();

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

// @desc    Update video progress
// @route   PUT /api/modules/:id/video-progress
// @access  Private
exports.updateVideoProgress = async (req, res, next) => {
  try {
    const { progressPercent } = req.body;

    await updateVideoProgress(req.user.id, req.params.id, progressPercent);

    res.status(200).json({
      success: true,
      message: 'Video progress updated'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Mark module as completed
// @route   PUT /api/modules/:id/complete
// @access  Private
exports.completeModule = async (req, res, next) => {
  try {
    await markModuleCompleted(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Module marked as completed'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};