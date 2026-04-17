import { useState, useRef } from 'react'
import NavBar from '../../components/admin/NavBar'
import '../css/admin/Users.css'

const CLASSES = ['SEC-2024-A', 'SEC-2024-B', 'SEC-2024-C', 'SEC-2023-A']

let nextId = 13
const INITIAL_USERS = [
  { id: 1,  name: 'Alice Chen',      email: 'alice@seafarer.edu',     role: 'student', className: 'SEC-2024-A', status: 'active'   },
  { id: 2,  name: 'Bob Martinez',    email: 'bob@seafarer.edu',       role: 'student', className: 'SEC-2024-A', status: 'active'   },
  { id: 3,  name: 'Clara Novak',     email: 'clara@seafarer.edu',     role: 'student', className: 'SEC-2024-B', status: 'active'   },
  { id: 4,  name: 'Daniel Park',     email: 'daniel@seafarer.edu',    role: 'student', className: 'SEC-2024-B', status: 'inactive' },
  { id: 5,  name: 'Eva Rossi',       email: 'eva@seafarer.edu',       role: 'student', className: 'SEC-2024-A', status: 'active'   },
  { id: 6,  name: 'Frank Okafor',    email: 'frank@seafarer.edu',     role: 'student', className: 'SEC-2024-C', status: 'active'   },
  { id: 7,  name: 'Grace Yamamoto',  email: 'grace@seafarer.edu',     role: 'student', className: 'SEC-2023-A', status: 'active'   },
  { id: 8,  name: 'Hugo Brennan',    email: 'hugo@seafarer.edu',      role: 'student', className: 'SEC-2024-C', status: 'inactive' },
  { id: 9,  name: 'Capt. Rodriguez', email: 'rodriguez@seafarer.edu', role: 'teacher', className: '—',         status: 'active'   },
  { id: 10, name: 'Prof. Whitmore',  email: 'whitmore@seafarer.edu',  role: 'teacher', className: '—',         status: 'active'   },
  { id: 11, name: 'Instr. Chen',     email: 'i.chen@seafarer.edu',    role: 'teacher', className: '—',         status: 'active'   },
  { id: 12, name: 'Eng. Vasquez',    email: 'vasquez@seafarer.edu',   role: 'teacher', className: '—',         status: 'inactive' },
]

const EMPTY_FORM = { name: '', email: '', role: 'student', className: 'SEC-2024-A', password: '' }

function parseCSV(raw) {
  const lines = raw.trim().split('\n').filter(Boolean)
  const header = lines[0].toLowerCase()
  const start = header.includes('name') || header.includes('email') ? 1 : 0
  return lines.slice(start).map(line => {
    const [name = '', email = '', role = '', cls = ''] =
      line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
    return {
      name,
      email,
      role: role.toLowerCase() === 'teacher' ? 'teacher' : 'student',
      className: cls || 'SEC-2024-A',
    }
  }).filter(r => r.name && r.email)
}

