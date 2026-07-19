import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import FileCard from '../components/FileCard'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import FileUpload from './FileUpload'
import FileViewer, { FilePlot } from './FileViewer'

function DashboardHome() {
  const { user, canUpload } = useAuth()
  const [files, setFiles] = useState([])

  useEffect(() => {
    api.get('/files/').then((res) => setFiles(res.data))
  }, [])

  const mine = files.filter((f) => f.is_owner)
  const shared = files.filter((f) => !f.is_owner)

  return (
    <div className="space-y-6">
      <div className="card border-l-4 border-brand-500">
        <p className="text-sm font-medium text-brand-700 dark:text-brand-200">
          Welcome, {user?.username}
        </p>
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
          Anyone can login to the dashboard, whether user or admin. Example: user1 can read and
          comment on a file shared by user2, but cannot edit it unless edit access is granted.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">My files ({mine.length})</h2>
            <Link to="/user/files" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-3">
            {mine.slice(0, 3).map((f) => (
              <FileCard key={f.id} file={f} basePath="/user" />
            ))}
            {mine.length === 0 && (
              <p className="text-sm text-slate-500">
                {canUpload ? 'Upload a file from the Upload menu.' : 'You have not uploaded any files.'}
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Shared with me ({shared.length})</h2>
            <Link to="/user/shared" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-3">
            {shared.slice(0, 3).map((f) => (
              <FileCard key={f.id} file={f} basePath="/user" />
            ))}
            {shared.length === 0 && (
              <p className="text-sm text-slate-500">
                No shared files yet. Ask someone with access to share a file with you.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function FileList({ filter }) {
  const [files, setFiles] = useState([])
  const load = () => api.get('/files/').then((res) => setFiles(res.data))

  useEffect(() => {
    load()
  }, [])

  const filtered =
    filter === 'mine' ? files.filter((f) => f.is_owner) : files.filter((f) => !f.is_owner)

  const onDelete = async (id) => {
    if (!confirm('Delete this file?')) return
    try {
      await api.delete(`/files/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete file')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {filter === 'mine'
          ? 'Files you uploaded. You can view, download, and delete your own files.'
          : 'Files others shared with you. You can read and comment only if permissions allow (see badges on each card).'}
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((f) => (
          <FileCard
            key={f.id}
            file={f}
            basePath="/user"
            onDelete={onDelete}
          />
        ))}
        {filtered.length === 0 && <p className="text-slate-500">No files found.</p>}
      </div>
    </div>
  )
}

export default function UserDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar title="Dashboard" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="files" element={<FileList filter="mine" key={`mine-${refreshKey}`} />} />
            <Route
              path="shared"
              element={<FileList filter="shared" key={`shared-${refreshKey}`} />}
            />
            <Route
              path="upload"
              element={<FileUpload onUploaded={() => setRefreshKey((k) => k + 1)} />}
            />
            <Route path="files/:id/plot" element={<FilePlot basePath="/user" />} />
            <Route path="files/:id" element={<FileViewer basePath="/user" />} />
            <Route index element={<DashboardHome />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
