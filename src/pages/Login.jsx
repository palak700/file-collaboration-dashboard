import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [loginType, setLoginType] = useState('user')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isAdminLogin = loginType === 'admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const role = await login(username.trim(), password)
      if (isAdminLogin && !['superadmin', 'department_manager'].includes(role)) {
        await logout()
        setError('This login option is only for admin accounts.')
        return
      }
      navigate(['superadmin', 'department_manager'].includes(role) ? '/admin/dashboard' : '/user/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg).join(', ')
            : err.message?.includes('Network')
              ? 'Cannot reach API - keep backend running on port 8000'
              : 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            File Collaboration Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isAdminLogin ? 'Admin sign in' : 'User sign in'}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
          <button
            type="button"
            className={`rounded-md px-3 py-2.5 text-sm font-semibold transition ${
              !isAdminLogin
                ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-100'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
            onClick={() => {
              setLoginType('user')
              setError('')
            }}
          >
            User Login
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-2.5 text-sm font-semibold transition ${
              isAdminLogin
                ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-100'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
            onClick={() => {
              setLoginType('admin')
              setError('')
            }}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </p>
          )}
          <label className="block text-sm font-medium">
            Username
            <input
              className="input mt-1.5 h-11"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              className="input mt-1.5 h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="btn-primary h-11 w-full" disabled={loading}>
            {loading ? 'Signing in...' : isAdminLogin ? 'Sign in as admin' : 'Sign in as user'}
          </button>
        </form>
      </section>
    </main>
  )
}
