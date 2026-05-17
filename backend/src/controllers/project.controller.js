const prisma = require('../utils/prisma');
const { sendSuccess, sendError } = require('../utils/response.utils');

/**
 * Log an activity event
 */
const logActivity = async (userId, action, entityType, entityId, metadata = null) => {
  try {
    await prisma.activityLog.create({
      data: { userId, action, entityType, entityId, metadata },
    });
  } catch (_e) {
    // Non-critical — don't throw
  }
};

/**
 * GET /api/projects
 * Admins see all projects; Members see only projects they belong to
 */
const getProjects = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where =
      req.user.role === 'ADMIN'
        ? search ? { title: { contains: search } } : {}
        : {
            OR: [
              { createdById: req.user.id },
              { members: { some: { userId: req.user.id } } },
            ],
            ...(search && { title: { contains: search } }),
          };

    const projects = await prisma.project.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, { projects });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        createdById: req.user.id,
        // Auto-add creator as a member
        members: { create: { userId: req.user.id } },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    await logActivity(req.user.id, `Created project "${title}"`, 'PROJECT', project.id);
    req.io?.emit('project:created', project);

    return sendSuccess(res, { project }, 'Project created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id
 */
const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) return sendError(res, 'Project not found.', 404);

    // Members can only see their own projects
    if (req.user.role === 'MEMBER') {
      const isMember = project.members.some((m) => m.userId === req.user.id);
      if (!isMember) return sendError(res, 'Access denied.', 403);
    }

    return sendSuccess(res, { project });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Project not found.', 404);

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { title, description },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    await logActivity(req.user.id, `Updated project "${project.title}"`, 'PROJECT', project.id);
    req.io?.emit('project:updated', project);

    return sendSuccess(res, { project }, 'Project updated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res, next) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Project not found.', 404);

    await prisma.project.delete({ where: { id: req.params.id } });

    await logActivity(req.user.id, `Deleted project "${existing.title}"`, 'PROJECT', req.params.id);
    req.io?.emit('project:deleted', { id: req.params.id });

    return sendSuccess(res, {}, 'Project deleted successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/projects/:id/members
 * Add a member to a project
 */
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const projectId = req.params.id;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return sendError(res, 'Project not found.', 404);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return sendError(res, 'User not found.', 404);

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (existing) return sendError(res, 'User is already a member of this project.', 409);

    const member = await prisma.projectMember.create({
      data: { userId, projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    await logActivity(req.user.id, `Added ${user.name} to project "${project.title}"`, 'PROJECT', projectId);

    return sendSuccess(res, { member }, 'Member added successfully.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id/members/:userId
 * Remove a member from a project
 */
const removeMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;

    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!member) return sendError(res, 'Member not found in this project.', 404);

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });

    return sendSuccess(res, {}, 'Member removed successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/users - list all users (for member assignment)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, { users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getAllUsers,
};
