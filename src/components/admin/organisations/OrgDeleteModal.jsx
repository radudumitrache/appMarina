import '../../css/admin/classes/ClassFormModal.css'

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function OrgDeleteModal({ target, entityLabel = 'Organisation', onClose, onConfirm, deleting }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Delete {entityLabel}</h3>
          <button className="modal-close" onClick={onClose}><XIcon /></button>
        </div>
        <div className="modal-body">
          <p className="confirm-text">
            Are you sure you want to delete{' '}
            <strong className="confirm-name">{target.name}</strong>?
            {target.member_count > 0 && (
              <> Members ({target.member_count}) will be unassigned but not deleted.</>
            )}{' '}
            This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : `Delete ${entityLabel}`}
          </button>
        </div>
      </div>
    </div>
  )
}