export default function Users() {
  const [users, setUsers]           = useState(INITIAL_USERS)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modal, setModal]           = useState(null) // null | 'create' | 'edit' | 'csv'
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [csvRows, setCsvRows]       = useState([])
  const fileRef                     = useRef(null)

  const counts = {
    all:     users.length,
    student: users.filter(u => u.role === 'student').length,
    teacher: users.filter(u => u.role === 'teacher').length,
  }

  const filtered = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }

  const openEdit = (user) => {
    setEditTarget(user)
    setForm({ name: user.name, email: user.email, role: user.role, className: user.className, password: '' })
    setModal('edit')
  }

  const closeModal = () => { setModal(null); setEditTarget(null); setCsvRows([]) }

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    if (modal === 'create') {
      setUsers(prev => [...prev, { id: nextId++, ...form, status: 'active' }])
    } else if (modal === 'edit' && editTarget) {
      setUsers(prev => prev.map(u => u.id === editTarget.id ? { ...u, ...form } : u))
    }
    closeModal()
  }

  const toggleStatus = (id) =>
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ))

  const deleteUser = (id) => setUsers(prev => prev.filter(u => u.id !== id))

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => setCsvRows(parseCSV(evt.target.result))
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => setCsvRows(parseCSV(evt.target.result))
    reader.readAsText(file)
  }

  const handleCSVImport = () => {
    setUsers(prev => [...prev, ...csvRows.map(r => ({ id: nextId++, ...r, status: 'active' }))])
    closeModal()
  }

  const downloadTemplate = () => {
    const csv = 'name,email,role,class\nJohn Doe,john@seafarer.edu,student,SEC-2024-A\nJane Smith,jane@seafarer.edu,teacher,—\n'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'users_template.csv'
    a.click()
  }

  const sidebarLabel = roleFilter === 'student' ? 'Students'
    : roleFilter === 'teacher' ? 'Teachers'
    : 'All Users'

  return (
    <div className="users-page">
      <div className="users-layout">
        <NavBar />
        <div className="users-body">

          {/* ─── Sidebar ─────────────────────────────────────────────── */}
          <aside className="sidebar">
            <nav className="sidebar-nav">
              {[
                { id: 'all',     label: 'All Users' },
                { id: 'student', label: 'Students'  },
                { id: 'teacher', label: 'Teachers'  },
              ].map(r => (
                <button
                  key={r.id}
                  className={`sidebar-btn ${roleFilter === r.id ? 'sidebar-btn--active' : ''}`}
                  onClick={() => setRoleFilter(r.id)}
                >
                  <div className="sidebar-btn-row">
                    <span className="sidebar-label">{r.label}</span>
                    <span className="sidebar-count">{counts[r.id]}</span>
                  </div>
                </button>
              ))}
            </nav>

            <div className="sidebar-stat">
              <div className="sidebar-stat-bar">
                <div
                  className="sidebar-stat-fill"
                  style={{ width: `${counts.all ? (counts.student / counts.all) * 100 : 0}%` }}
                />
              </div>
              <span className="sidebar-stat-text">
                <span className="sidebar-stat-num">{counts.student}</span>
                {' '}students /{' '}
                <span className="sidebar-stat-num">{counts.teacher}</span>
                {' '}teachers
              </span>
            </div>
          </aside>

          {/* ─── Main ─────────────────────────────────────────────────── */}
          <main className="users-main">

            <div className="users-head">
              <h2 className="users-title">{sidebarLabel}</h2>
              <span className="users-count">{filtered.length} users</span>
              <div className="users-actions">
                <button className="btn-secondary" onClick={() => setModal('csv')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Import CSV
                </button>
                <button className="btn-primary" onClick={openCreate}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  New User
                </button>
              </div>
            </div>

            <div className="users-toolbar">
              <div className="search-wrap">
                <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="search-clear" onClick={() => setSearch('')}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Class</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="users-empty">No users found.</td></tr>
                  ) : (
                    filtered.map((user, i) => (
                      <tr
                        key={user.id}
                        className="user-row"
                        style={{ animationDelay: `${Math.min(i, 12) * 0.025}s` }}
                      >
                        <td className="user-name">{user.name}</td>
                        <td>
                          <span className={`role-badge role-badge--${user.role}`}>{user.role}</span>
                        </td>
                        <td className="user-email">{user.email}</td>
                        <td className="user-class">{user.className}</td>
                        <td>
                          <span className={`status-dot status-dot--${user.status}`} />
                          <span className="status-label">{user.status}</span>
                        </td>
                        <td className="user-row-actions">
                          <button className="row-btn" onClick={() => openEdit(user)} title="Edit user">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            className={`row-btn ${user.status === 'active' ? 'row-btn--warn' : 'row-btn--ok'}`}
                            onClick={() => toggleStatus(user.id)}
                            title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {user.status === 'active' ? (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                              </svg>
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </button>
                          <button className="row-btn row-btn--delete" onClick={() => deleteUser(user.id)} title="Delete user">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </main>
        </div>
      </div>

      {/* ─── Create / Edit modal ──────────────────────────────────────────── */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'create' ? 'New User' : 'Edit User'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Jane Smith"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="e.g. jane@seafarer.edu"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <label className="form-label">Role</label>
                <div className="form-radio-group">
                  {['student', 'teacher'].map(r => (
                    <label
                      key={r}
                      className={`form-radio ${form.role === r ? 'form-radio--active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="user-role"
                        value={r}
                        checked={form.role === r}
                        onChange={() => setForm(f => ({
                          ...f,
                          role: r,
                          className: r === 'teacher' ? '—' : 'SEC-2024-A',
                        }))}
                      />
                      <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
              {form.role === 'student' && (
                <div className="form-row">
                  <label className="form-label">Class</label>
                  <select
                    className="form-select"
                    value={form.className}
                    onChange={e => setForm(f => ({ ...f, className: e.target.value }))}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              <div className="form-row">
                <label className="form-label">
                  Password
                  {modal === 'edit' && <span className="form-hint"> — leave blank to keep current</span>}
                </label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={!form.name.trim() || !form.email.trim()}
              >
                {modal === 'create' ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CSV import modal ─────────────────────────────────────────────── */}
      {modal === 'csv' && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Import Users from CSV</h3>
              <button className="modal-close" onClick={closeModal}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="csv-hint">
                Columns: <code className="csv-code">name, email, role, class</code>.
                {' '}Role must be <code className="csv-code">student</code> or <code className="csv-code">teacher</code>.{' '}
                <button className="link-btn" onClick={downloadTemplate}>Download template</button>
              </p>
              <div
                className={`csv-drop-zone ${csvRows.length > 0 ? 'csv-drop-zone--loaded' : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span className="csv-drop-label">
                  {csvRows.length > 0
                    ? `${csvRows.length} rows parsed — click to replace`
                    : 'Click to select or drop a CSV file'}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              {csvRows.length > 0 && (
                <div className="csv-preview">
                  <p className="csv-preview-label">{csvRows.length} users ready to import</p>
                  <div className="csv-preview-scroll">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Class</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.map((r, i) => (
                          <tr key={i}>
                            <td className="user-name">{r.name}</td>
                            <td className="user-email">{r.email}</td>
                            <td><span className={`role-badge role-badge--${r.role}`}>{r.role}</span></td>
                            <td className="user-class">{r.className}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleCSVImport}
                disabled={csvRows.length === 0}
              >
                Import {csvRows.length > 0 ? `${csvRows.length} Users` : 'Users'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
