import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import ScenePicker from './ScenePicker'
import MediaInsertModal from './MediaInsertModal'
import AnchorSection from './AnchorSection'
import DocumentSection from './DocumentSection'
import { IconClose } from './LPEIcons'
import { useAuth } from '../../../auth/AuthContext'
import { createPanelDocument, deletePanelDocument } from '../../../api/lessons'

const TOOLBAR_GROUPS = [
  {
    label: 'Headings',
    items: [
      { key: 'h1', title: 'Heading 1',  glyph: 'H1', shortLabel: 'Large',  act: e => e.chain().focus().toggleHeading({ level: 1 }).run(), on: e => e.isActive('heading', { level: 1 }) },
      { key: 'h2', title: 'Heading 2',  glyph: 'H2', shortLabel: 'Medium', act: e => e.chain().focus().toggleHeading({ level: 2 }).run(), on: e => e.isActive('heading', { level: 2 }) },
      { key: 'h3', title: 'Heading 3',  glyph: 'H3', shortLabel: 'Small',  act: e => e.chain().focus().toggleHeading({ level: 3 }).run(), on: e => e.isActive('heading', { level: 3 }) },
      { key: 'p',  title: 'Normal text — clears all formatting',  glyph: '¶',  shortLabel: 'Normal',
        act: e => {
          const { empty } = e.state.selection
          const chain = e.chain().focus()
          if (empty) chain.selectParentNode()
          return chain.unsetAllMarks().clearNodes().run()
        },
        on: e => e.isActive('paragraph') && !e.isActive('bold') && !e.isActive('italic') },
    ],
  },
  {
    label: 'Format',
    items: [
      {
        key: 'bold', title: 'Bold',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h5a3 3 0 0 0 0-6H4v6zM4 8h5.5a3.5 3.5 0 0 1 0 7H4V8z"/>
          </svg>
        ),
        shortLabel: 'Bold',
        act: e => e.chain().focus().toggleBold().run(),
        on:  e => e.isActive('bold'),
      },
      {
        key: 'italic', title: 'Italic',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="2" x2="6" y2="14"/>
            <line x1="6"  y1="2" x2="12" y2="2"/>
            <line x1="4"  y1="14" x2="10" y2="14"/>
          </svg>
        ),
        shortLabel: 'Italic',
        act: e => e.chain().focus().toggleItalic().run(),
        on:  e => e.isActive('italic'),
      },
      {
        key: 'clear', title: 'Remove bold / italic from selection',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h5a3 3 0 0 1 2.83 4M9.5 9.5 8 12H4"/>
            <line x1="2" y1="2" x2="14" y2="14"/>
          </svg>
        ),
        shortLabel: 'Clear',
        act: e => {
          const { empty } = e.state.selection
          if (empty) {
            // No selection — expand to the whole current node first
            return e.chain().focus().selectParentNode().unsetAllMarks().run()
          }
          return e.chain().focus().unsetAllMarks().run()
        },
        on:  () => false,
      },
    ],
  },
  {
    label: 'Lists',
    items: [
      {
        key: 'ul', title: 'Bullet list',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <circle cx="2.5" cy="4"  r="1" fill="currentColor" stroke="none"/>
            <circle cx="2.5" cy="8"  r="1" fill="currentColor" stroke="none"/>
            <circle cx="2.5" cy="12" r="1" fill="currentColor" stroke="none"/>
            <line x1="6" y1="4"  x2="14" y2="4"/>
            <line x1="6" y1="8"  x2="14" y2="8"/>
            <line x1="6" y1="12" x2="14" y2="12"/>
          </svg>
        ),
        shortLabel: 'Bullets',
        act: e => e.chain().focus().toggleBulletList().run(),
        on:  e => e.isActive('bulletList'),
      },
      {
        key: 'ol', title: 'Ordered list',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <text x="1" y="5.5" fontFamily="sans-serif" fontSize="5" fontWeight="700" fill="currentColor" stroke="none">1.</text>
            <text x="1" y="9.5" fontFamily="sans-serif" fontSize="5" fontWeight="700" fill="currentColor" stroke="none">2.</text>
            <text x="1" y="13.5" fontFamily="sans-serif" fontSize="5" fontWeight="700" fill="currentColor" stroke="none">3.</text>
            <line x1="7" y1="4"  x2="15" y2="4"/>
            <line x1="7" y1="8"  x2="15" y2="8"/>
            <line x1="7" y1="12" x2="15" y2="12"/>
          </svg>
        ),
        shortLabel: 'Numbered',
        act: e => e.chain().focus().toggleOrderedList().run(),
        on:  e => e.isActive('orderedList'),
      },
      {
        key: 'hr', title: 'Divider line',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <line x1="2" y1="8" x2="14" y2="8"/>
            <line x1="2" y1="4" x2="6"  y2="4" strokeWidth="1"/>
            <line x1="2" y1="12" x2="6" y2="12" strokeWidth="1"/>
          </svg>
        ),
        shortLabel: 'Divider',
        act: e => e.chain().focus().setHorizontalRule().run(),
        on:  () => false,
      },
    ],
  },
  {
    label: 'Insert',
    items: [
      {
        key: 'img', title: 'Insert image',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="14" height="10" rx="1.5"/>
            <circle cx="5.5" cy="6.5" r="1.2"/>
            <path d="M1 11l3.5-3.5 2.5 2.5 2-2 4 4"/>
          </svg>
        ),
        shortLabel: 'Image',
        act: null,
        on:  () => false,
      },
      {
        key: 'vid', title: 'Insert video',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="10" height="8" rx="1.5"/>
            <path d="M11 6.5l4-2v7l-4-2V6.5z"/>
          </svg>
        ),
        shortLabel: 'Video',
        act: null,
        on:  () => false,
      },
    ],
  },
]

