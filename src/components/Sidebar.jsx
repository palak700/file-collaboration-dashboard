import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
  }`

export default function Sidebar() {
  const { user, canManage, isSuperAdmin, canUpload } = useAuth()
  const base = canManage ? '/admin' : '/user'

  const links = canManage
    ? [
        { to: `${base}/dashboard`, label: 'Dashboard' },
        { to: `${base}/users`, label: 'Users' },
        ...(isSuperAdmin ? [{ to: `${base}/departments`, label: 'Authorities ' }] : []),
        { to: `${base}/files`, label: 'All files' },
        { to: `${base}/permissions`, label: 'Grant access' },
        { to: `${base}/logs`, label: 'Activity logs' },
      ]
    : [
        { to: `${base}/dashboard`, label: 'Dashboard' },
        { to: `${base}/files`, label: 'My files' },
        { to: `${base}/shared`, label: 'Shared with me' },
        ...(canUpload ? [{ to: `${base}/upload`, label: 'Upload' }] : []),
      ]

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      {user && (
        <p className="mb-2 text-xs text-slate-500">
          Account: <span className="font-medium text-slate-700 dark:text-slate-200">{user.username}</span>
        </p>
      )}
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Main menu
      </p>
      <nav className="space-y-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={linkClass} end>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
