const { sendError } = require('../utils/response.utils');

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, _next) => {
  // Print the exact backend error details for debugging signup failures
  console.error('❌ Error message:', err?.message);
  console.error('❌ Error code:', err?.code);
  console.error('❌ Error statusCode:', err?.statusCode);
  console.error('❌ Error stack:', err?.stack);
  console.error('❌ Full error object:', err);


  // Prisma known errors
  if (err.code === 'P2002') {
    return sendError(res, 'A record with this value already exists.', 409);
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found.', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
