import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import AuthShell from '../components/auth/AuthShell'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email) next.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 6) next.password = 'Use at least 6 characters'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup(form)
      toast.success('Account created! Please log in.')
      navigate('/login')
    } catch (err) {
      const backend = err.response?.data
      const backendMessage = backend?.message
      const backendErrors = backend?.errors

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        toast.error(`${backendMessage || 'Signup failed'}: ${backendErrors[0]?.msg || 'Validation error'}`)
      } else if (backendMessage) {
        toast.error(backendMessage)
      } else {
        toast.error('Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Set up your team workspace in a few seconds."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label className="label" htmlFor="signup-name">Full name</label>
          <div className="relative">
            <input
              id="signup-name"
              type="text"
              className={`input !rounded-none !border-0 !border-b !bg-transparent !px-0 !pb-3 !pr-8 !shadow-none focus:!shadow-none ${errors.name ? 'border-red-400' : ''}`}
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <UserRound size={16} className="absolute right-0 top-1.5 text-[color:var(--text-muted)]" />
          </div>
          {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="label" htmlFor="signup-email">Email</label>
          <div className="relative">
            <input
              id="signup-email"
              type="email"
              className={`input !rounded-none !border-0 !border-b !bg-transparent !px-0 !pb-3 !pr-8 !shadow-none focus:!shadow-none ${errors.email ? 'border-red-400' : ''}`}
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Mail size={16} className="absolute right-0 top-1.5 text-[color:var(--text-muted)]" />
          </div>
          {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="label" htmlFor="signup-password">Password</label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPass ? 'text' : 'password'}
              className={`input !rounded-none !border-0 !border-b !bg-transparent !px-0 !pb-3 !pr-8 !shadow-none focus:!shadow-none ${errors.password ? 'border-red-400' : ''}`}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPass((value) => !value)}
              className="absolute right-0 top-1.5 text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <Lock size={14} className="absolute right-7 top-1.5 text-[color:var(--text-muted)]" />
          </div>
          {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <label className="label" htmlFor="signup-role">Role</label>
          <select
            id="signup-role"
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs sm:text-sm text-[color:var(--text-muted)]">
        Want to go back?{' '}
        <Link to="/login" className="auth-inline-link font-semibold">
          Sign in instead
        </Link>
      </p>
    </AuthShell>
  )
}
