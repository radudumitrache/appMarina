import Sk from '../../shared/Skeleton'
import UserRow from './UserRow'

const COLUMNS = [
  { label: 'Name',         key: 'name' },
  { label: 'Role',         key: 'role' },
  { label: 'Email',        key: 'email' },
  { label: 'Organisation', key: 'organisation_name' },
  { label: 'Status',       key: 'status' },
]

function SortIcon({ active, dir }) {
  if (!active) return (
    <svg className="sort-icon sort-icon--idle" width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 2L2 5h6L5 2z" fill="currentColor" opacity="0.35"/>
      <path d="M5 8L8 5H2l3 3z" fill="currentColor" opacity="0.35"/>
    </svg>
  )
  return dir === 'asc'
    ? (
      <svg className="sort-icon sort-icon--active" width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 2L2 6h6L5 2z" fill="currentColor"/>
      </svg>
    ) : (
      <svg className="sort-icon sort-icon--active" width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 8L8 4H2l3 4z" fill="currentColor"/>
      </svg>
    )
}

export default function UsersTable({ loading, users, sortKey, sortDir, onSort, onEdit, onToggleStatus, onDelete }) {
  const thead = (
    <thead>
      <tr>
        {COLUMNS.map(({ label, key }) => (
          <th
            key={key}
            className={`th-sortable${sortKey === key ? ' th-sortable--active' : ''}`}
            onClick={() => onSort(key)}
          >
            {label}
            <SortIcon active={sortKey === key} dir={sortDir} />
          </th>
        ))}
        <th></th>
      </tr>
    </thead>
  )

  if (loading) {
    return (
      <table className="users-table">
        {thead}
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
    )
  }

  return (
    <table className="users-table">
      {thead}
      <tbody>
        {users.length === 0 ? (
          <tr><td colSpan={6} className="users-empty">No users found.</td></tr>
        ) : (
          users.map((user, i) => (
            <UserRow
              key={user.id}
              user={user}
              index={i}
              onEdit={() => onEdit(user)}
              onToggleStatus={() => onToggleStatus(user.id)}
              onDelete={() => onDelete(user.id)}
            />
          ))
        )}
      </tbody>
    </table>
  )
}
