import { useEffect, useState } from 'react'
import api from '../services/api'

export default function CommentBox({ fileId, canComment }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    api
      .get(`/comments/${fileId}`)
      .then((res) => setComments(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load comments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [fileId])

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setError('')
    try {
      await api.post('/comments/', { file_id: fileId, comment: text.trim() })
      setText('')
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post comment')
    }
  }

  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">Comments</h3>
      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <ul className="mb-4 max-h-64 space-y-3 overflow-y-auto">
        {comments.map((c) => (
          <li key={c.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-sm">{c.comment}</p>
            <p className="mt-1 text-xs text-slate-500">
              {c.username} · {new Date(c.created_at).toLocaleString()}
            </p>
          </li>
        ))}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-slate-500">No comments yet.</p>
        )}
      </ul>
      {canComment ? (
        <form onSubmit={submit} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Post
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-500">You do not have permission to comment.</p>
      )}
    </div>
  )
}
