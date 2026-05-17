import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { Plus, Search, FolderOpen, Users, CheckSquare2, Trash2, Pencil, ChevronRight } from 'lucide-react'
import { projectApi } from '../api/project.api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

function ProjectForm({ initial, onSubmit, loading, onCancel }) {
  const [form, setForm] = useState(initial || { title: '', description: '' })

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="label">Project title *</label>
        <input
          className="input"
          placeholder="e.g. Website redesign"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input min-h-[90px] resize-none"
          placeholder="Brief project description..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  )
}

export default function Projects() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await projectApi.getAll({ search: search || undefined })
      setProjects(res.data.data.projects)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timeout = setTimeout(fetchProjects, 300)
    return () => clearTimeout(timeout)
  }, [fetchProjects])

  const handleCreate = async (data) => {
    setSubmitting(true)
    try {
      const res = await projectApi.create(data)
      setProjects([res.data.data.project, ...projects])
      setShowCreate(false)
      toast.success('Project created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (data) => {
    setSubmitting(true)
    try {
      const res = await projectApi.update(editProject.id, data)
      setProjects(projects.map((p) => (p.id === editProject.id ? res.data.data.project : p)))
      setEditProject(null)
      toast.success('Project updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return
    try {
      await projectApi.delete(project.id)
      setProjects(projects.filter((p) => p.id !== project.id))
      toast.success('Project deleted.')
    } catch {
      toast.error('Failed to delete project')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[color:var(--text-main)]">Projects</h2>
          <p className="text-sm text-[color:var(--text-muted)] mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input
              className="input pl-9"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              New Project
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-16">
          <FolderOpen size={40} className="mx-auto text-[color:var(--text-muted)] mb-3" />
          <p className="text-[color:var(--text-muted)] font-medium">No projects found</p>
          {isAdmin && (
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Create your first project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="card-hover group flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-300 via-brand-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg">
                  {project.title.charAt(0)}
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditProject(project)}
                      className="btn-ghost p-1.5 rounded-full text-[color:var(--text-muted)] hover:text-brand-600"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="btn-ghost p-1.5 rounded-full text-[color:var(--text-muted)] hover:text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-[color:var(--text-main)]">{project.title}</h3>
                <p className="text-sm text-[color:var(--text-muted)] mt-1 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-[color:var(--text-muted)]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {project.members?.length ?? 0} members
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare2 size={12} /> {project._count?.tasks ?? 0} tasks
                  </span>
                </div>
                <span>{format(parseISO(project.createdAt), 'MMM d, yyyy')}</span>
              </div>

              <Link
                to={`/projects/${project.id}`}
                className="btn btn-secondary btn-sm w-full justify-center group-hover:border-brand-200 group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors"
              >
                View Project <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <ProjectForm onSubmit={handleCreate} loading={submitting} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
        <ProjectForm
          initial={editProject}
          onSubmit={handleUpdate}
          loading={submitting}
          onCancel={() => setEditProject(null)}
        />
      </Modal>
    </div>
  )
}
