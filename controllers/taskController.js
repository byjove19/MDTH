const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

// @desc    Get all tasks for a module
// @route   GET /api/modules/:moduleId/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ module: req.params.moduleId });

    // Get user submissions for these tasks
    const submissions = await Submission.find({
      task: { $in: tasks.map(t => t._id) },
      student: req.user.id
    });

    const tasksWithSubmissions = tasks.map(task => {
      const taskObj = task.toObject();
      const submission = submissions.find(s => s.task.toString() === task._id.toString());
      taskObj.userSubmission = submission || null;
      return taskObj;
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasksWithSubmissions
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('module')
      .populate('submissions');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Get user submission if exists
    const userSubmission = await Submission.findOne({
      task: task._id,
      student: req.user.id
    });

    const taskObj = task.toObject();
    taskObj.userSubmission = userSubmission;

    res.status(200).json({
      success: true,
      data: taskObj
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create task
// @route   POST /api/modules/:moduleId/tasks
// @access  Private (Instructor/Admin)
exports.createTask = async (req, res, next) => {
  try {
    req.body.module = req.params.moduleId;

    const module = await Module.findById(req.params.moduleId).populate('course');
    
    // Check if user is course instructor or admin
    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create tasks for this module'
      });
    }

    const task = await Task.create(req.body);

    // Add task to module
    module.tasks.push(task._id);
    await module.save();

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Instructor/Admin)
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id).populate('module');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const module = await Module.findById(task.module._id).populate('course');
    
    // Check if user is course instructor or admin
    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Instructor/Admin)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const module = await Module.findById(task.module);
    
    // Check if user is course instructor or admin
    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this task'
      });
    }

    // Remove task from module
    const index = module.tasks.indexOf(task._id);
    if (index > -1) {
      module.tasks.splice(index, 1);
      await module.save();
    }

    await task.deleteOne();

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

// @desc    Submit task
// @route   POST /api/tasks/:id/submit
// @access  Private
exports.submitTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if deadline has passed
    if (new Date() > task.deadline) {
      return res.status(400).json({
        success: false,
        error: 'Task deadline has passed'
      });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      task: task._id,
      student: req.user.id
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        error: 'Task already submitted'
      });
    }

    const submissionData = {
      task: task._id,
      student: req.user.id,
      submissionText: req.body.submissionText,
      files: req.files ? req.files.map(file => ({
        url: file.path,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      })) : []
    };

    const submission = await Submission.create(submissionData);

    // Add submission to task
    task.submissions.push(submission._id);
    await task.save();

    // Update progress
    const progress = await Progress.findOne({
      user: req.user.id,
      course: task.module.course
    });

    if (progress) {
      const taskProgress = progress.tasks.find(t => t.task.toString() === task._id.toString());
      if (taskProgress) {
        taskProgress.submitted = true;
        await progress.save();
      }
    }

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Grade task submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Instructor/Admin)
exports.gradeSubmission = async (req, res, next) => {
  try {
    const { score, feedback } = req.body;

    let submission = await Submission.findById(req.params.id)
      .populate('task')
      .populate('student');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    const task = await Task.findById(submission.task._id).populate('module');
    const module = await Module.findById(task.module._id).populate('course');
    
    // Check if user is course instructor or admin
    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to grade this submission'
      });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();
    submission.status = 'graded';

    await submission.save();

    // Update progress
    const progress = await Progress.findOne({
      user: submission.student._id,
      course: module.course._id
    });

    if (progress) {
      const taskProgress = progress.tasks.find(t => t.task.toString() === task._id.toString());
      if (taskProgress) {
        taskProgress.score = score;
        taskProgress.graded = true;
        await progress.save();
      }
    }

    // Create notification for student
    await Notification.create({
      user: submission.student._id,
      type: 'task_graded',
      title: 'Task Graded',
      message: `Your task "${task.title}" has been graded`,
      data: {
        taskId: task._id,
        courseId: module.course._id,
        score: score,
        link: `/tasks/${task._id}`
      }
    });

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};