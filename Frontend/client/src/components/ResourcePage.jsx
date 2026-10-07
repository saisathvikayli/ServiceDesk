import { useState, useEffect, useContext, useCallback } from 'react'
import { AuthContext } from '../context/AuthContext'
import { resourceConfigs } from '../appConfig'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, AlertCircle } from 'lucide-react'

export default function ResourcePage({ resourceKey, config: passedConfig }) {
  const { user } = useContext(AuthContext)
  const config = passedConfig || resourceConfigs[resourceKey]

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({})

  const initFormData = useCallback(() => {
    if (!config) return
    const initial = {}
    config.fields.forEach((f) => {
      initial[f.name] = f.defaultValue !== undefined ? f.defaultValue : ''
    })
    setFormData(initial)
  }, [config])

  const fetchItems = useCallback(async () => {
    if (!config) return
    try {
      setLoading(true)
      setErrorMsg(null)
      const res = await api.get(config.endpoint)
      const raw = res?.data ?? res
      const list = Array.isArray(raw) ? raw : raw?.data || []
      setItems(list)
    } catch (err) {
      console.error(`Failed to load ${config.singular || resourceKey}:`, err)
      const status = err?.response?.status
      if (status === 403) {
        setErrorMsg('Access Restricted: Your user role does not have permission to view this page.')
      } else {
        setErrorMsg('Failed to load data. Please verify backend server route.')
      }
    } finally {
      setLoading(false)
    }
  }, [config, resourceKey])

  useEffect(() => {
    if (config) {
      fetchItems()
      initFormData()
    }
  }, [config, fetchItems, initFormData])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post(config.endpoint, formData)
      toast.success(`${config.singular} created successfully`)
      setShowModal(false)
      initFormData()
      fetchItems()
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to create ${config.singular}`)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      await api.delete(`${config.endpoint}/${id}`)
      toast.success(`${config.singular} deleted`)
      fetchItems()
    } catch {
      toast.error(`Failed to delete ${config.singular}`)
    }
  }

  if (!config) {
    return <div className="p-8 text-center text-gray-500">Resource configuration not found.</div>
  }

  const Icon = config.icon
  const canCreate = !config.canCreateRoles || config.canCreateRoles.includes(user?.role)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[#0c5b59] uppercase tracking-wider">{config.eyebrow}</span>
          <h1 className="text-2xl font-bold text-[#17252a] flex items-center gap-2 mt-1">
            {Icon && <Icon size={24} className="text-[#0c5b59]" />}
            {config.title}
          </h1>
          <p className="text-sm text-[#718087] mt-1">{config.description}</p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#0c5b59] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#094745] transition self-start sm:self-auto"
          >
            <Plus size={16} /> Add {config.singular}
          </button>
        )}
      </div>

      {/* Error / Restricted Warning */}
      {errorMsg && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-[#dce5e2] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm font-mono">Loading data...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No {config.title.toLowerCase()} found. {canCreate && 'Click "Add" above to create one.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#f5f7f6] border-b border-[#dce5e2] text-[#718087] font-semibold text-xs uppercase tracking-wider">
                  {config.columns.map((col) => (
                    <th key={col.key} className="p-3.5">
                      {col.label}
                    </th>
                  ))}
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5e2]">
                {items.map((item) => {
                  const itemId = item._id || item.id
                  return (
                    <tr key={itemId} className="hover:bg-gray-50 transition">
                      {config.columns.map((col) => {
                        const val = item[col.key]
                        return (
                          <td key={col.key} className="p-3.5 text-[#17252a]">
                            {col.render
                              ? col.render(val, item)
                              : col.badge ? (
                                  <span className="bg-[#eaf6f3] text-[#0c5b59] font-semibold text-xs px-2 py-0.5 rounded">
                                    {String(val)}
                                  </span>
                                ) : (
                                  String(val ?? '-')
                                )}
                          </td>
                        )
                      })}
                      <td className="p-3.5 text-right">
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(itemId)}
                            className="text-red-500 hover:text-red-700 p-1 transition"
                            title="Delete item"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg border max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#17252a]">Add New {config.singular}</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              {config.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-[#718087] mb-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full text-xs p-2 border rounded bg-white"
                      required={field.required}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full text-xs p-2 border rounded"
                      rows={3}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full text-xs p-2 border rounded"
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-[#0c5b59] text-white rounded font-semibold"
                >
                  Save {config.singular}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}