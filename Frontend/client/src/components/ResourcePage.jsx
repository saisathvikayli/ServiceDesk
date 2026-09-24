import { useEffect, useMemo, useState, useCallback } from 'react'
import { Edit3, Plus, Search, Trash2, X } from 'lucide-react'
import api, { getErrorMessage } from '../lib/api'

function ResourcePage({ token, config }) {
  const {
    endpoint,
    title,
    eyebrow,
    description,
    singular,
    icon: Icon,
    fields,
    columns,
    canCreate = true,
  } = config

  const [records, setRecords] = useState([])
  const [form, setForm] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      setRecords(response.data)
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }, [endpoint, token])

  useEffect(() => {
    load()
  }, [load])

  const visibleRecords = useMemo(
    () =>
      records.filter((record) =>
        JSON.stringify(record).toLowerCase().includes(search.toLowerCase())
      ),
    [records, search]
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? ''])))
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditingId(record._id)
    setForm(Object.fromEntries(fields.map((field) => [field.name, record[field.name] ?? ''])))
    setModalOpen(true)
  }

  const closeModal = () => {
    if (!saving) setModalOpen(false)
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      const configHeaders = { headers: { Authorization: `Bearer ${token}` } }
      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, form, configHeaders)
      } else {
        await api.post(endpoint, form, configHeaders)
      }
      setModalOpen(false)
      setNotice({
        type: 'success',
        text: `${singular} ${editingId ? 'updated' : 'created'} successfully.`,
      })
      await load()
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm(`Delete this ${singular.toLowerCase()}?`)) return
    try {
      await api.delete(`${endpoint}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setNotice({ type: 'success', text: `${singular} deleted successfully.` })
      await load()
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) })
    }
  }

  const displayValue = (record, column) => {
    const value = record[column.key]
    if (value === undefined || value === null || value === '') return '—'
    if (column.render) return column.render(value, record)
    return String(value)
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#147a76]">
            {eyebrow}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center bg-[#eaf6f3] text-[#147a76]">
              <Icon size={23} />
            </span>
            <h1 className="text-4xl font-extrabold tracking-[-0.07em] sm:text-5xl">{title}</h1>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#718087]">{description}</p>
        </div>
        {canCreate && (
          <button
            className="flex h-11 items-center gap-2 bg-[#147a76] px-4 text-xs font-extrabold text-white hover:bg-[#0c5b59]"
            type="button"
            onClick={openCreate}
          >
            <Plus size={16} /> New {singular}
          </button>
        )}
      </div>

      {notice && (
        <div
          className={`mb-6 flex justify-between border-l-2 px-4 py-3 text-sm ${
            notice.type === 'error'
              ? 'border-[#bd4b46] bg-[#fff5f4] text-[#a43e3a]'
              : 'border-[#147a76] bg-[#eaf6f3] text-[#0c5b59]'
          }`}
        >
          {notice.text}
          <button type="button" onClick={() => setNotice(null)} title="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="border border-[#dce5e2] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5e2] px-5 py-4">
          <h2 className="text-base font-extrabold tracking-[-0.03em]">
            {records.length} {singular.toLowerCase()}
            {records.length === 1 ? '' : 's'}
          </h2>
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8a8]" size={15} />
            <input
              className="h-9 w-56 border border-[#dce5e2] bg-[#f5f7f6] pl-9 pr-3 text-xs outline-none focus:border-[#147a76]"
              aria-label={`Search ${title}`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}`}
            />
          </label>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-[#718087]">
            Loading {title.toLowerCase()}...
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-[#718087]">
            <Icon size={30} className="text-[#147a76]" />
            <strong className="text-sm text-[#17252a]">No {title.toLowerCase()} found</strong>
            <span className="text-xs">
              {search ? 'Try a different search.' : `Create the first ${singular.toLowerCase()} to get started.`}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-b border-[#dce5e2] bg-[#f8faf9]">
                  {columns.map((column) => (
                    <th
                      className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#718087]"
                      key={column.key}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr className="border-b border-[#edf1ef] hover:bg-[#fbfcfb]" key={record._id}>
                    {columns.map((column) => (
                      <td className="px-5 py-4 text-sm" key={column.key}>
                        {column.badge ? (
                          <span className="rounded-full bg-[#eaf6f3] px-2 py-1 font-mono text-[10px] uppercase text-[#0c5b59]">
                            {displayValue(record, column)}
                          </span>
                        ) : (
                          displayValue(record, column)
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          className="flex h-8 w-8 items-center justify-center text-[#147a76] hover:bg-[#eaf6f3]"
                          type="button"
                          onClick={() => openEdit(record)}
                          title={`Edit ${singular}`}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="flex h-8 w-8 items-center justify-center text-[#bd4b46] hover:bg-[#fff5f4]"
                          type="button"
                          onClick={() => remove(record._id)}
                          title={`Delete ${singular}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17252a]/40 p-5">
          <form className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6 sm:p-8" onSubmit={save}>
            <div className="mb-7 flex items-start justify-between">
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#147a76]">
                  {editingId ? 'Edit record' : 'New record'}
                </p>
                <h2 className="text-2xl font-extrabold tracking-[-0.05em]">
                  {editingId ? `Edit ${singular}` : `New ${singular}`}
                </h2>
              </div>
              <button type="button" onClick={closeModal} title="Close">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4">
              {fields.map((field) => (
                <label className="grid gap-2 text-xs font-bold" key={field.name}>
                  {field.label}
                  {field.type === 'select' ? (
                    <select
                      className="h-11 border border-[#dce5e2] bg-[#f5f7f6] px-3 text-sm font-normal outline-none focus:border-[#147a76]"
                      value={form[field.name] || ''}
                      onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                      required={field.required}
                    >
                      {field.options.map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="min-h-28 border border-[#dce5e2] bg-[#f5f7f6] px-3 py-2 text-sm font-normal outline-none focus:border-[#147a76]"
                      value={form[field.name] || ''}
                      onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      className="h-11 border border-[#dce5e2] bg-[#f5f7f6] px-3 text-sm font-normal outline-none focus:border-[#147a76]"
                      type={field.type || 'text'}
                      value={form[field.name] || ''}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          [field.name]: field.type === 'number' ? Number(event.target.value) : event.target.value,
                        })
                      }
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-2">
              <button className="h-11 border border-[#dce5e2] px-4 text-xs font-bold" type="button" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="h-11 bg-[#147a76] px-5 text-xs font-extrabold text-white hover:bg-[#0c5b59]"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : editingId ? 'Save changes' : `Create ${singular.toLowerCase()}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default ResourcePage