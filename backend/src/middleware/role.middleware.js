const { sendError } = require('../utils/response.utils');

/**
 * Middleware factory: Restrict access to specific roles
 * Usage: authorize('ADMIN') or authorize('ADMIN', 'MEMBER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. This action requires one of: ${roles.join(', ')}`,
        403
      );
    }
    next();
  };
};

module.exports = { authorize };
