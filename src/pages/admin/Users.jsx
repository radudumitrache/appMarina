import { useState } from 'react'
import NavBar from '../../components/admin/NavBar'
import UsersSidebar from '../../components/admin/users/UsersSidebar'
import UsersToolbar from '../../components/admin/users/UsersToolbar'
import UserRow from '../../components/admin/users/UserRow'
import UserFormModal from '../../components/admin/users/UserFormModal'
import CsvImportModal from '../../components/admin/users/CsvImportModal'
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
  const [modal, setModal]           = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [csvRows, setCsvRows]       = useState([])

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

  const handleFormChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

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
                        onDelete={() => deleteUser(user.id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
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
          classes={CLASSES}
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
