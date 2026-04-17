import { useState, useEffect } from 'react'
import { VR_SCENES, buildSceneUrl } from '../../shared/VRSceneRenderer'
import AnchorSection from './AnchorSection'
import { IconClose } from './LPEIcons'

/* ── EditDrawer ─────────────────────────────────────────────────────────────
 * Slide-in panel for editing a single lesson panel's title, content/scene,
 * and (for VR panels) its anchors.
 *
 * Props:
 *   panel           {object}    The panel being edited.
 *   onSave          {Function}  (panelId, data) → void
 *   onClose         {Function}
 *   saving          {boolean}
 *   lessonId        {string}
 *   onAnchorsChange {Function}  (textAnchors, navAnchors, polyAnchors) → void
 */
export default function EditDrawer({ panel, onSave, onClose, saving, lessonId, onAnchorsChange, focusAnchor, onEnterPlacement, newAnchorPlacement, onNewAnchorSaved, newPolyPlacement, onNewPolySaved, newPolyPoint, onNewPolyPointSaved, onActivePolyPointsChange }) {
  const [title,    setTitle]    = useState(panel.title ?? '')
  const [body,     setBody]     = useState(panel.text_content?.body ?? '')
  const [sceneUrl, setSceneUrl] = useState(() => {
    const raw = panel.vr_tour?.scene_url ?? ''
    return decodeURIComponent(raw.split('/').pop()) || VR_SCENES[0].filename
  })

  useEffect(() => {
    setTitle(panel.title ?? '')
    setBody(panel.text_content?.body ?? '')
    const raw = panel.vr_tour?.scene_url ?? ''
    setSceneUrl(decodeURIComponent(raw.split('/').pop()) || VR_SCENES[0].filename)
  }, [panel.id])

  const savedSceneUrl = (() => {
    const raw = panel.vr_tour?.scene_url ?? ''
    return decodeURIComponent(raw.split('/').pop()) || VR_SCENES[0].filename
  })()

  const dirty =
    title !== (panel.title ?? '') ||
    (panel.type === 'text'    && body     !== (panel.text_content?.body ?? '')) ||
    (panel.type === 'vr_tour' && sceneUrl !== savedSceneUrl)

  const handleSave = () => {
    const data = { title }
    if (panel.type === 'text')    data.body      = body
    if (panel.type === 'vr_tour') data.scene_url = buildSceneUrl(sceneUrl)
    onSave(panel.id, data)
  }

  const selectedScene = VR_SCENES.find(s => s.filename.toLowerCase() === sceneUrl.toLowerCase())

  return (
    <aside className="lpe-drawer">
      <div className="lpe-drawer-header">
        <div className="lpe-drawer-title-row">
          <span className={`lpe-type-badge lpe-type-badge--${panel.type}`}>
            {panel.type === 'vr_tour' ? '360° VR Tour' : 'Text Panel'}
          </span>
          <button className="lpe-drawer-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
      </div>

      <div className="lpe-drawer-body">
        {/* Title */}
        <div className="lpe-field">
          <label className="lpe-label">Title</label>
          <input
            className="lpe-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Panel title…"
          />
        </div>

        {/* Text body */}
        {panel.type === 'text' && (
          <div className="lpe-field lpe-field--grow">
            <label className="lpe-label">Content</label>
            <textarea
              className="lpe-textarea"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write the panel content here…"
            />
          </div>
        )}

        {/* VR scene selector */}
        {panel.type === 'vr_tour' && (
          <div className="lpe-field">
            <label className="lpe-label">Scene</label>
            <select
              className="lpe-select"
              value={sceneUrl}
              onChange={e => setSceneUrl(e.target.value)}
            >
              {VR_SCENES.map(s => (
                <option key={s.filename} value={s.filename}>{s.label}</option>
              ))}
            </select>
            {selectedScene && (
              <div className="lpe-scene-preview-wrap">
                <img
                  key={selectedScene.src}
                  src={selectedScene.src}
                  alt="Scene preview"
                  className="lpe-scene-preview"
                />
              </div>
            )}
          </div>
        )}

        {/* Anchor management — VR panels only */}
        {panel.type === 'vr_tour' && (
          <AnchorSection
            key={panel.id}
            lessonId={lessonId}
            panelId={panel.id}
            initialTextAnchors={panel.vr_tour?.text_anchors ?? []}
            initialNavAnchors={panel.vr_tour?.navigator_anchors ?? []}
            initialPolyAnchors={panel.vr_tour?.polygon_anchors ?? []}
            onAnchorsChange={onAnchorsChange}
            focusAnchor={focusAnchor}
            onEnterPlacement={onEnterPlacement}
            newAnchorPlacement={newAnchorPlacement}
            onNewAnchorSaved={onNewAnchorSaved}
            newPolyPlacement={newPolyPlacement}
            onNewPolySaved={onNewPolySaved}
            newPolyPoint={newPolyPoint}
            onNewPolyPointSaved={onNewPolyPointSaved}
            onActivePolyPointsChange={onActivePolyPointsChange}
          />
        )}
      </div>

      <div className="lpe-drawer-footer">
        <button className="lpe-save-btn" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {!dirty && <span className="lpe-saved-hint">Saved</span>}
      </div>
    </aside>
  )
}
