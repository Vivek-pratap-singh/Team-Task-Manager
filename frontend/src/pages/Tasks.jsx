import { useEffect, useState, useCallback } from 'react'
import { format, parseISO, isPast } from 'date-fns'
import toast from 'react-hot-toast'
import { Plus, Search, Trash2, Pencil, CheckSquare } from 'lucide-react'
import { taskApi } from '../api/task.api'
import { projectApi } from '../api/project.api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'

function TaskForm({ initial, projects, onSubmit, loading, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      title: '',
      description: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: '',
      assignedToId: '',
      projectId: '',
    }
  )
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (form.projectId) {
      projectApi
        .getById(form.projectId)
        .then((res) => setMembers(res.data.data.project.members || []))
        .catch(() => setMembers([]))
    }
  }, [form.projectId])

  const f = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="label">Task title *</label>
        <input className="input" placeholder="e.g. Implement auth flow" value={form.title} onChange={(e) => f('title', e.target.value)} required />
      </div>
      <div>
        <label className="label">Project *</label>
        <select className="input" value={form.projectId} onChange={(e) => f('projectId', e.target.value)} required>
          <option value="">-- Select Project --</option>
          {projects?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input min-h-[80px] resize-none" placeholder="Details..." value={form.description} onChange={(e) => f('description', e.target.value)} />
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
            {members?.map((m) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
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

export default function Tasks() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', projectId: '' })
  const [showCreate, setShowCreate] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.projectId) params.projectId = filters.projectId

      const res = await taskApi.getAll(params)
      setTasks(res.data.data.tasks)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    projectApi.getAll().then((r) => setProjects(r.data.data.projects))
  }, [])

  useEffect(() => {
    const t = setTimeout(fetchTasks, 300)
    return () => clearTimeout(t)
  }, [fetchTasks])

  const handleCreate = async (data) => {
    setSubmitting(true)
    try {
      const res = await taskApi.create(data)
      setTasks([res.data.data.task, ...tasks])
      setShowCreate(false)
      toast.success('Task created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (data) => {
    setSubmitting(true)
    try {
      const res = await taskApi.update(editTask.id, data)
      setTasks(tasks.map((t) => (t.id === editTask.id ? res.data.data.task : t)))
      setEditTask(null)
      toast.success('Task updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    try {
      await taskApi.delete(task.id)
      setTasks(tasks.filter((t) => t.id !== task.id))
      toast.success('Task deleted.')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskApi.updateStatus(taskId, status)
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[color:var(--text-main)]">Tasks</h2>
          <p className="text-sm text-[color:var(--text-muted)] mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Task
          </Button>
        )}
      </div>

      <div className="card !p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input
              className="input pl-9"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <select className="input" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select className="input" value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)}>
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <select className="input" value={filters.projectId} onChange={(e) => setFilter('projectId', e.target.value)}>
            <option value="">All projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-16">
          <CheckSquare size={40} className="mx-auto text-[color:var(--text-muted)] mb-3" />
          <p className="text-[color:var(--text-muted)] font-medium">No tasks found</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned</th>
                <th>Due date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const overdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'COMPLETED'
                return (
                  <tr key={task.id}>
                    <td>
                      <p className="font-medium text-[color:var(--text-main)]">{task.title}</p>
                      {task.description && <p className="text-xs text-[color:var(--text-muted)] truncate max-w-[200px]">{task.description}</p>}
                    </td>
                    <td>
                      <span className="text-xs bg-brand-100/70 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
                        {task.project?.title}
                      </span>
                    </td>
                    <td>
                      {isAdmin || task.assignedToId === user?.id ? (
                        <select
                          className="input text-xs py-1 px-2 w-auto min-w-[110px]"
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
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-2xl bg-gradient-to-br from-brand-300 via-brand-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {task.assignedTo.name.charAt(0)}
                          </div>
                          <span className="text-sm text-[color:var(--text-main)]">{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-[color:var(--text-muted)] text-xs">—</span>
                      )}
                    </td>
                    <td>
                      {task.dueDate ? (
                        <span className={`text-xs ${overdue ? 'text-rose-500 font-semibold' : 'text-[color:var(--text-muted)]'}`}>
                          {overdue && '⚠ '} {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-[color:var(--text-muted)] text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {isAdmin && (
                          <>
                            <button onClick={() => setEditTask(task)} className="btn-ghost p-1.5 rounded-full text-[color:var(--text-muted)] hover:text-brand-600">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDelete(task)} className="btn-ghost p-1.5 rounded-full text-[color:var(--text-muted)] hover:text-rose-500">
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <TaskForm projects={projects} onSubmit={handleCreate} loading={submitting} onCancel={() => setShowCreate(false)} />
      </Modal>
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        <TaskForm initial={editTask} projects={projects} onSubmit={handleUpdate} loading={submitting} onCancel={() => setEditTask(null)} />
      </Modal>
    </div>
  )
}
