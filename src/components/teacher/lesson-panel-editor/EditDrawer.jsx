import { useState, useEffect, useRef, useCallback } from 'react'
import ScenePicker from './ScenePicker'
import MediaInsertModal from './MediaInsertModal'
import AnchorSection from './AnchorSection'
import InlineStyleEditor from './InlineStyleEditor'
import ImageStyleEditor from './ImageStyleEditor'
import { IconClose } from './LPEIcons'

const TAG_LABELS = {
  h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3',
  p: 'Paragraph', strong: 'Bold', b: 'Bold',
  em: 'Italic', i: 'Italic',
  ul: 'Bullet List', ol: 'Numbered List', li: 'List Item',
  a: 'Link', img: 'Image', video: 'Video', hr: 'Divider',
  span: 'Span', div: 'Block',
}

function tagLabel(tagName) {
  return TAG_LABELS[tagName?.toLowerCase()] ?? tagName
}

function unwrapElement(el) {
  const parent = el.parentNode
  if (!parent) return
  while (el.firstChild) parent.insertBefore(el.firstChild, el)
  parent.removeChild(el)
}

function removeFormattingTag(tagName, element, editorEl) {
  unwrapElement(element)
  editorEl?.dispatchEvent(new Event('input', { bubbles: true }))
}

const TAGS = [
  { label: 'H1',    cmd: 'formatBlock', arg: 'h1', desc: 'Large title — top-level heading' },
  { label: 'H2',    cmd: 'formatBlock', arg: 'h2', desc: 'Section heading' },
  { label: 'H3',    cmd: 'formatBlock', arg: 'h3', desc: 'Sub-section heading' },
  { label: 'P',     cmd: 'formatBlock', arg: 'p',  desc: 'Normal paragraph text' },
  { label: 'B',     cmd: 'bold',                   desc: 'Bold — emphasise key words' },
  { label: 'I',     cmd: 'italic',                 desc: 'Italic — titles, terms, stress' },
  { label: 'UL',    cmd: 'insertUnorderedList',    desc: 'Bullet list' },
  { label: 'HR',    cmd: 'insertHorizontalRule',   desc: 'Horizontal divider line' },
  { label: 'IMG',   media: 'image',                desc: 'Insert an image' },
  { label: 'VIDEO', media: 'video',                desc: 'Insert a video' },
]

