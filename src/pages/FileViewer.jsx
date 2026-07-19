import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CommentBox from '../components/CommentBox'
import api from '../services/api'

const CHART_TYPES = [
  { value: 'line', label: 'Line' },
  { value: 'bar', label: 'Bar / Column' },
  { value: 'scatter', label: 'Scatter' },
  { value: 'histogram', label: 'Histogram' },
  { value: 'pie', label: 'Pie' },
]

const ALGORITHMS = [
  { value: 'kmeans', label: 'K-means' },
  { value: 'knn', label: 'KNN' },
]

const PLOT_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d']

function TablePlot({ headers, plot }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  if (!plot?.points?.length) return null

  const width = 760
  const height = 360
  const padding = { top: 26, right: 24, bottom: 96, left: 66 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const yValues = plot.points.map((point) => point.y)
  const xValues = plot.points.map((point) => point.x).filter((value) => Number.isFinite(value))
  const minY = Math.min(0, ...yValues)
  const maxY = Math.max(...yValues, 1)
  const yRange = maxY - minY || 1
  const minX = xValues.length ? Math.min(...xValues) : 0
  const maxX = xValues.length ? Math.max(...xValues) : plot.points.length - 1
  const xRange = maxX - minX || 1
  const slotWidth = chartWidth / Math.max(plot.points.length, 1)
  const barWidth = Math.max(slotWidth - 8, 8)
  const labelStep = Math.max(1, Math.ceil(plot.points.length / 10))
  const gridLines = [0, 0.25, 0.5, 0.75, 1]
  const baselineY = height - padding.bottom - ((0 - minY) / yRange) * chartHeight
  const isScatter = plot.chartType === 'scatter'
  const isLine = plot.chartType === 'line'
  const isPie = plot.chartType === 'pie' || plot.chartType === 'donut'
  const chartLabel = CHART_TYPES.find((type) => type.value === plot.chartType)?.label || 'Plot'
  const linePoints = plot.points
    .map((point, index) => {
      const x = isScatter
        ? padding.left + ((point.x - minX) / xRange) * chartWidth
        : padding.left + index * (chartWidth / Math.max(plot.points.length - 1, 1))
      const y = height - padding.bottom - ((point.y - minY) / yRange) * chartHeight
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="rounded border border-slate-200 p-3 dark:border-slate-700">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold">{chartLabel}</h4>
        <p className="text-xs text-slate-500">
          {plot.description}
        </p>
      </div>
      {hoveredPoint && (
        <div className="mb-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
          <span className="font-medium">{hoveredPoint.label}</span>
          {Number.isFinite(hoveredPoint.x) && (
            <span className="ml-3 text-slate-500">X: {formatNumber(hoveredPoint.x)}</span>
          )}
          <span className="ml-3 text-slate-500">
            {plot.chartType === 'histogram' ? 'Frequency' : 'Value'}: {formatNumber(hoveredPoint.y)}
          </span>
          {hoveredPoint.count !== undefined && (
            <span className="ml-3 text-slate-500">Rows: {hoveredPoint.count}</span>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[680px]">
          {!isPie && (
            <>
              {gridLines.map((ratio) => {
                const y = height - padding.bottom - ratio * chartHeight
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    <text x={padding.left - 12} y={y + 4} textAnchor="end" className="fill-slate-500 text-xs">
                      {formatNumber(minY + yRange * ratio)}
                    </text>
                  </g>
                )
              })}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={height - padding.bottom}
                stroke="currentColor"
                className="text-slate-400"
              />
              <line
                x1={padding.left}
                y1={baselineY}
                x2={width - padding.right}
                y2={baselineY}
                stroke="currentColor"
                className="text-slate-400"
              />
            </>
          )}
          {(plot.chartType === 'bar' || plot.chartType === 'histogram') &&
            plot.points.map((point, index) => {
              const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2
              const y = height - padding.bottom - ((point.y - minY) / yRange) * chartHeight
              const barHeight = Math.abs(baselineY - y)
              const showLabel = index === 0 || index === plot.points.length - 1 || index % labelStep === 0
              return (
                <g key={`${point.label}-${index}`}>
                  <rect
                    x={x}
                    y={Math.min(y, baselineY)}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx="3"
                    fill={PLOT_COLORS[index % PLOT_COLORS.length]}
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {showLabel && (
                    <text
                      x={x + barWidth / 2}
                      y={height - padding.bottom + 24}
                      textAnchor="end"
                      transform={`rotate(-45 ${x + barWidth / 2} ${height - padding.bottom + 24})`}
                      className="fill-slate-500 text-[10px]"
                    >
                      {point.label.length > 16 ? `${point.label.slice(0, 16)}...` : point.label}
                    </text>
                  )}
                </g>
              )
            })}
          {isLine && (
            <>
              <polyline points={linePoints} fill="none" stroke="#2563eb" strokeWidth="3" />
              {plot.points.map((point, index) => {
                const x = padding.left + index * (chartWidth / Math.max(plot.points.length - 1, 1))
                const y = height - padding.bottom - ((point.y - minY) / yRange) * chartHeight
                const showLabel = index === 0 || index === plot.points.length - 1 || index % labelStep === 0
                return (
                  <g key={`${point.label}-${index}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#2563eb"
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {showLabel && (
                      <text
                        x={x}
                        y={height - padding.bottom + 24}
                        textAnchor="end"
                        transform={`rotate(-45 ${x} ${height - padding.bottom + 24})`}
                        className="fill-slate-500 text-[10px]"
                      >
                        {point.label.length > 16 ? `${point.label.slice(0, 16)}...` : point.label}
                      </text>
                    )}
                  </g>
                )
              })}
            </>
          )}
          {isScatter &&
            plot.points.map((point, index) => {
              const x = padding.left + ((point.x - minX) / xRange) * chartWidth
              const y = height - padding.bottom - ((point.y - minY) / yRange) * chartHeight
              return (
                <circle
                  key={`${point.label}-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={PLOT_COLORS[index % PLOT_COLORS.length]}
                  opacity="0.8"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              )
            })}
          {isPie && (
            <PieChart
              points={plot.points}
              donut={plot.chartType === 'donut'}
              onHover={setHoveredPoint}
              width={width}
              height={height}
            />
          )}
        </svg>
      </div>
    </div>
  )
}

function PieChart({ points, donut, onHover, width, height }) {
  const total = points.reduce((sum, point) => sum + Math.max(point.y, 0), 0)
  const centerX = width / 2
  const centerY = height / 2 - 10
  const radius = 118
  let angle = -90

  if (!total) return null

  return (
    <g>
      {points.map((point, index) => {
        const sliceAngle = (Math.max(point.y, 0) / total) * 360
        const path = describeArc(centerX, centerY, radius, angle, angle + sliceAngle)
        angle += sliceAngle
        return (
          <path
            key={`${point.label}-${index}`}
            d={path}
            fill={PLOT_COLORS[index % PLOT_COLORS.length]}
            stroke="white"
            strokeWidth="2"
            onMouseEnter={() => onHover(point)}
            onMouseLeave={() => onHover(null)}
          />
        )
      })}
      {donut && <circle cx={centerX} cy={centerY} r="58" className="fill-white dark:fill-slate-950" />}
    </g>
  )
}

function TableEditor({ fileId, file, preview, onSaved, plotPath }) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setHeaders(preview.headers || [])
    setRows(preview.rows || [])
    setMessage('')
    setMessageIsError(false)
  }, [preview])

  const canEditTable = file.can_edit && ['csv', 'tsv', 'zip'].includes(preview.type)

  const updateHeader = (index, value) => {
    setHeaders((current) => current.map((header, i) => (i === index ? value : header)))
  }

  const updateCell = (rowIndex, cellIndex, value) => {
    setRows((current) =>
      current.map((row, ri) =>
        ri === rowIndex ? row.map((cell, ci) => (ci === cellIndex ? value : cell)) : row,
      ),
    )
  }

  const addRow = () => {
    setRows((current) => [...current, headers.map(() => '')])
  }

  const addColumn = () => {
    setHeaders((current) => [...current, `Column ${current.length + 1}`])
    setRows((current) => current.map((row) => [...row, '']))
  }

  const saveTable = async () => {
    setSaving(true)
    setMessage('')
    setMessageIsError(false)
    try {
      const { data } = await api.put(`/files/${fileId}/table`, { headers, rows })
      onSaved(data)
      setMessage('Changes saved')
      setMessageIsError(false)
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to save changes')
      setMessageIsError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">File table</h3>
          {!canEditTable && (
            <p className="text-sm text-slate-500">
              You can view this table here. Edit access is required to change cells.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {canEditTable && (
            <>
            <button type="button" className="btn-secondary" onClick={addRow}>
              Add row
            </button>
            <button type="button" className="btn-secondary" onClick={addColumn}>
              Add column
            </button>
            </>
          )}
          <Link to={plotPath} className="btn-secondary">
            Plot
          </Link>
          {canEditTable && (
            <button type="button" className="btn-primary" onClick={saveTable} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          )}
        </div>
      </div>
      {message && (
        <p className={`text-sm ${messageIsError ? 'text-red-600' : 'text-emerald-600'}`}>
          {message}
        </p>
      )}
      <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-900">
              {headers.map((header, index) => (
                <th key={index} className="min-w-40 border px-2 py-1 text-left dark:border-slate-700">
                  {canEditTable ? (
                    <input
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-950"
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                    />
                  ) : (
                    header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((_, cellIndex) => (
                  <td key={cellIndex} className="min-w-40 border px-2 py-1 dark:border-slate-700">
                    {canEditTable ? (
                      <input
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-950"
                        value={row[cellIndex] || ''}
                        onChange={(e) => updateCell(rowIndex, cellIndex, e.target.value)}
                      />
                    ) : (
                      row[cellIndex] || ''
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-3 text-sm text-slate-500">No rows in this file.</p>}
      </div>
      {preview.truncated && <p className="text-xs text-slate-500">Showing first 100 rows</p>}
    </div>
  )
}

function Preview({ fileId, file, preview, onSaved, plotPath }) {
  if (!preview) return null
  if (preview.type === 'csv' || preview.type === 'tsv') {
    return <TableEditor fileId={fileId} file={file} preview={preview} onSaved={onSaved} plotPath={plotPath} />
  }
  if (preview.type === 'text') {
    return (
      <pre className="max-h-96 overflow-auto rounded bg-slate-900 p-4 text-xs text-slate-100">
        {preview.content}
      </pre>
    )
  }
  if (preview.type === 'zip') {
    return (
      <div className="space-y-4">
        <ul className="max-h-48 overflow-auto text-sm">
          {(preview.entries || []).map((e, i) => (
            <li key={i} className="border-b border-slate-200 py-1 dark:border-slate-700">
              {e.is_dir ? '[folder]' : '[file]'} {e.name} ({e.size} bytes)
            </li>
          ))}
        </ul>
        {preview.extracted ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-500">
                Showing data from {preview.extracted.extracted_name || 'the first supported file in this ZIP'}.
              </p>
              <Link to={plotPath} className="btn-secondary">
                Plot extracted data
              </Link>
            </div>
            <TableEditor
              fileId={fileId}
              file={file}
              preview={{ ...preview.extracted, type: 'zip' }}
              onSaved={onSaved}
              plotPath={plotPath}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500">{preview.message || 'No supported data file found inside this ZIP.'}</p>
        )}
      </div>
    )
  }
  return <p className="text-sm text-slate-500">{preview.message || 'Preview not available'}</p>
}

function ReadOnlyTable({ preview }) {
  const headers = preview.headers || []
  const rows = preview.rows || []

  return (
    <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-900">
            {headers.map((header, index) => (
              <th key={index} className="min-w-40 border px-2 py-1 text-left dark:border-slate-700">
                {header || `Column ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((_, cellIndex) => (
                <td key={cellIndex} className="min-w-40 border px-2 py-1 dark:border-slate-700">
                  {row[cellIndex] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="p-3 text-sm text-slate-500">No rows in this extracted file.</p>}
      {preview.truncated && <p className="p-3 text-xs text-slate-500">Showing first 100 rows</p>}
    </div>
  )
}

export default function FileViewer({ basePath }) {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/files/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load file'))
  }, [id])

  const download = async () => {
    let url
    try {
      const res = await api.get(`/files/${id}/download`, { responseType: 'blob' })
      url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = data?.file?.filename || 'download'
      a.click()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to download file')
    } finally {
      if (url) window.URL.revokeObjectURL(url)
    }
  }

  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return <p className="text-slate-500">Loading file...</p>

  const { file, preview } = data
  const backTo = `${basePath}/files`
  const isTableFile = preview?.type === 'csv' || preview?.type === 'tsv' || Boolean(preview?.extracted?.headers)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={backTo} className="btn-secondary mb-3 inline-flex">
            Back to files
          </Link>
          <h2 className="text-xl font-semibold">{file.filename}</h2>
          <p className="text-sm text-slate-500">
            {file.file_type.toUpperCase()} - {file.uploader_username}
          </p>
          <p className="text-sm text-slate-500">
            Status: {file.file_status || 'approved'} - Department: {file.department_name || 'None'} -
            Manager: {file.manager_username || 'Unassigned'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {file.can_read && <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-700">Read</span>}
            {file.can_comment && (
              <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Can comment
              </span>
            )}
            {file.can_edit && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Can edit
              </span>
            )}
          </div>
        </div>
        <button type="button" onClick={download} className="btn-secondary">
          Download
        </button>
      </div>
      <div className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">{isTableFile ? 'Open file' : 'Preview'}</h3>
          {isTableFile && (
            <span className="text-xs text-slate-500">
              Spreadsheet files can be viewed here and edited when edit permission is enabled.
            </span>
          )}
        </div>
        <Preview
          fileId={Number(id)}
          file={file}
          preview={preview}
          onSaved={setData}
          plotPath={`${basePath}/files/${id}/plot`}
        />
      </div>
      <CommentBox fileId={Number(id)} canComment={file.can_comment} />
    </div>
  )
}

export function FilePlot({ basePath }) {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [categoryColumn, setCategoryColumn] = useState('0')
  const [valueColumn, setValueColumn] = useState('0')
  const [chartType, setChartType] = useState('bar')
  const [kValue, setKValue] = useState('3')
  const [algorithm, setAlgorithm] = useState('kmeans')
  const [targetColumn, setTargetColumn] = useState('0')
  const [plot, setPlot] = useState(null)
  const [plotError, setPlotError] = useState('')
  const [plotLoading, setPlotLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    api
      .get(`/files/${id}`)
      .then((res) => {
        setData(res.data)
        const tablePreview = getTablePreview(res.data.preview)
        const headers = tablePreview?.headers || []
        const rows = tablePreview?.rows || []
        const numericIndexes = getNumericColumnIndexes(headers, rows)
        const valueIndex = numericIndexes[0] ?? (headers.length > 1 ? 1 : 0)
        const categoryIndex = numericIndexes.find((index) => index !== valueIndex) ?? headers.findIndex((_, index) => index !== valueIndex)
        setCategoryColumn(String(categoryIndex >= 0 ? categoryIndex : 0))
        setValueColumn(String(valueIndex))
        const targetIndex = headers.findIndex((_, index) => index !== valueIndex && !numericIndexes.includes(index))
        setTargetColumn(String(targetIndex >= 0 ? targetIndex : 0))
        if (headers.length > 0 && numericIndexes.length === 0) {
          setPlotError('Choose a value column that contains numbers.')
        }
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load file'))
  }, [id])

  useEffect(() => {
    if (getTablePreview(data?.preview)?.headers?.length) {
      makeCurrentPlot()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const makeCurrentPlot = async () => {
    if (!data?.preview) return
    const tablePreview = getTablePreview(data.preview)
    const headers = tablePreview?.headers || []
    const xColumn = headers[Number(categoryColumn)] || headers[0]
    const yColumn = headers[Number(valueColumn)] || headers[0]
    const targetCol = headers[Number(targetColumn)] || headers[0]
    setPlotLoading(true)
    setPlotError('')
    setShowDetails(false)
    try {
      const { data: plotData } = await api.get(`/files/${id}/plot`, {
        params: {
          chart_type: chartType,
          x_column: xColumn,
          y_column: yColumn,
          ...(chartType === 'scatter'
            ? {
                k_value: kValue,
                algorithm: algorithm,
                ...(algorithm === 'knn' ? { target_column: targetCol } : {}),
              }
            : {}),
        },
      })
      setPlot(plotData)
    } catch (err) {
      setPlot(null)
      setPlotError(err.response?.data?.detail || 'Failed to create plot')
    } finally {
      setPlotLoading(false)
    }
  }

  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return <p className="text-slate-500">Loading plot...</p>

  const { file, preview } = data
  const tablePreview = getTablePreview(preview)
  const headers = tablePreview?.headers || []
  const rows = tablePreview?.rows || []
  const numericIndexes = getNumericColumnIndexes(headers, rows)
  const valueOptions = numericIndexes.length > 0 ? numericIndexes : headers.map((_, index) => index)
  const backToFile = `${basePath}/files/${id}`

  if (!tablePreview?.headers) {
    return (
      <div className="space-y-4">
        <Link to={backToFile} className="btn-secondary inline-flex">Back to file</Link>
        <p className="text-sm text-slate-500">Plot requires tabular data. This file type does not support plotting.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={backToFile} className="btn-secondary mb-3 inline-flex">
            Back to file
          </Link>
          <h2 className="text-xl font-semibold">{file.filename}</h2>
          <p className="text-sm text-slate-500">
            Select the chart type and columns. Click the graph to show all plotted details.
          </p>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-sm font-medium">
            Plot type
            <select
              className="input mt-1 min-w-48"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              {CHART_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            X axis item name
            <select
              className="input mt-1 min-w-48"
              value={categoryColumn}
              onChange={(e) => setCategoryColumn(e.target.value)}
            >
              {headers.map((header, index) => (
                <option key={`${header}-${index}`} value={index}>
                  {header || `Column ${index + 1}`}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Y axis value
            <select
              className="input mt-1 min-w-48"
              value={valueColumn}
              onChange={(e) => setValueColumn(e.target.value)}
            >
              {valueOptions.map((index) => (
                <option key={`${headers[index] || 'column'}-${index}`} value={index}>
                  {headers[index] || `Column ${index + 1}`}
                  {numericIndexes.includes(index) ? '' : ' (check numbers)'}
                </option>
              ))}
            </select>
          </label>
          {chartType === 'scatter' && (
            <label className="block text-sm font-medium">
              Algorithm
              <select
                className="input mt-1 min-w-32"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                {ALGORITHMS.map((algo) => (
                  <option key={algo.value} value={algo.value}>
                    {algo.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {chartType === 'scatter' && algorithm === 'knn' && (
            <label className="block text-sm font-medium">
              Target column
              <select
                className="input mt-1 min-w-48"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
              >
                {headers.map((header, index) => (
                  <option key={`${header}-${index}`} value={index}>
                    {header || `Column ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
          )}
          {chartType === 'scatter' && (
            <label className="block text-sm font-medium">
              K value
              <input
                type="number"
                min="1"
                max="20"
                className="input mt-1 w-28"
                value={kValue}
                onChange={(e) => setKValue(e.target.value)}
              />
            </label>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={makeCurrentPlot}
            disabled={headers.length < 1 || plotLoading}
          >
            {plotLoading ? 'Creating plot...' : 'Update plot'}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Pandas reads the file data and matplotlib designs the graph. Line and bar group repeated labels,
          scatter uses two numeric columns with K-means or KNN grouping, histogram shows distribution for one numeric column, and pie shows category shares.
        </p>
        {plotError && <p className="text-sm text-red-600">{plotError}</p>}
        <MatplotlibPlot
          plot={plot}
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails((current) => !current)}
        />
      </div>
    </div>
  )
}

function getTablePreview(preview) {
  if (!preview) return null
  if (preview.headers) return preview
  if (preview.extracted?.headers) return preview.extracted
  return null
}

function makePlot(rows, categoryIndex, valueIndex, chartType, setPlot, setPlotError) {
  if (categoryIndex === valueIndex && chartType !== 'histogram') {
    setPlotError('Choose two different columns.')
    setPlot(null)
    return
  }

  let points = []
  let description = ''

  if (chartType === 'scatter') {
    points = buildScatterPoints(rows, categoryIndex, valueIndex)
    description = `X values: ${categoryIndex + 1} - Y values: ${valueIndex + 1}`
  } else if (chartType === 'histogram') {
    points = buildHistogramPoints(rows, valueIndex)
    description = `Distribution of ${valueIndex + 1}`
  } else {
    points = aggregateRowsByCategory(rows, categoryIndex, valueIndex)
    description = `X axis: category column ${categoryIndex + 1} - Y axis: value column ${valueIndex + 1} - grouped by category`
  }

  if (!points.length) {
    setPlotError(chartType === 'scatter' ? 'Scatter plots need two numeric columns.' : 'The value column must contain numbers.')
    setPlot(null)
    return
  }

  setPlot({ categoryIndex, valueIndex, chartType, points, description })
  setPlotError('')
}

function aggregateRowsByCategory(rows, categoryIndex, valueIndex) {
  const groups = new Map()

  rows.forEach((row) => {
    const label = String(row[categoryIndex] || 'Blank').trim() || 'Blank'
    const value = parseNumericValue(row[valueIndex])
    if (!Number.isFinite(value)) return

    const current = groups.get(label) || { label, y: 0, count: 0 }
    current.y += value
    current.count += 1
    groups.set(label, current)
  })

  return Array.from(groups.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }),
  )
}

function buildScatterPoints(rows, xIndex, yIndex) {
  return rows
    .map((row, index) => {
      const x = parseNumericValue(row[xIndex])
      const y = parseNumericValue(row[yIndex])
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null
      return { label: `Row ${index + 1}`, x, y }
    })
    .filter(Boolean)
    .slice(0, 500)
}

function buildHistogramPoints(rows, valueIndex) {
  const values = rows.map((row) => parseNumericValue(row[valueIndex])).filter(Number.isFinite)
  if (!values.length) return []

  const min = Math.min(...values)
  const max = Math.max(...values)
  const binCount = Math.min(12, Math.max(5, Math.ceil(Math.sqrt(values.length))))
  const binSize = (max - min || 1) / binCount
  const bins = Array.from({ length: binCount }, (_, index) => {
    const start = min + index * binSize
    const end = index === binCount - 1 ? max : start + binSize
    return { label: `${formatNumber(start)} - ${formatNumber(end)}`, y: 0, count: 0 }
  })

  values.forEach((value) => {
    const index = Math.min(Math.floor((value - min) / binSize), binCount - 1)
    bins[index].y += 1
    bins[index].count += 1
  })

  return bins
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  }
}

function MatplotlibPlot({ plot, showDetails, onToggleDetails }) {
  if (!plot) return null

  return (
    <div className="space-y-3 rounded border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-semibold">
            {CHART_TYPES.find((type) => type.value === plot.chart_type)?.label || 'Plot'}
          </h4>
          <p className="text-xs text-slate-500">{plot.summary}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={onToggleDetails}>
          {showDetails ? 'Hide details' : 'Show details'}
        </button>
      </div>
      <button
        type="button"
        className="block w-full overflow-hidden rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900"
        onClick={onToggleDetails}
      >
        <img src={plot.image} alt={`${plot.chart_type} plot`} className="mx-auto w-full max-w-5xl" />
      </button>
      {showDetails && (
        <div className="space-y-3">
          {plot.chart_type === 'scatter' && plot.clusters?.length > 0 && (
            <div className="grid gap-2 md:grid-cols-3">
              {plot.clusters.map((cluster) => (
                <div key={cluster.cluster} className="rounded border border-slate-200 p-3 text-sm dark:border-slate-700">
                  <p className="font-semibold">
                    {plot.algorithm === 'knn' ? 'Class' : 'Cluster'} {cluster.cluster}
                    {cluster.label ? ` — ${cluster.label}` : ''}
                  </p>
                  <p className="text-slate-500">Points: {cluster.count}</p>
                  <p className="text-slate-500">
                    Center: {formatNumber(cluster.center_x)}, {formatNumber(cluster.center_y)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="max-h-80 overflow-auto rounded border border-slate-200 dark:border-slate-700">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  <th className="border px-2 py-1 text-left dark:border-slate-700">Item</th>
                  {plot.chart_type === 'scatter' && (
                    <th className="border px-2 py-1 text-left dark:border-slate-700">{plot.x_column}</th>
                  )}
                  <th className="border px-2 py-1 text-left dark:border-slate-700">
                    {plot.chart_type === 'histogram' ? 'Frequency' : plot.y_column}
                  </th>
                  {plot.chart_type === 'scatter' && plot.clusters?.length > 0 && (
                    <th className="border px-2 py-1 text-left dark:border-slate-700">
                      {plot.algorithm === 'knn' ? 'Class' : 'Cluster'}
                    </th>
                  )}
                  {'rows' in (plot.details?.[0] || {}) && (
                    <th className="border px-2 py-1 text-left dark:border-slate-700">Rows</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(plot.details || []).map((detail, index) => (
                  <tr key={`${detail.item}-${index}`}>
                    <td className="border px-2 py-1 dark:border-slate-700">{detail.item}</td>
                    {plot.chart_type === 'scatter' && (
                      <td className="border px-2 py-1 dark:border-slate-700">{formatNumber(detail.x)}</td>
                    )}
                    <td className="border px-2 py-1 dark:border-slate-700">{formatNumber(detail.value)}</td>
                    {plot.chart_type === 'scatter' && plot.clusters?.length > 0 && (
                      <td className="border px-2 py-1 dark:border-slate-700">
                        {plot.algorithm === 'knn' ? 'Class' : 'Cluster'} {detail.cluster}
                      </td>
                    )}
                    {'rows' in detail && <td className="border px-2 py-1 dark:border-slate-700">{detail.rows}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function getNumericColumnIndexes(headers, rows) {
  return headers
    .map((_, index) => index)
    .filter((index) =>
      rows.some((row) => {
        return Number.isFinite(parseNumericValue(row[index]))
      }),
    )
}

function parseNumericValue(value) {
  const cleaned = String(value ?? '')
    .trim()
    .replace(/,/g, '')
    .replace(/%$/g, '')
    .replace(/[^\d.-]/g, '')
  if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.') return Number.NaN
  return Number.parseFloat(cleaned)
}

function formatNumber(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })
}
