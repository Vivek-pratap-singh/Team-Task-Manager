const express = require('express');
const router = express.Router();
const {
  getTasks, createTask, getTask, updateTask,
  deleteTask, updateTaskStatus, addComment,
} = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  createTaskValidation, updateTaskValidation, updateStatusValidation,
} = require('../validations/task.validation');

router.use(authenticate);

router.get('/', getTasks);
router.post('/', authorize('ADMIN'), createTaskValidation, createTask);
router.get('/:id', getTask);
router.put('/:id', authorize('ADMIN'), updateTaskValidation, updateTask);
router.delete('/:id', authorize('ADMIN'), deleteTask);
router.patch('/:id/status', updateStatusValidation, updateTaskStatus); // Both roles
router.post('/:id/comments', addComment); // Both roles

module.exports = router;
