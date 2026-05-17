import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth.api'
import Button from '../components/ui/Button'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name cannot be empty')
    setLoading(true)
    try {
      const res = await authApi.updateProfile({ name })
      updateUser(res.data.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="card text-center py-10">
        <div className="w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-brand-300 via-brand-500 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <h2 className="mt-4 text-xl font-extrabold tracking-tight text-[color:var(--text-main)]">{user?.name}</h2>
        <p className="text-[color:var(--text-muted)] text-sm mt-1">{user?.email}</p>
        <span
          className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            user?.role === 'ADMIN'
              ? 'bg-brand-100/80 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
              : 'bg-white/25 text-[color:var(--text-main)]'
          }`}
        >
          <Shield size={11} />
          {user?.role}
        </span>
      </div>

      <div className="card">
        <h3 className="font-semibold text-[color:var(--text-main)] mb-4">Account Information</h3>
        <div className="space-y-3">
          {[
            { icon: User, label: 'Full Name', value: user?.name },
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: Shield, label: 'Role', value: user?.role },
            { icon: Calendar, label: 'Member Since', value: user?.createdAt ? format(parseISO(user.createdAt), 'MMMM d, yyyy') : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-2xl bg-white/28 dark:bg-white/5 backdrop-blur-md">
              <div className="w-8 h-8 rounded-2xl bg-brand-100/70 dark:bg-brand-900/30 flex items-center justify-center">
                <Icon size={15} className="text-brand-600 dark:text-brand-300" />
              </div>
              <div>
                <p className="text-xs text-[color:var(--text-muted)]">{label}</p>
                <p className="text-sm font-medium text-[color:var(--text-main)]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-[color:var(--text-main)] mb-4">Edit Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
