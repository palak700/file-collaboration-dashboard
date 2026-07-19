import { useAuth } from '../context/AuthContext'

export default function Navbar({ title }) {
  const { user, logout, darkMode, setDarkMode } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
      <div>
        <h1 className="text-xl font-semibold text-brand-700 dark:text-brand-100">{title}</h1>
        {user && (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Signed in as <strong>{user.username}</strong>
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="btn-secondary"
          aria-label="Toggle dark mode"
        >
          {darkMode ? 'Light' : 'Dark'}
        </button>
        <button type="button" onClick={logout} className="btn-secondary">
          Logout
        </button>
      </div>
    </header>
  )
}
