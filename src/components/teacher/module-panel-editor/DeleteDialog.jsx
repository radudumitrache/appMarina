/* ── DeleteDialog ───────────────────────────────────────────────────────────
 * Modal overlay confirming panel deletion. Clicking the backdrop cancels.
 *
 * Props:
 *   onConfirm {Function}
 *   onCancel  {Function}
 */
export default function DeleteDialog({ onConfirm, onCancel }) {
  return (
    <div className="lpe-overlay" onClick={onCancel}>
      <div className="lpe-dialog" onClick={e => e.stopPropagation()}>
        <h3 className="lpe-dialog-title">Delete this panel?</h3>
        <p className="lpe-dialog-body">
          This will also remove any anchors attached to it. This cannot be undone.
        </p>
        <div className="lpe-dialog-actions">
          <button className="lpe-dialog-cancel" onClick={onCancel}>Cancel</button>
          <button className="lpe-dialog-confirm" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}
