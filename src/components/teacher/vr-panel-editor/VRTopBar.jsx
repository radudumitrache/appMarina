export default function VRTopBar({
  panelTitle, sceneUrl, allCount, anchorDrawer, saving,
  onBack, onOpenSceneModal, onToggleDrawer,
}) {
  return (
    <div className="vrpe-topbar">
      <button className="vrpe-back-btn" onClick={onBack}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>

      <span className="vrpe-panel-title">{panelTitle}</span>

      <div className="vrpe-topbar-right">
        {sceneUrl && <span className="vrpe-scene-status">360° active</span>}
        <button className="vrpe-scene-btn" onClick={onOpenSceneModal} disabled={saving}>
          {sceneUrl ? 'Change Scene' : 'Select Scene'}
        </button>
        {allCount > 0 && (
          <button
            className={`vrpe-anchors-toggle${anchorDrawer ? ' vrpe-anchors-toggle--on' : ''}`}
            onClick={onToggleDrawer}
          >
            Anchors ({allCount})
          </button>
        )}
      </div>
    </div>
  )
}
