import { Link } from 'react-router-dom'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

export default function FileCard({ file, basePath, onDelete }) {
  const viewPath = `${basePath}/files/${file.id}`
  const status = file.file_status || 'approved'

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-slate-900 dark:text-white">{file.filename}</h3>
          <p className="text-xs text-slate-500">
            {file.file_type.toUpperCase()} - {file.uploader_username || 'Unknown'} -{' '}
            {new Date(file.created_at).toLocaleString()}
          </p>
          {file.department_name && (
            <p className="text-xs text-slate-500">Department: {file.department_name}</p>
          )}
          {file.manager_username && (
            <p className="text-xs text-slate-500">Manager: {file.manager_username}</p>
          )}
        </div>
        {file.is_owner && (
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            Owner
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`rounded px-2 py-0.5 ${statusStyles[status] || statusStyles.approved}`}>
          {status}
        </span>
        {file.can_read && <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-700">Read</span>}
        {file.can_comment && (
          <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Comment
          </span>
        )}
        {file.can_edit && (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Edit
          </span>
        )}
      </div>
      <div className="mt-auto flex gap-2">
        <Link to={viewPath} className="btn-secondary text-center">
          View
        </Link>
        <Link to={viewPath} className="btn-primary text-center">
          Open file
        </Link>
        {onDelete && (file.is_owner || file.can_edit) && (
          <button type="button" onClick={() => onDelete(file.id)} className="btn-secondary text-red-600">
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
