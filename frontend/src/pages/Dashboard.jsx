import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, isPast, parseISO } from 'date-fns'
import { dashboardApi } from '../api/dashboard.api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import {
  FolderKanban, CheckSquare, Clock, AlertTriangle,
  TrendingUp, Activity, CircleDot
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, sublabel }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-[color:var(--text-main)]">
          {value ?? '—'}
        </p>
        <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
        {sublabel && <p className="text-xs text-[color:var(--text-muted)] mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi
      .get()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const { stats, recentTasks, recentActivity } = data || {}

  const statCards = [
    { icon: FolderKanban, label: 'Total Projects', value: stats?.totalProjects, color: 'bg-brand-500' },
    { icon: CheckSquare, label: 'Total Tasks', value: stats?.totalTasks, color: 'bg-violet-500' },
    { icon: TrendingUp, label: 'Completed', value: stats?.completedTasks, color: 'bg-emerald-500' },
    { icon: Clock, label: 'In Progress', value: stats?.inProgressTasks, color: 'bg-sky-500' },
    { icon: CircleDot, label: 'Pending', value: stats?.pendingTasks, color: 'bg-amber-500' },
    { icon: AlertTriangle, label: 'Overdue', value: stats?.overdueTasks, color: 'bg-rose-500' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-[color:var(--text-main)]">
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-[color:var(--text-muted)]">
          Here&apos;s what&apos;s happening with your team today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[color:var(--text-main)]">Recent Tasks</h3>
            <Link to="/tasks" className="text-xs font-bold text-brand-700 hover:text-brand-500 dark:text-brand-300">
              View all →
            </Link>
          </div>

          {recentTasks?.length === 0 ? (
            <p className="text-sm text-[color:var(--text-muted)] text-center py-8">No tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {recentTasks?.map((task) => {
                const overdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'COMPLETED'

                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-white/28 dark:bg-white/5 backdrop-blur-md transition-colors hover:bg-white/38 dark:hover:bg-white/8"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[color:var(--text-main)] truncate">{task.title}</p>
                      <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
                        {task.project?.title}
                        {task.dueDate && (
                          <span className={overdue ? 'text-rose-500 ml-2 font-semibold' : 'ml-2'}>
                            • Due {format(parseISO(task.dueDate), 'MMM d')}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} className="text-brand-500" />
            <h3 className="font-semibold text-[color:var(--text-main)]">Activity</h3>
          </div>

          {recentActivity?.length === 0 ? (
            <p className="text-sm text-[color:var(--text-muted)] text-center py-8">No activity yet.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity?.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-2xl bg-brand-100/70 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 text-xs font-bold flex-shrink-0 mt-0.5">
                    {log.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-[color:var(--text-main)] leading-relaxed">{log.action}</p>
                    <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
                      {format(parseISO(log.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