function fireInput(el) {
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function applyTag(editorRef, tag) {
  const el = editorRef.current
  if (!el) return
  el.focus()

  const sel = window.getSelection()
  const hasSelection = sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed

  if (hasSelection && tag.cmd === 'formatBlock') {
    // Wrap only the selected fragment in the block tag, preserving inner markup
    const range = sel.getRangeAt(0)
    const fragment = range.extractContents()
    const wrapper = document.createElement(tag.arg)
    wrapper.appendChild(fragment)
    range.insertNode(wrapper)
    sel.collapse(wrapper, wrapper.childNodes.length)
  } else {
    document.execCommand(tag.cmd, false, tag.arg ?? null)
  }

  fireInput(el)
}

export default function EditDrawer({
  panel, editorRef, liveBody, showHtml, onToggleHtml,
  activeTags,
  onSave, onClose, saving, lessonId, classroomId, panels,
  onAnchorsChange, focusAnchor, onEnterPlacement,
  newAnchorPlacement, onNewAnchorSaved,
  newPolyPlacement, onNewPolySaved,
  newPolyPoint, onNewPolyPointSaved,
  onActivePolyPointsChange, draggedAnchorPos,
}) {
  const savedBody        = panel.text_content?.body ?? ''
  const savedMediaFileId = panel.vr_tour?.media_file ?? null

  const [title,          setTitle]          = useState(panel.title ?? '')
  const [mediaFileId,    setMediaFileId]    = useState(savedMediaFileId)
  const [previewUrl,     setPreviewUrl]     = useState(
    savedMediaFileId ? (panel.vr_tour?.scene_url ?? null) : null
  )
  const [activeTagIdx,   setActiveTagIdx]   = useState(0)
  const [anchorEditing,  setAnchorEditing]  = useState(false)
  const [drawerWidth,    setDrawerWidth]    = useState(360)
  const [dragging,       setDragging]       = useState(false)
  const [mediaMode,      setMediaMode]      = useState(null) // 'image' | 'video' | null
  const dragStartX      = useRef(0)
  const dragStartWidth  = useRef(0)
  const savedRange      = useRef(null)

  const openMediaPicker = mode => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
    setMediaMode(mode)
  }

  const handleMediaInsert = (url, type) => {
    const el = editorRef.current
    if (el) {
      el.focus()
      const sel = window.getSelection()
      if (savedRange.current) {
        sel.removeAllRanges()
        sel.addRange(savedRange.current)
        savedRange.current = null
      }
      const html = type === 'image'
        ? `<img src="${url}" alt="" style="max-width:100%;" />`
        : `<video src="${url}" controls style="max-width:100%;"></video>`
      document.execCommand('insertHTML', false, html)
      fireInput(el)
    }
    setMediaMode(null)
  }

  const onResizeMouseDown = useCallback(e => {
    e.preventDefault()
    dragStartX.current     = e.clientX
    dragStartWidth.current = drawerWidth
    setDragging(true)
  }, [drawerWidth])

  useEffect(() => {
    if (!dragging) return
    document.body.style.userSelect = 'none'
    const onMouseMove = e => {
      const delta = dragStartX.current - e.clientX
      const next  = Math.min(700, Math.max(280, dragStartWidth.current + delta))
      setDrawerWidth(next)
    }
    const onMouseUp = () => {
      setDragging(false)
      document.body.style.userSelect = ''
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup',   onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup',   onMouseUp)
      document.body.style.userSelect = ''
    }
  }, [dragging])

  useEffect(() => { setActiveTagIdx(0) }, [activeTags])

  const bodyDirty = liveBody !== null && liveBody !== savedBody
  const dirty =
    title !== (panel.title ?? '') ||
    (panel.type === 'text'    && bodyDirty) ||
    (panel.type === 'vr_tour' && mediaFileId !== savedMediaFileId)

  const handleSave = () => {
    const data = { title }
    if (panel.type === 'text') data.body = liveBody ?? savedBody
    if (panel.type === 'vr_tour') {
      data.media_file_id = mediaFileId
      data.scene_url = ''
    }
    onSave(panel.id, data)
  }

  return (
    <aside className="lpe-drawer" style={{ width: drawerWidth }}>
      <div
        className={`lpe-drawer-resize-handle${dragging ? ' lpe-drawer-resize-handle--dragging' : ''}`}
        onMouseDown={onResizeMouseDown}
      />
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
        {/* Title — hidden while an anchor is being edited */}
        {!anchorEditing && (
        <div className="lpe-field">
          <label className="lpe-label">Title</label>
          <input
            className="lpe-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Panel title…"
          />
        </div>
        )}

        {/* Tag list + HTML toggle — text panels only */}
        {panel.type === 'text' && (
          <div className="lpe-field">
            <div className="lpe-format-header">
              <label className="lpe-label">Format</label>
              <button
                className={`lpe-html-toggle${showHtml ? ' lpe-html-toggle--active' : ''}`}
                onClick={onToggleHtml}
                title={showHtml ? 'Back to visual editing' : 'View raw HTML'}
              >
                {'</>'}
              </button>
            </div>

            <div className="lpe-tag-list">
              {TAGS.map(tag => (
                <button
                  key={tag.label}
                  className="lpe-tag-item"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => tag.media ? openMediaPicker(tag.media) : applyTag(editorRef, tag)}
                  disabled={showHtml}
                >
                  <span className="lpe-tag-item-label">{tag.label}</span>
                  <span className="lpe-tag-item-desc">{tag.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active element inspector — shown when cursor is inside a tag */}
        {panel.type === 'text' && activeTags?.length > 0 && !showHtml && (
          <div className="lpe-field">
            <label className="lpe-label">Active Element</label>
            <div className="lpe-active-tag-chips">
              {activeTags.map((t, i) => (
                <button
                  key={i}
                  className={`lpe-active-tag-chip${activeTagIdx === i ? ' lpe-active-tag-chip--on' : ''}`}
                  onClick={() => setActiveTagIdx(i)}
                  onMouseDown={e => e.preventDefault()}
                >
                  <span className="lpe-active-tag-chip-name">{tagLabel(t.tagName)}</span>
                  <span
                    className="lpe-active-tag-chip-remove"
                    role="button"
                    tabIndex={-1}
                    onMouseDown={e => { e.stopPropagation(); e.preventDefault() }}
                    onClick={e => { e.stopPropagation(); removeFormattingTag(t.tagName, t.element, editorRef.current) }}
                  >×</span>
                </button>
              ))}
            </div>
            {activeTags[activeTagIdx] && (() => {
              const t = activeTags[activeTagIdx]
              const tag = t.tagName.toLowerCase()
              const key = `${activeTagIdx}-${tag}`
              if (tag === 'img' || tag === 'video') {
                return (
                  <ImageStyleEditor
                    key={key}
                    element={t.element}
                    editorEl={editorRef.current}
                  />
                )
              }
              return (
                <InlineStyleEditor
                  key={key}
                  element={t.element}
                  editorEl={editorRef.current}
                />
              )
            })()}
          </div>
        )}

        {/* VR scene picker — hidden while an anchor is being edited */}
        {panel.type === 'vr_tour' && !anchorEditing && (
          <div className="lpe-field">
            <label className="lpe-label">Scene</label>
            <ScenePicker
              value={mediaFileId}
              onChange={(id, url) => { setMediaFileId(id); setPreviewUrl(url) }}
              classroomId={classroomId}
            />
            {previewUrl && (
              <div className="lpe-scene-preview-wrap">
                <img
                  key={previewUrl}
                  src={previewUrl}
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
            panels={panels}
            classroomId={classroomId}
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
            onAnchorEditingChange={setAnchorEditing}
            draggedAnchorPos={draggedAnchorPos}
          />
        )}
      </div>

      {!anchorEditing && (
      <div className="lpe-drawer-footer">
        <button className="lpe-save-btn" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {!dirty && <span className="lpe-saved-hint">Saved</span>}
      </div>
      )}

      {mediaMode && (
        <MediaInsertModal
          initialMode={mediaMode}
          classroomId={classroomId}
          onInsert={handleMediaInsert}
          onClose={() => setMediaMode(null)}
        />
      )}
    </aside>
  )
}
