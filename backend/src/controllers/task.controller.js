const prisma = require('../utils/prisma');
const { sendSuccess, sendError } = require('../utils/response.utils');

const logActivity = async (userId, action, entityType, entityId, metadata = null) => {
  try {
    await prisma.activityLog.create({ data: { userId, action, entityType, entityId, metadata } });
  } catch (_e) {}
};

/**
 * GET /api/tasks
 * Admins see all tasks; Members see assigned or their project tasks
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, projectId, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (search) where.title = { contains: search };

    // Members only see tasks assigned to them or in their projects
    if (req.user.role === 'MEMBER') {
      where.OR = [
        { assignedToId: req.user.id },
        { project: { members: { some: { userId: req.user.id } } } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, { tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedToId } = req.body;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return sendError(res, 'Project not found.', 404);

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId: assignedToId || null,
        createdById: req.user.id,
      },
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    await logActivity(req.user.id, `Created task "${title}"`, 'TASK', task.id, { projectId });
    req.io?.emit('task:created', task);

    return sendSuccess(res, { task }, 'Task created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tasks/:id
 */
const getTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) return sendError(res, 'Task not found.', 404);

    return sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Task not found.', 404);

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedToId !== undefined && { assignedToId: assignedToId || null }),
      },
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    await logActivity(req.user.id, `Updated task "${task.title}"`, 'TASK', task.id);
    req.io?.emit('task:updated', task);

    return sendSuccess(res, { task }, 'Task updated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Task not found.', 404);

    await prisma.task.delete({ where: { id: req.params.id } });

    await logActivity(req.user.id, `Deleted task "${existing.title}"`, 'TASK', req.params.id);
    req.io?.emit('task:deleted', { id: req.params.id });

    return sendSuccess(res, {}, 'Task deleted successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tasks/:id/status
 * Members can update their own task status; Admins can update any
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Task not found.', 404);

    // Members can only update tasks assigned to them
    if (req.user.role === 'MEMBER' && existing.assignedToId !== req.user.id) {
      return sendError(res, 'You can only update status of tasks assigned to you.', 403);
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(req.user.id, `Changed task "${task.title}" status to ${status}`, 'TASK', task.id);
    req.io?.emit('task:statusUpdated', task);

    return sendSuccess(res, { task }, 'Task status updated.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tasks/:id/comments
 */
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return sendError(res, 'Comment content is required.', 422);

    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return sendError(res, 'Task not found.', 404);

    const comment = await prisma.comment.create({
      data: { content, taskId: req.params.id, userId: req.user.id },
      include: { user: { select: { id: true, name: true } } },
    });

    req.io?.emit('comment:added', { taskId: req.params.id, comment });

    return sendSuccess(res, { comment }, 'Comment added.', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
};
