import Sk from '../../shared/Skeleton'
import UserRow from './UserRow'

export default function UsersTable({ loading, users, onEdit, onToggleStatus, onDelete }) {
  if (loading) {
    return (
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
    )
  }

  return (
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
