const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  submitTask,
  gradeSubmission
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { isInstructor } = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getTasks)
  .post(protect, isInstructor, createTask);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, isInstructor, updateTask)
  .delete(protect, isInstructor, deleteTask);

router.post('/:id/submit', protect, upload.array('files', 5), submitTask);
router.put('/submissions/:id/grade', protect, isInstructor, gradeSubmission);

module.exports = router;