const prisma = require('../utils/prisma');
const { sendSuccess } = require('../utils/response.utils');

/**
 * GET /api/dashboard
 * Returns aggregate stats — scope depends on user role
 */
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const isAdmin = req.user.role === 'ADMIN';

    // ── Project filter ─────────────────────────────────────────────────────────
    const projectWhere = isAdmin
      ? {}
      : {
          OR: [
            { createdById: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        };

    // ── Task filter ────────────────────────────────────────────────────────────
    const taskWhere = isAdmin
      ? {}
      : {
          OR: [
            { assignedToId: req.user.id },
            { project: { members: { some: { userId: req.user.id } } } },
          ],
        };

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      recentTasks,
      recentActivity,
    ] = await Promise.all([
      prisma.project.count({ where: projectWhere }),
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'PENDING' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } }),
      prisma.task.count({
        where: {
          ...taskWhere,
          status: { not: 'COMPLETED' },
          dueDate: { lt: now },
        },
      }),
      prisma.task.findMany({
        where: taskWhere,
        include: {
          project: { select: { id: true, title: true } },
          assignedTo: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.activityLog.findMany({
        where: isAdmin ? {} : { userId: req.user.id },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return sendSuccess(res, {
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
      },
      recentTasks,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
