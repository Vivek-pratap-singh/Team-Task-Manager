import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO, isPast } from 'date-fns'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Users, Plus, Trash2, Pencil, UserPlus,
  UserMinus, LayoutGrid, List
} from 'lucide-react'
import { projectApi } from '../api/project.api'
import { taskApi } from '../api/task.api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import KanbanBoard from '../components/KanbanBoard'

function TaskForm({ initial, projectId, members, onSubmit, loading, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      title: '',
      description: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: '',
      assignedToId: '',
      projectId,
    }
  )

  const f = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="label">Task title *</label>
        <input className="input" placeholder="e.g. Design landing page" value={form.title} onChange={(e) => f('title', e.target.value)} required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input min-h-[80px] resize-none" placeholder="Task details..." value={form.description} onChange={(e) => f('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => f('status', e.target.value)}>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={(e) => f('priority', e.target.value)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Due date</label>
          <input type="date" className="input" value={form.dueDate ? form.dueDate.split('T')[0] : ''} onChange={(e) => f('dueDate', e.target.value)} />
        </div>
        <div>
          <label className="label">Assign to</label>
          <select className="input" value={form.assignedToId} onChange={(e) => f('assignedToId', e.target.value)}>
            <option value="">Unassigned</option>
            {members?.map((m) => (
              <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Save Changes' : 'Create Task'}</Button>
      </div>
    </form>
  )
}

function AddMemberForm({ allUsers, currentMembers, onAdd, loading, onCancel }) {
  const [userId, setUserId] = useState('')
  const memberIds = new Set(currentMembers?.map((m) => m.userId))
  const eligible = allUsers?.filter((u) => !memberIds.has(u.id))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onAdd(userId) }} className="space-y-4">
      <div>
        <label className="label">Select user</label>
        <select className="input" value={userId} onChange={(e) => setUserId(e.target.value)} required>
          <option value="">-- Choose a user --</option>
          {eligible?.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email}) — {u.role}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading} disabled={!userId}>Add Member</Button>
      </div>
    </form>
  )
}

export default function ProjectDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'

  const [project, setProject] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchProject = useCallback(async () => {
    try {
      const [pRes, uRes] = await Promise.all([projectApi.getById(id), projectApi.getAllUsers()])
      setProject(pRes.data.data.project)
      setAllUsers(uRes.data.data.users)
    } catch {
      toast.error('Failed to load project')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchProject() }, [fetchProject])

  const handleCreateTask = async (data) => {
    setSubmitting(true)
    try {
      await taskApi.create({ ...data, projectId: id })
      await fetchProject()
      setShowTaskModal(false)
      toast.success('Task created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateTask = async (data) => {
    setSubmitting(true)
    try {
      await taskApi.update(editTask.id, data)
      await fetchProject()
      setEditTask(null)
      toast.success('Task updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return
    try {
      await taskApi.delete(task.id)
      setProject((p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== task.id) }))
      toast.success('Task deleted.')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskApi.updateStatus(taskId, status)
      setProject((p) => ({
        ...p,
        tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      }))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleAddMember = async (userId) => {
    setSubmitting(true)
    try {
      await projectApi.addMember(id, userId)
      await fetchProject()
      setShowMemberModal(false)
      toast.success('Member added!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) return
    try {
      await projectApi.removeMember(id, memberId)
      setProject((p) => ({ ...p, members: p.members.filter((m) => m.userId !== memberId) }))
      toast.success('Member removed.')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!project) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <button onClick={() => navigate('/projects')} className="btn-ghost btn-sm mb-4 -ml-1">
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[color:var(--text-main)]">{project.title}</h2>
            {project.description && (
              <p className="text-[color:var(--text-muted)] mt-1 text-sm">{project.description}</p>
            )}
            <p className="text-xs text-[color:var(--text-muted)] mt-1">Created by {project.createdBy?.name}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowMemberModal(true)}>
                <UserPlus size={15} /> Add Member
              </Button>
              <Button size="sm" onClick={() => setShowTaskModal(true)}>
                <Plus size={15} /> New Task
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-brand-500" />
          <h3 className="font-semibold text-[color:var(--text-main)]">Team Members</h3>
          <span className="ml-auto text-xs text-[color:var(--text-muted)]">{project.members?.length}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {project.members?.map((m) => (
            <div key={m.id} className="flex items-center gap-2 bg-white/28 dark:bg-white/5 backdrop-blur-md rounded-2xl px-3 py-2">
              <div className="w-7 h-7 rounded-2xl bg-gradient-to-br from-brand-300 via-brand-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {m.user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-medium text-[color:var(--text-main)]">{m.user?.name}</p>
                <p className="text-xs text-[color:var(--text-muted)]">{m.user?.role}</p>
              </div>
              {isAdmin && m.userId !== project.createdById && (
                <button
                  onClick={() => handleRemoveMember(m.userId)}
                  className="ml-1 text-[color:var(--text-muted)] hover:text-rose-500 transition-colors"
                >
                  <UserMinus size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[color:var(--text-main)]">
            Tasks <span className="text-[color:var(--text-muted)] font-normal text-sm">({project.tasks?.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-2xl transition-colors ${view === 'list' ? 'bg-brand-100/80 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded-2xl transition-colors ${view === 'kanban' ? 'bg-brand-100/80 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {view === 'kanban' ? (
          <KanbanBoard
            tasks={project.tasks || []}
            isAdmin={isAdmin}
            onStatusChange={handleStatusChange}
            onEdit={setEditTask}
            onDelete={handleDeleteTask}
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {project.tasks?.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-[color:var(--text-muted)]">No tasks yet.</td></tr>
                )}
                {project.tasks?.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <p className="font-medium text-[color:var(--text-main)]">{task.title}</p>
                      {task.description && <p className="text-xs text-[color:var(--text-muted)] mt-0.5 max-w-xs truncate">{task.description}</p>}
                    </td>
                    <td>
                      {isAdmin ? (
                        <select
                          className="input text-xs py-1 px-2 w-auto"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      ) : (
                        <StatusBadge status={task.status} />
                      )}
                    </td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td>
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-2xl bg-gradient-to-br from-brand-300 via-brand-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {task.assignedTo.name.charAt(0)}
                          </div>
                          <span className="text-sm text-[color:var(--text-main)]">{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-[color:var(--text-muted)] text-xs">Unassigned</span>
                      )}
                    </td>
                    <td>
                      {task.dueDate ? (
                        <span className={`text-xs ${isPast(parseISO(task.dueDate)) && task.status !== 'COMPLETED' ? 'text-rose-500 font-medium' : 'text-[color:var(--text-muted)]'}`}>
                          {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      ) : <span className="text-[color:var(--text-muted)] text-xs">—</span>}
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => setEditTask(task)} className="btn-ghost p-1.5 rounded-full text-[color:var(--text-muted)] hover:text-brand-600">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDeleteTask(task)} className="btn-ghost p-1.5 rounded-full text-[color:var(--text-muted)] hover:text-rose-500">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <TaskForm projectId={id} members={project.members} onSubmit={handleCreateTask} loading={submitting} onCancel={() => setShowTaskModal(false)} />
      </Modal>
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        <TaskForm initial={editTask} projectId={id} members={project.members} onSubmit={handleUpdateTask} loading={submitting} onCancel={() => setEditTask(null)} />
      </Modal>
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Team Member">
        <AddMemberForm allUsers={allUsers} currentMembers={project.members} onAdd={handleAddMember} loading={submitting} onCancel={() => setShowMemberModal(false)} />
      </Modal>
    </div>
  )
}
