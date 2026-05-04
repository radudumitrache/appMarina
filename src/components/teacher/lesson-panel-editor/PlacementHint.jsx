const MODE_LABELS = {
  text:         'text anchor',
  nav:          'navigator anchor',
  poly_pt:      'new point',
  poly_pt_move: 'point (new position)',
}

export default function PlacementHint({ placementMode, polyPoints, onUndo, onFinish, onCancelPoly, onCancelSimple }) {
  if (placementMode === 'poly') {
    return (
      <div className="lpe-placement-hint">
        <span>
          {polyPoints.length === 0
            ? 'Click on the scene to place polygon vertices'
            : `${polyPoints.length} ${polyPoints.length === 1 ? 'vertex' : 'vertices'} — click to add more`}
        </span>
        {polyPoints.length > 0 && (
          <button className="lpe-placement-undo" onClick={onUndo}>Undo</button>
        )}
        <button
          className="lpe-placement-finish"
          onClick={onFinish}
          disabled={polyPoints.length < 3}
        >
          Finish{polyPoints.length >= 3 ? ` (${polyPoints.length})` : ''}
        </button>
        <button className="lpe-placement-cancel" onClick={onCancelPoly}>Cancel</button>
      </div>
    )
  }

  return (
    <div className="lpe-placement-hint">
      <span>Click on the scene to place the {MODE_LABELS[placementMode] ?? 'anchor'}</span>
      <button className="lpe-placement-cancel" onClick={onCancelSimple}>Cancel</button>
    </div>
  )
}
