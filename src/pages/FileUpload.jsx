import { useState } from 'react'
import api from '../services/api'

const ACCEPT = '.zip,.csv,.tsv,.txt,.data,.xlsx,.xls,.xltx,.xlt,.ods,.ots,.fods,.dif,.slk,.dbf'

export default function FileUpload({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Select a file first')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    const form = new FormData()
    form.append('upload', file)
    try {
      await api.post('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('File uploaded successfully')
      setFile(null)
      onUploaded?.()
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h2 className="text-lg font-semibold">Upload File</h2>
      <p className="text-sm text-slate-500">Allowed: CSV, TSV, TXT, Excel, ODS, DBF, DIF, SLK, ZIP</p>
      <input
        type="file"
        accept={ACCEPT}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  )
}
