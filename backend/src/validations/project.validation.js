const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response.utils');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }
  next();
};

const createProjectValidation = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('description').optional().trim(),
  validate,
];

const updateProjectValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  validate,
];

const addMemberValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  validate,
];

module.exports = { createProjectValidation, updateProjectValidation, addMemberValidation };