export default function EditDrawer({
  panel, editor,
  showHtml, rawHtml, onRawHtmlChange, onToggleHtml,
  onDrawerWidthChange,
  onSave, onClose, saving, lessonId, departmentId, departmentLabel, panels,
  onAnchorsChange, focusAnchor, onEnterPlacement,
  newAnchorPlacement, onNewAnchorSaved,
  newPolyPlacement, onNewPolySaved,
  newPolyPoint, onNewPolyPointSaved,
  onActivePolyPointsChange, draggedAnchorPos, getViewerCameraDir,
}) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const savedBody        = panel.text_content?.body ?? ''
  const savedMediaFileId = panel.vr_tour?.media_file ?? null

  const [title,         setTitle]         = useState(panel.title ?? '')
  const [mediaFileId,   setMediaFileId]   = useState(savedMediaFileId)
  const [previewUrl,    setPreviewUrl]    = useState(savedMediaFileId ? (panel.vr_tour?.scene_url ?? null) : null)
  const [anchorEditing,  setAnchorEditing]  = useState(false)
  const [drawerWidth,    setDrawerWidth]    = useState(380)
  const [dragging,       setDragging]       = useState(false)
  const [mediaMode,      setMediaMode]      = useState(null)
  const [scenePickerOpen, setScenePickerOpen] = useState(false)

  const [panelDocs,      setPanelDocs]      = useState(panel.documents ?? [])
  const [docUploading,   setDocUploading]   = useState(false)

  const handleDocUpload = async (fileData) => {
    setDocUploading(true)
    try {
      const res = await createPanelDocument(lessonId, panel.id, fileData)
      setPanelDocs(prev => [...prev, res.data])
    } finally {
      setDocUploading(false)
    }
  }

  const handleDocDelete = async (docId) => {
    await deletePanelDocument(lessonId, panel.id, docId)
    setPanelDocs(prev => prev.filter(d => d.id !== docId))
  }
  const dragStartX     = useRef(0)
  const dragStartWidth = useRef(0)

  // ── Dirty detection ───────────────────────────────────────────────────────
  const [editorDirty, setEditorDirty] = useState(false)
  useEffect(() => {
    if (!editor || panel.type !== 'text') return
    const handler = () => setEditorDirty(editor.getHTML() !== savedBody)
    editor.on('update', handler)
    return () => editor.off('update', handler)
  }, [editor, savedBody, panel.type])

  const dirty =
    title !== (panel.title ?? '') ||
    (panel.type === 'text'    && (showHtml ? rawHtml !== savedBody : editorDirty)) ||
    (panel.type === 'vr_tour' && mediaFileId !== savedMediaFileId)

  // ── Media insert ──────────────────────────────────────────────────────────
  const handleMediaInsert = (url, type) => {
    if (editor) {
      if (type === 'image') {
        editor.chain().focus().setImage({ src: url, alt: '' }).run()
      } else {
        editor.chain().focus().setVideo({ src: url, controls: true, style: 'max-width:100%;' }).run()
      }
    }
    setMediaMode(null)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const data = { title }
    if (panel.type === 'text')    data.body = showHtml ? rawHtml : (editor?.getHTML() ?? savedBody)
    if (panel.type === 'vr_tour') { data.media_file_id = mediaFileId; data.scene_url = '' }
    onSave(panel.id, data)
    setEditorDirty(false)
  }


  // ── Resize handle ─────────────────────────────────────────────────────────
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
      const w = Math.min(760, Math.max(320, dragStartWidth.current + (dragStartX.current - e.clientX)))
      setDrawerWidth(w)
      onDrawerWidthChange?.(w)
    }
    const onMouseUp = () => { setDragging(false); document.body.style.userSelect = '' }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup',   onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup',   onMouseUp)
      document.body.style.userSelect = ''
    }
  }, [dragging])

  return (
    <aside className="lpe-drawer" style={{ width: drawerWidth }}>
      <div
        className={`lpe-drawer-resize-handle${dragging ? ' lpe-drawer-resize-handle--dragging' : ''}`}
        onMouseDown={onResizeMouseDown}
      />

      {/* Header */}
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

      {/* Body */}
      <div className="lpe-drawer-body">

        {/* Panel title */}
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

        {/* Text panel: toolbar + editor */}
        {panel.type === 'text' && (
          <div className="lpe-field lpe-field--editor">
            <div className="lpe-format-header">
              <label className="lpe-label">Content</label>
              <button
                className={`lpe-html-toggle${showHtml ? ' lpe-html-toggle--active' : ''}`}
                onClick={onToggleHtml}
                title={showHtml ? 'Back to visual editing' : 'Edit raw HTML in main view'}
              >
                {'</>'}
              </button>
            </div>

            {!showHtml && (
              <div className="lpe-toolbar-groups">
                {TOOLBAR_GROUPS.map((group, gi) => (
                  <div key={group.label} className="lpe-toolbar-group">
                    <span className="lpe-toolbar-group-label">{group.label}</span>
                    <div className="lpe-toolbar-row">
                      {group.items.map(item => (
                        <button
                          key={item.key}
                          className={`lpe-tbtn${editor && item.on(editor) ? ' lpe-tbtn--active' : ''}`}
                          title={item.title}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            if (item.key === 'img') { setMediaMode('image'); return }
                            if (item.key === 'vid') { setMediaMode('video'); return }
                            editor && item.act(editor)
                          }}
                        >
                          {item.icon
                            ? <span className="lpe-tbtn-icon">{item.icon}</span>
                            : <span className="lpe-tbtn-glyph">{item.glyph ?? item.shortLabel}</span>
                          }
                          <span className="lpe-tbtn-label">{item.shortLabel}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showHtml && (
              <p className="lpe-html-hint">HTML source is shown in the main view.</p>
            )}
          </div>
        )}

        {/* VR scene picker */}
        {panel.type === 'vr_tour' && !anchorEditing && (
          <div className="lpe-field">
            <label className="lpe-label">Scene</label>
            <div className="lpe-scene-trigger-row">
              {previewUrl && (
                <img key={previewUrl} src={previewUrl} alt="Scene preview" className="lpe-scene-thumb" />
              )}
              <button className="lpe-scene-trigger-btn" onClick={() => setScenePickerOpen(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                {previewUrl ? 'Change scene' : 'Select scene'}
              </button>
            </div>
          </div>
        )}

        {/* Panel documents */}
        {!anchorEditing && (
          <DocumentSection
            documents={panelDocs}
            onUpload={handleDocUpload}
            onDelete={handleDocDelete}
            uploading={docUploading}
            isAdmin={isAdmin}
            departmentId={departmentId}
          />
        )}

        {/* VR anchor management */}
        {panel.type === 'vr_tour' && (
          <AnchorSection
            key={panel.id}
            lessonId={lessonId}
            panelId={panel.id}
            panels={panels}
            departmentId={departmentId}
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
            getViewerCameraDir={getViewerCameraDir}
          />
        )}
      </div>

      {/* Footer */}
      {!anchorEditing && (
        <div className="lpe-drawer-footer">
          <button className="lpe-btn-ghost" onClick={onClose}>Discard</button>
          <button className="lpe-save-btn" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {scenePickerOpen && createPortal(
        <div className="sp-modal-backdrop" onClick={() => setScenePickerOpen(false)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-modal-header">
              <span className="sp-modal-title">Select Scene</span>
              <button className="sp-modal-close" onClick={() => setScenePickerOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="sp-modal-body">
              <ScenePicker
                value={mediaFileId}
                onChange={(id, url) => { setMediaFileId(id); setPreviewUrl(url); setScenePickerOpen(false) }}
                departmentId={departmentId}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {mediaMode && (
        <MediaInsertModal
          initialMode={mediaMode}
          departmentId={departmentId}
          folderLabel={departmentLabel}
          onInsert={handleMediaInsert}
          onClose={() => setMediaMode(null)}
        />
      )}
    </aside>
  )
}
