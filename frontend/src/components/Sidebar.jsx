import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FolderKanban, CheckSquare, User,
  LogOut, ChevronRight, X, Shield, Users
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/projects',  label: 'Projects',   icon: FolderKanban },
  { to: '/tasks',     label: 'Tasks',      icon: CheckSquare },
  { to: '/profile',   label: 'Profile',    icon: User },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-lg lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col
          glass-panel rounded-r-[1.75rem] border-0
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/15 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-brand-300 via-brand-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <CheckSquare size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-[color:var(--text-main)] text-sm tracking-tight">
              TaskManager
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden btn-ghost p-1.5 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/15">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-md">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-300 via-brand-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[color:var(--text-main)] truncate">{user?.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {user?.role === 'ADMIN' ? (
                  <Shield size={10} className="text-brand-500" />
                ) : (
                  <Users size={10} className="text-gray-400" />
                )}
                <span className="text-xs text-[color:var(--text-muted)]">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link group ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/15 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-rose-500 hover:text-rose-600"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
