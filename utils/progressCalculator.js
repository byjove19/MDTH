const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Module = require('../models/Module');

exports.calculateProgress = async (userId, courseId) => {
  try {
    const course = await Course.findById(courseId).populate('modules');
    const totalModules = course.modules.length;
    
    let progress = await Progress.findOne({
      user: userId,
      course: courseId
    });
    
    if (!progress) {
      progress = new Progress({
        user: userId,
        course: courseId,
        totalModules: totalModules
      });
    }
    
    // Calculate completed modules
    const completedModules = progress.modules.filter(m => m.completed).length;
    
    // Calculate task progress
    const submittedTasks = progress.tasks.filter(t => t.submitted).length;
    const gradedTasks = progress.tasks.filter(t => t.graded).length;
    
    // Calculate quiz progress
    const attemptedQuizzes = progress.quizzes.filter(q => q.attempts > 0).length;
    
    // Calculate average quiz score
    const quizScores = progress.quizzes
      .filter(q => q.bestScore)
      .map(q => q.bestScore);
    const averageQuizScore = quizScores.length > 0 
      ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length 
      : 0;
    
    // Calculate overall progress (weighted average)
    const moduleWeight = 0.4;
    const taskWeight = 0.3;
    const quizWeight = 0.3;
    
    const moduleProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    const taskProgress = progress.totalTasks > 0 ? (submittedTasks / progress.totalTasks) * 100 : 0;
    const quizProgress = progress.totalQuizzes > 0 ? (attemptedQuizzes / progress.totalQuizzes) * 100 : 0;
    
    const overallProgress = Math.round(
      (moduleProgress * moduleWeight) +
      (taskProgress * taskWeight) +
      (quizProgress * quizWeight)
    );
    
    // Update progress
    progress.completedModules = completedModules;
    progress.submittedTasks = submittedTasks;
    progress.gradedTasks = gradedTasks;
    progress.attemptedQuizzes = attemptedQuizzes;
    progress.averageQuizScore = Math.round(averageQuizScore);
    progress.overallProgress = overallProgress;
    progress.lastActivity = new Date();
    
    await progress.save();
    
    return {
      overallProgress,
      completedModules,
      totalModules,
      submittedTasks: progress.submittedTasks,
      totalTasks: progress.totalTasks,
      gradedTasks: progress.gradedTasks,
      attemptedQuizzes,
      totalQuizzes: progress.totalQuizzes,
      averageQuizScore: progress.averageQuizScore
    };
  } catch (error) {
    console.error('Progress calculation error:', error);
    throw error;
  }
};

exports.updateVideoProgress = async (userId, moduleId, progressPercent) => {
  const module = await Module.findById(moduleId);
  const progress = await Progress.findOne({
    user: userId,
    course: module.course
  });
  
  if (progress) {
    const moduleProgress = progress.modules.find(m => m.module.toString() === moduleId);
    
    if (moduleProgress) {
      moduleProgress.videoProgress = progressPercent;
      moduleProgress.lastWatchedAt = new Date();
      
      // Mark as watched if progress > 90%
      if (progressPercent >= 90 && !moduleProgress.videoWatched) {
        moduleProgress.videoWatched = true;
      }
      
      await progress.save();
    }
  }
};

exports.markModuleCompleted = async (userId, moduleId) => {
  const module = await Module.findById(moduleId);
  const progress = await Progress.findOne({
    user: userId,
    course: module.course
  });
  
  if (progress) {
    const moduleProgress = progress.modules.find(m => m.module.toString() === moduleId);
    
    if (moduleProgress && !moduleProgress.completed) {
      moduleProgress.completed = true;
      moduleProgress.completedAt = new Date();
      await progress.save();
      
      // Calculate overall progress
      await this.calculateProgress(userId, module.course);
    }
  }
};