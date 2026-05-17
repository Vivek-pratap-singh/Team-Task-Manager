const express = require('express');
const router = express.Router();
const {
  getProjects, createProject, getProject, updateProject,
  deleteProject, addMember, removeMember, getAllUsers,
} = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  createProjectValidation, updateProjectValidation, addMemberValidation,
} = require('../validations/project.validation');

// All routes require authentication
router.use(authenticate);

router.get('/users', getAllUsers);                          // GET all users for assignment
router.get('/', getProjects);                              // GET all projects
router.post('/', authorize('ADMIN'), createProjectValidation, createProject);  // POST create
router.get('/:id', getProject);                            // GET single project
router.put('/:id', authorize('ADMIN'), updateProjectValidation, updateProject); // PUT update
router.delete('/:id', authorize('ADMIN'), deleteProject);  // DELETE project
router.post('/:id/members', authorize('ADMIN'), addMemberValidation, addMember);   // ADD member
router.delete('/:id/members/:userId', authorize('ADMIN'), removeMember); // REMOVE member

module.exports = router;
