import { useState, useEffect } from 'react'
import NavBar from '../../components/admin/NavBar'
import UsersSidebar from '../../components/admin/users/UsersSidebar'
import UsersToolbar from '../../components/admin/users/UsersToolbar'
import UserFormModal from '../../components/admin/users/UserFormModal'
import CsvImportModal from '../../components/admin/users/CsvImportModal'
import UsersTable from '../../components/admin/users/UsersTable'
import { getUsers, createUser, bulkCreateUsers, updateUser, deleteUser } from '../../api/admin'
import '../css/admin/Users.css'

const EMPTY_FORM = { name: '', username: '', email: '', role: 'student', password: '' }

function mapUser(u) {
  const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username
  return {
    id: u.id,
    name: fullName,
    username: u.username,
    email: u.email,
    role: u.profile?.role ?? 'student',
    className: '—',
    status: u.profile?.account_status === 'suspended' ? 'inactive' : 'active',
  }
}

function parseCSV(raw) {
  const lines = raw.trim().split('\n').filter(Boolean)
  const header = lines[0].toLowerCase()
  const start = header.includes('name') || header.includes('email') ? 1 : 0
  return lines.slice(start).map(line => {
    const [name = '', username = '', email = '', role = ''] =
      line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
    return {
      name,
      username,
      email,
      role: role.toLowerCase() === 'teacher' ? 'teacher' : 'student',
    }
  }).filter(r => r.name && r.username && r.email)
}

export default function Users() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modal, setModal]           = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [csvRows, setCsvRows]       = useState([])
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')
  const [loadError, setLoadError]   = useState('')
  const [importing, setImporting]   = useState(false)

  useEffect(() => {
    getUsers()
      .then(res => setUsers(res.data.map(mapUser)))
      .catch(err => {
        const status = err?.response?.status
        setLoadError(status === 403 ? 'Permission denied. Make sure your account has admin access.' : 'Failed to load users.')
      })
      .finally(() => setLoading(false))
  }, [])

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
    setForm({ name: user.name, username: user.username, email: user.email, role: user.role, password: '' })
    setModal('edit')
  }

  const closeModal = () => { setModal(null); setEditTarget(null); setCsvRows([]); setFormError('') }

  const handleFormChange = (field, value) => { setForm(f => ({ ...f, [field]: value })); setFormError('') }

  const handleSave = async () => {
    if (!form.name.trim() || !form.username.trim() || !form.email.trim()) return
    if (modal === 'create' && !form.password) { setFormError('Password is required.'); return }
    if (form.password && form.password.length < 8) { setFormError('Password must be at least 8 characters.'); return }

    const [firstName, ...rest] = form.name.trim().split(' ')
    const payload = {
      first_name: firstName,
      last_name: rest.join(' '),
      username: form.username.trim(),
      email: form.email,
      role: form.role,
      ...(form.password && { password: form.password }),
    }
    setSaving(true)
    setFormError('')
    try {
      if (modal === 'create') {
        const { data } = await createUser(payload)
        setUsers(prev => [...prev, mapUser(data)])
      } else if (modal === 'edit' && editTarget) {
        const { data } = await updateUser(editTarget.id, payload)
        setUsers(prev => prev.map(u => u.id === editTarget.id ? mapUser(data) : u))
      }
      closeModal()
    } catch (err) {
      const d = err?.response?.data
      if (d) {
        const msg = typeof d === 'string' ? d
          : d.detail ?? Object.entries(d).map(([k, v]) => `${k}: ${[].concat(v).join(', ')}`).join(' | ')
        setFormError(msg)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (id) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    const apiStatus  = user.status === 'active' ? 'suspended' : 'active'
    const uiStatus   = apiStatus === 'suspended' ? 'inactive' : 'active'
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: uiStatus } : u))
    try {
      await updateUser(id, { account_status: apiStatus })
    } catch {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: user.status } : u))
    }
  }

  const handleDelete = async (id) => {
    const snapshot = users
    setUsers(prev => prev.filter(u => u.id !== id))
    try {
      await deleteUser(id)
    } catch {
      setUsers(snapshot)
    }
  }

  const handleCSVImport = async (password) => {
    const payload = {
      password,
      users: csvRows.map(r => {
        const [firstName, ...rest] = r.name.trim().split(' ')
        return { first_name: firstName, last_name: rest.join(' '), username: r.username, email: r.email, role: r.role }
      }),
    }
    setImporting(true)
    try {
      const { data } = await bulkCreateUsers(payload)
      setUsers(prev => [...prev, ...data.users.map(mapUser)])
      if (data.errors.length > 0)
        console.warn('Some users could not be imported:', data.errors)
      closeModal()
    } catch (err) {
      console.error('CSV import failed:', err)
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const csv = 'name,username,email,role\nJohn Doe,johndoe,john@hansa360.com,student\nJane Smith,janesmith,jane@hansa360.com,teacher\n'
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

          <UsersSidebar
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            counts={counts}
          />

          <main className="users-main">
            <UsersToolbar
              title={sidebarLabel}
              filteredCount={filtered.length}
              search={search}
              onSearchChange={setSearch}
              onImportCSV={() => setModal('csv')}
              onNewUser={openCreate}
            />

            {loadError && <div className="users-load-error">{loadError}</div>}
            <div className="users-table-wrap">
              <UsersTable
                loading={loading}
                users={filtered}
                onEdit={openEdit}
                onToggleStatus={toggleStatus}
                onDelete={handleDelete}
              />
            </div>
          </main>
        </div>
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <UserFormModal
          mode={modal}
          form={form}
          onChange={handleFormChange}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
          error={formError}
          classes={[]}
        />
      )}

      {modal === 'csv' && (
        <CsvImportModal
          csvRows={csvRows}
          importing={importing}
          onClose={closeModal}
          onImport={handleCSVImport}
          onFileParsed={(raw) => setCsvRows(parseCSV(raw))}
          onDownloadTemplate={downloadTemplate}
        />
      )}
    </div>
  )
}
