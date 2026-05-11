import { useState, useEffect } from 'react'
import NavBar from '../../components/admin/NavBar'
import UsersSidebar from '../../components/admin/users/UsersSidebar'
import UsersToolbar from '../../components/admin/users/UsersToolbar'
import UserRow from '../../components/admin/users/UserRow'
import UserFormModal from '../../components/admin/users/UserFormModal'
import CsvImportModal from '../../components/admin/users/CsvImportModal'
import { getUsers, createUser, bulkCreateUsers, updateUser, deleteUser } from '../../api/admin'
import Sk from '../../components/shared/Skeleton'
import '../css/admin/Users.css'

const EMPTY_FORM = { name: '', email: '', role: 'student', password: '' }

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
    const [name = '', email = '', role = ''] =
      line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
    return {
      name,
      email,
      role: role.toLowerCase() === 'teacher' ? 'teacher' : 'student',
    }
  }).filter(r => r.name && r.email)
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

  useEffect(() => {
    getUsers()
      .then(res => setUsers(res.data.map(mapUser)))
      .catch(() => {})
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
    setForm({ name: user.name, email: user.email, role: user.role, password: '' })
    setModal('edit')
  }

  const closeModal = () => { setModal(null); setEditTarget(null); setCsvRows([]) }

  const handleFormChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    const [firstName, ...rest] = form.name.trim().split(' ')
    const payload = {
      first_name: firstName,
      last_name: rest.join(' '),
      email: form.email,
      role: form.role,
      ...(form.password && { password: form.password }),
    }
    try {
      if (modal === 'create') {
        const { data } = await createUser({ ...payload, username: form.email.split('@')[0] })
        setUsers(prev => [...prev, mapUser(data)])
      } else if (modal === 'edit' && editTarget) {
        const { data } = await updateUser(editTarget.id, payload)
        setUsers(prev => prev.map(u => u.id === editTarget.id ? mapUser(data) : u))
      }
      closeModal()
    } catch {}
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
        return { first_name: firstName, last_name: rest.join(' '), email: r.email, role: r.role }
      }),
    }
    try {
      const { data } = await bulkCreateUsers(payload)
      setUsers(prev => [...prev, ...data.users.map(mapUser)])
      if (data.errors.length > 0)
        console.warn('Some users could not be imported:', data.errors)
    } catch {}
    closeModal()
  }

  const downloadTemplate = () => {
    const csv = 'name,email,role\nJohn Doe,john@seafarer.edu,student\nJane Smith,jane@seafarer.edu,teacher\n'
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

            <div className="users-table-wrap">
              {loading ? (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Role</th><th>Email</th><th>Class</th><th>Status</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} style={{ opacity: 1 - i * 0.09 }}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Sk w={32} h={32} r={16} style={{ flexShrink: 0 }} />
                          <div><Sk w={110} h={13} mb={5} /><Sk w={80} h={11} /></div>
                        </div></td>
                        <td><Sk w={58} h={20} r={4} /></td>
                        <td><Sk w={150} h={13} /></td>
                        <td><Sk w={70}  h={13} /></td>
                        <td><Sk w={55}  h={20} r={10} /></td>
                        <td><div style={{ display: 'flex', gap: 4 }}>
                          <Sk w={28} h={28} r={6} /><Sk w={28} h={28} r={6} />
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
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
                        <UserRow
                          key={user.id}
                          user={user}
                          index={i}
                          onEdit={() => openEdit(user)}
                          onToggleStatus={() => toggleStatus(user.id)}
                          onDelete={() => handleDelete(user.id)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              )}
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
          classes={[]}
        />
      )}

      {modal === 'csv' && (
        <CsvImportModal
          csvRows={csvRows}
          onClose={closeModal}
          onImport={handleCSVImport}
          onFileParsed={(raw) => setCsvRows(parseCSV(raw))}
          onDownloadTemplate={downloadTemplate}
        />
      )}
    </div>
  )
}
