import { useEffect, useState } from 'react'
import { Link, Outlet, Route, Routes } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import FileUpload from './FileUpload'
import FileViewer, { FilePlot } from './FileViewer'
import Logs from './Logs'

const roleLabels = {
  superadmin: 'Super Admin',
  department_manager: 'Department Manager',
  employee: 'Employee',
  uploader: 'Uploader',
  viewer: 'Viewer',
}

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

function StatusBadge({ status }) {
  const value = status || 'approved'
  return <span className={`rounded px-2 py-0.5 text-xs ${statusStyles[value] || statusStyles.approved}`}>{value}</span>
}

function PermissionBadges({ file }) {
  return (
    <div className="flex flex-wrap gap-1 text-xs">
      {file.can_read && <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-700">Read</span>}
      {file.can_comment && (
        <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
          Comment
        </span>
      )}
      {file.can_edit && (
        <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
          Edit
        </span>
      )}
    </div>
  )
}

function DashboardHome() {
  const { isSuperAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [files, setFiles] = useState([])
  const [logs, setLogs] = useState([])
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/users/'),
      api.get('/files/'),
      api.get('/logs/'),
      api.get('/departments/').catch(() => ({ data: [] })),
    ]).then(([usersRes, filesRes, logsRes, departmentsRes]) => {
      setUsers(usersRes.data)
      setFiles(filesRes.data)
      setLogs(logsRes.data)
      setDepartments(departmentsRes.data)
    })
  }, [])

  const pending = files.filter((file) => file.file_status === 'pending')
  const managers = users.filter((user) => user.role === 'department_manager')
  const cards = [
    { label: 'Users', value: users.length },
    { label: 'Departments', value: departments.length },
    { label: 'Pending approvals', value: pending.length },
    { label: 'Managers', value: managers.length },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-3xl font-bold text-brand-700 dark:text-brand-100">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Pending approvals</h2>
            <Link to="/admin/files" className="text-sm text-brand-600 hover:underline">
              Review files
            </Link>
          </div>
          <div className="space-y-3">
            {pending.slice(0, 5).map((file) => (
              <div key={file.id} className="rounded border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{file.filename}</p>
                    <p className="text-xs text-slate-500">
                      {file.department_name || 'No department'} - Manager:{' '}
                      {file.manager_username || 'Unassigned'}
                    </p>
                  </div>
                  <StatusBadge status={file.file_status} />
                </div>
              </div>
            ))}
            {pending.length === 0 && <p className="text-sm text-slate-500">No files waiting for approval.</p>}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-3 font-semibold">Manager activity</h2>
          <div className="space-y-2 text-sm">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex justify-between gap-3 border-b py-2 last:border-0 dark:border-slate-700">
                <span>
                  <strong>{log.username || 'User'}</strong> {log.action.replaceAll('_', ' ')}
                  {log.department_name ? ` in ${log.department_name}` : ''}
                </span>
                <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
          </div>
        </section>
      </div>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Department overview</h2>
          {isSuperAdmin && (
            <Link to="/admin/departments" className="text-sm text-brand-600 hover:underline">
              Manage departments
            </Link>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {departments.map((department) => (
            <div key={department.id} className="rounded border border-slate-200 p-3 dark:border-slate-700">
              <p className="font-medium">{department.name}</p>
              <p className="text-xs text-slate-500">Manager: {department.manager_username || 'Unassigned'}</p>
              <p className="mt-2 text-xs text-slate-500">
                {department.user_count} users - {department.file_count} files
              </p>
            </div>
          ))}
          {departments.length === 0 && <p className="text-sm text-slate-500">No departments created yet.</p>}
        </div>
      </section>
    </div>
  )
}

function UsersPage() {
  const { isSuperAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee',
    department_id: '',
    assigned_role: '',
    can_upload: false,
  })
  const [msg, setMsg] = useState('')

  const load = () => {
    api.get('/users/').then((res) => setUsers(res.data))
    api.get('/departments/').then((res) => setDepartments(res.data)).catch(() => setDepartments([]))
  }

  useEffect(() => {
    load()
  }, [])

  const createUser = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const payload = {
        ...form,
        department_id: form.department_id ? Number(form.department_id) : null,
        assigned_role: form.assigned_role || null,
      }
      await api.post('/auth/register', payload)
      setForm({ username: '', email: '', password: '', role: 'employee', department_id: '', assigned_role: '', can_upload: false })
      setMsg('User created')
      load()
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={createUser} className="card space-y-3">
        <h2 className="font-semibold">Create user or manager</h2>
        <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="employee">Employee</option>
          {isSuperAdmin && <option value="department_manager">Department Manager</option>}
          {isSuperAdmin && <option value="superadmin">Super Admin</option>}
        </select>
        <select className="input" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
          <option value="">Select department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        <input className="input" placeholder="Assigned role or task" value={form.assigned_role} onChange={(e) => setForm({ ...form, assigned_role: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.can_upload} onChange={(e) => setForm({ ...form, can_upload: e.target.checked })} />
          Allow file upload
        </label>
        {msg && <p className="text-sm text-brand-600">{msg}</p>}
        <button type="submit" className="btn-primary">Create</button>
      </form>

      <div className="card">
        <h2 className="mb-3 font-semibold">Users</h2>
        <ul className="space-y-2 text-sm">
          {users.map((user) => (
            <li key={user.id} className="border-b py-2 dark:border-slate-700">
              <div className="flex justify-between gap-3">
                <span>{user.username} ({user.email})</span>
                <span className="text-xs text-slate-500">{roleLabels[user.role] || user.role}</span>
              </div>
              <p className="text-xs text-slate-500">
                Department: {departments.find((d) => d.id === user.department_id)?.name || 'None'} -{' '}
                Assigned: {user.assigned_role || 'Not assigned'} - Upload: {user.can_upload ? 'yes' : 'no'} -{' '}
                {user.is_active ? 'Active' : 'Deactivated'}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', manager_id: '' })
  const [assign, setAssign] = useState({ user_id: '', department_id: '', assigned_role: 'Department Manager' })
  const [msg, setMsg] = useState('')

  const load = () => {
    api.get('/departments/').then((res) => setDepartments(res.data))
    api.get('/users/').then((res) => setUsers(res.data))
  }

  useEffect(() => {
    load()
  }, [])

  const createDepartment = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/departments/create', {
        name: form.name,
        manager_id: form.manager_id ? Number(form.manager_id) : null,
      })
      setForm({ name: '', manager_id: '' })
      setMsg('Department created')
      load()
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed')
    }
  }

  const assignManager = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/departments/assign-manager', {
        user_id: Number(assign.user_id),
        department_id: Number(assign.department_id),
        assigned_role: assign.assigned_role,
      })
      setAssign({ user_id: '', department_id: '', assigned_role: 'Department Manager' })
      setMsg('Manager assigned')
      load()
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form onSubmit={createDepartment} className="card space-y-3">
        <h2 className="font-semibold">Create department</h2>
        <input className="input" placeholder="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="input" value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value })}>
          <option value="">Optional manager</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        {msg && <p className="text-sm text-brand-600">{msg}</p>}
        <button type="submit" className="btn-primary">Create department</button>
      </form>

      <form onSubmit={assignManager} className="card space-y-3">
        <h2 className="font-semibold">Assign department manager</h2>
        <select className="input" value={assign.user_id} onChange={(e) => setAssign({ ...assign, user_id: e.target.value })} required>
          <option value="">Select person</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        <select className="input" value={assign.department_id} onChange={(e) => setAssign({ ...assign, department_id: e.target.value })} required>
          <option value="">Select department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>{department.name}</option>
          ))}
        </select>
        <input className="input" value={assign.assigned_role} onChange={(e) => setAssign({ ...assign, assigned_role: e.target.value })} />
        <button type="submit" className="btn-primary">Assign manager</button>
      </form>

      <section className="card xl:col-span-2">
        <h2 className="mb-3 font-semibold">Departments</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {departments.map((department) => (
            <div key={department.id} className="rounded border border-slate-200 p-3 dark:border-slate-700">
              <p className="font-medium">{department.name}</p>
              <p className="text-xs text-slate-500">Manager: {department.manager_username || 'Unassigned'}</p>
              <p className="mt-2 text-xs text-slate-500">{department.user_count} users - {department.file_count} files</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function FilesPage() {
  const [files, setFiles] = useState([])
  const [msg, setMsg] = useState('')
  const load = () => api.get('/files/').then((res) => setFiles(res.data))

  useEffect(() => {
    load()
  }, [])

  const onDelete = async (id) => {
    if (!confirm('Delete this file?')) return
    try {
      await api.delete(`/files/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete file')
    }
  }

  const updateStatus = async (id, action) => {
    setMsg('')
    try {
      await api.post(`/files/${action}`, { file_id: id })
      setMsg(`File ${action}d`)
      load()
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div className="space-y-6">
      <FileUpload onUploaded={load} />
      {msg && <p className="text-sm text-brand-600">{msg}</p>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left dark:border-slate-700">
              <th className="py-2 pr-4">File</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Department</th>
              <th className="py-2 pr-4">Assigned manager</th>
              <th className="py-2 pr-4">Permissions</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-b last:border-0 dark:border-slate-700">
                <td className="py-3 pr-4">
                  <p className="font-medium">{file.filename}</p>
                  <p className="text-xs text-slate-500">{file.uploader_username || 'Unknown'}</p>
                </td>
                <td className="py-3 pr-4"><StatusBadge status={file.file_status} /></td>
                <td className="py-3 pr-4">{file.department_name || 'None'}</td>
                <td className="py-3 pr-4">{file.manager_username || 'Unassigned'}</td>
                <td className="py-3 pr-4"><PermissionBadges file={file} /></td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/admin/files/${file.id}`} className="btn-secondary">View</Link>
                    <Link to={`/admin/files/${file.id}?open=1`} className="btn-primary">
                      Open file
                    </Link>
                    {file.file_status === 'pending' && (
                      <>
                        <button type="button" className="btn-secondary" onClick={() => updateStatus(file.id, 'approve')}>Approve</button>
                        <button type="button" className="btn-secondary text-red-600" onClick={() => updateStatus(file.id, 'reject')}>Reject</button>
                      </>
                    )}
                    <button type="button" className="btn-secondary text-red-600" onClick={() => onDelete(file.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {files.length === 0 && <p className="py-4 text-sm text-slate-500">No files found.</p>}
      </div>
    </div>
  )
}

function PermissionsPage() {
  const [users, setUsers] = useState([])
  const [files, setFiles] = useState([])
  const [existing, setExisting] = useState([])
  const [grant, setGrant] = useState({
    user_id: '',
    file_id: '',
    can_read: true,
    can_comment: false,
    can_edit: false,
  })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/users/').then((r) => setUsers(r.data))
    api.get('/files/').then((r) => setFiles(r.data))
  }, [])

  useEffect(() => {
    if (!grant.user_id) {
      setExisting([])
      return
    }
    api.get(`/permissions/${grant.user_id}`).then((r) => setExisting(r.data))
  }, [grant.user_id, msg])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/permissions/grant', {
        ...grant,
        user_id: Number(grant.user_id),
        file_id: Number(grant.file_id),
      })
      setMsg('Permission saved')
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="card space-y-3">
        <h2 className="font-semibold">Grant department file access</h2>
        <p className="text-xs text-slate-500">
          Department managers can assign read, comment, and edit access only inside their department.
        </p>
        <select className="input" value={grant.user_id} onChange={(e) => setGrant({ ...grant, user_id: e.target.value })} required>
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        <select className="input" value={grant.file_id} onChange={(e) => setGrant({ ...grant, file_id: e.target.value })} required>
          <option value="">Select file</option>
          {files.map((file) => (
            <option key={file.id} value={file.id}>{file.filename}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={grant.can_read} onChange={(e) => setGrant({ ...grant, can_read: e.target.checked })} />
          Can read
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={grant.can_comment} onChange={(e) => setGrant({ ...grant, can_comment: e.target.checked })} />
          Can comment
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={grant.can_edit} onChange={(e) => setGrant({ ...grant, can_edit: e.target.checked })} />
          Can edit
        </label>
        {msg && <p className="text-sm text-brand-600">{msg}</p>}
        <button type="submit" className="btn-primary">Save permission</button>
      </form>

      <div className="card">
        <h2 className="mb-3 font-semibold">Current access for selected user</h2>
        {!grant.user_id && <p className="text-sm text-slate-500">Select a user to see their file permissions.</p>}
        <ul className="space-y-2 text-sm">
          {existing.map((permission) => (
            <li key={permission.id} className="rounded border border-slate-200 p-2 dark:border-slate-700">
              <p className="font-medium">{permission.filename}</p>
              <p className="text-xs text-slate-500">
                Read: {permission.can_read ? 'yes' : 'no'} - Comment: {permission.can_comment ? 'yes' : 'no'} -
                Edit: {permission.can_edit ? 'yes' : 'no'}
              </p>
            </li>
          ))}
        </ul>
        {grant.user_id && existing.length === 0 && <p className="text-sm text-slate-500">No permissions granted yet.</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar title="Dashboard" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="files/:id/plot" element={<FilePlot basePath="/admin" />} />
            <Route path="files/:id" element={<FileViewer basePath="/admin" />} />
            <Route path="permissions" element={<PermissionsPage />} />
            <Route path="logs" element={<Logs />} />
            <Route index element={<DashboardHome />} />
          </Routes>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
