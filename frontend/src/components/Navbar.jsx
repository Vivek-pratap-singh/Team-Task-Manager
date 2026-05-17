import { Menu, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/projects':  'Projects',
  '/tasks':     'Tasks',
  '/profile':   'Profile',
}

export default function Navbar({ onMenuClick }) {
  const { dark, toggleTheme } = useTheme()
  const location = useLocation()

  // Derive title — handle dynamic routes like /projects/:id
  const title = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/projects/') ? 'Project Details' : 'Page')

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 glass-panel border-0 rounded-none rounded-b-[1.5rem] shadow-none">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-ghost p-2 rounded-full"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-extrabold tracking-tight text-[color:var(--text-main)]">{title}</h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2 rounded-full"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification bell (UI only) */}
        <button className="btn-ghost p-2 rounded-full relative" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
