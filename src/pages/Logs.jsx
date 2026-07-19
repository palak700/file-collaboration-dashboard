import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/logs/')
      .then((res) => setLogs(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load logs'))
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Activity Logs</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="px-2 py-2">Time</th>
              <th className="px-2 py-2">User</th>
              <th className="px-2 py-2">Action</th>
              <th className="px-2 py-2">File</th>
              <th className="px-2 py-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 dark:border-slate-700">
                <td className="px-2 py-2 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-2 py-2">{log.username}</td>
                <td className="px-2 py-2">{log.action}</td>
                <td className="px-2 py-2">{log.filename || '—'}</td>
                <td className="px-2 py-2">{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && !error && (
          <p className="p-4 text-sm text-slate-500">No activity logged yet.</p>
        )}
      </div>
    </div>
  )
}
