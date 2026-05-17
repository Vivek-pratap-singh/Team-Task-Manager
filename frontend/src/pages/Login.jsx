import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import AuthShell from '../components/auth/AuthShell'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const next = {}
    if (!form.email) next.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Login"
      subtitle="Enter your account details to continue."
      footerText="Create an account"
      footerLinkText="Sign up"
      footerLinkTo="/signup"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label className="label" htmlFor="login-email">Email</label>
          <div className="relative">
            <input
              id="login-email"
              type="email"
              className={`input !rounded-none !border-0 !border-b !bg-transparent !px-0 !pb-3 !pr-8 !shadow-none focus:!shadow-none ${errors.email ? 'border-red-400' : ''}`}
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
            <Mail size={16} className="absolute right-0 top-1.5 text-[color:var(--text-muted)]" />
          </div>
          {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="label" htmlFor="login-password">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              className={`input !rounded-none !border-0 !border-b !bg-transparent !px-0 !pb-3 !pr-8 !shadow-none focus:!shadow-none ${errors.password ? 'border-red-400' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
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

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Login
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs sm:text-sm text-[color:var(--text-muted)]">
        <Link to="/signup" className="auth-inline-link font-semibold">
          Create an account
        </Link>
        <button type="button" className="hover:text-[color:var(--text-main)] transition-colors">
          Forgot password?
        </button>
      </div>
    </AuthShell>
  )
}
