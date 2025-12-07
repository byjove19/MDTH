const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

// @desc    Get all quizzes for a module
// @route   GET /api/modules/:moduleId/quizzes
// @access  Private
exports.getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ module: req.params.moduleId });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('module');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Don't send correct answers for quiz taking
    const quizObj = quiz.toObject();
    if (!req.query.withAnswers) {
      quizObj.questions = quizObj.questions.map(question => {
        if (question.questionType === 'multiple_choice') {
          question.options = question.options.map(option => ({
            text: option.text,
            _id: option._id
          }));
        }
        return question;
      });
    }

    res.status(200).json({
      success: true,
      data: quizObj
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create quiz
// @route   POST /api/modules/:moduleId/quizzes
// @access  Private (Instructor/Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    req.body.module = req.params.moduleId;

    const module = await Module.findById(req.params.moduleId).populate('course');
    
    // Check if user is course instructor or admin
    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create quizzes for this module'
      });
    }

    const quiz = await Quiz.create(req.body);

    // Add quiz to module
    module.quizzes.push(quiz._id);
    await module.save();

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor/Admin)
exports.updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id).populate('module');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    const module = await Module.findById(quiz.module._id).populate('course');
    
    // Check if user is course instructor or admin
    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this quiz'
      });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Instructor/Admin)
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    const module = await Module.findById(quiz.module);
    
    // Check if user is course instructor or admin
    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this quiz'
      });
    }

    // Remove quiz from module
    const index = module.quizzes.indexOf(quiz._id);
    if (index > -1) {
      module.quizzes.splice(index, 1);
      await module.save();
    }

    await quiz.deleteOne();

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

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/attempt
// @access  Private
exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findById(req.params.id).populate('module');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Check max attempts
    const progress = await Progress.findOne({
      user: req.user.id,
      course: quiz.module.course
    });

    const quizProgress = progress ? progress.quizzes.find(q => q.quiz.toString() === quiz._id.toString()) : null;
    
    if (quizProgress && quizProgress.attempts >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        error: 'Maximum attempts reached'
      });
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach(question => {
      totalPoints += question.points;
      
      const userAnswer = answers.find(a => a.questionId === question._id.toString());
      
      if (userAnswer) {
        if (question.questionType === 'multiple_choice') {
          const selectedOption = question.options.find(opt => opt._id.toString() === userAnswer.answer);
          if (selectedOption && selectedOption.isCorrect) {
            score += question.points;
          }
        } else if (question.questionType === 'true_false') {
          if (userAnswer.answer === question.correctAnswer) {
            score += question.points;
          }
        } else if (question.questionType === 'short_answer') {
          if (userAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
            score += question.points;
          }
        }
      }
    });

    const percentageScore = Math.round((score / totalPoints) * 100);
    const passed = percentageScore >= quiz.passingScore;

    // Update progress
    if (progress) {
      const quizIndex = progress.quizzes.findIndex(q => q.quiz.toString() === quiz._id.toString());
      
      if (quizIndex > -1) {
        progress.quizzes[quizIndex].attempts += 1;
        if (percentageScore > (progress.quizzes[quizIndex].bestScore || 0)) {
          progress.quizzes[quizIndex].bestScore = percentageScore;
        }
        progress.quizzes[quizIndex].lastAttemptAt = new Date();
      } else {
        progress.quizzes.push({
          quiz: quiz._id,
          attempts: 1,
          bestScore: percentageScore,
          lastAttemptAt: new Date()
        });
      }
      
      await progress.save();
    }

    // Create notification if passed
    if (passed) {
      await Notification.create({
        user: req.user.id,
        type: 'quiz_result',
        title: 'Quiz Completed',
        message: `You passed the quiz "${quiz.title}" with a score of ${percentageScore}%`,
        data: {
          quizId: quiz._id,
          courseId: quiz.module.course,
          score: percentageScore
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        score: percentageScore,
        passed,
        totalQuestions: quiz.questions.length,
        correctAnswers: score,
        totalPoints,
        passedScore: quiz.passingScore
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};