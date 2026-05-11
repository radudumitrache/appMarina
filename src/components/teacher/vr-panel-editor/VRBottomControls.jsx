export default function VRBottomControls({
  moving, editMode, pendingCoords, placing, locStep, pendingLocPoints,
  onCancelMove, onToggleEditMode,
}) {
  return (
    <div className="vrpe-bottom-controls">
      {moving ? (
        <>
          <button className="vrpe-place-btn vrpe-place-btn--on" onClick={onCancelMove}>
            Cancel move
          </button>
          <span className="vrpe-place-hint">Click in the scene to set the new position</span>
        </>
      ) : (
        <>
          <button
            className={`vrpe-place-btn${editMode ? ' vrpe-place-btn--on' : ''}`}
            onClick={onToggleEditMode}
          >
            {editMode ? 'Exit placement mode' : '+ Place anchor'}
          </button>
          {editMode && !pendingCoords && placing !== 'loc' && (
            <span className="vrpe-place-hint">Click anywhere in the scene to drop an anchor</span>
          )}
          {placing === 'loc' && locStep === 'drawing' && (
            <span className="vrpe-place-hint">
              {pendingLocPoints.length < 3
                ? `${pendingLocPoints.length}/3 vertices — click to add more`
                : `${pendingLocPoints.length} vertices — click "Set polygon →" to continue`}
            </span>
          )}
        </>
      )}
    </div>
  )
}
