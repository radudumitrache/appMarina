import { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../../auth/AuthContext'
import MediaInsertModal from '../lesson-panel-editor/MediaInsertModal'
import '../../css/teacher/test-builder/QuestionHtmlEditor.css'

const TOOLS = [
  { label: 'B',   cmd: 'bold',                   title: 'Bold',      style: { fontWeight: 700 } },
  { label: 'I',   cmd: 'italic',                  title: 'Italic',    style: { fontStyle: 'italic' } },
  null,
  { label: 'H2',  cmd: 'formatBlock', arg: 'h2', title: 'Heading 2' },
  { label: 'H3',  cmd: 'formatBlock', arg: 'h3', title: 'Heading 3' },
  { label: 'P',   cmd: 'formatBlock', arg: 'p',  title: 'Paragraph' },
  { label: 'UL',  cmd: 'insertUnorderedList',     title: 'Bullet list' },
  null,
  { label: 'IMG', img: true,                      title: 'Insert image' },
  { label: 'VID', video: true,                    title: 'Insert video' },
]

function exec(cmd, arg) {
  document.execCommand(cmd, false, arg ?? null)
}

function parseStyleVal(s) {
  if (!s) return null
  const m = s.match(/^([\d.]+)(px|%)$/)
  return m ? { val: parseFloat(m[1]), unit: m[2] } : null
}

// ── Resize panel ─────────────────────────────────────────────────────────────

function ResizePanel({ target, pos, onSave }) {
  const [w, setW]         = useState(() => parseStyleVal(target.style.width))
  const [h, setH]         = useState(() => parseStyleVal(target.style.height))
  const [warnW, setWarnW] = useState(false)
  const [warnH, setWarnH] = useState(false)

  function applyW(rawVal, unit) {
    const num = rawVal === '' ? null : parseFloat(rawVal)
    if (unit === '%' && !num) { setWarnW(true); return }
    setWarnW(false)
    const next = num ? { val: num, unit } : null
    setW(next)
    target.style.width = next ? `${next.val}${next.unit}` : ''
    onSave()
  }

  function applyH(rawVal, unit) {
    const num = rawVal === '' ? null : parseFloat(rawVal)
    if (unit === '%' && !num) { setWarnH(true); return }
    setWarnH(false)
    const next = num ? { val: num, unit } : null
    setH(next)
    target.style.height = next ? `${next.val}${next.unit}` : ''
    onSave()
  }

  function reset() {
    target.style.width  = ''
    target.style.height = ''
    setW(null)
    setH(null)
    onSave()
  }

  // pos carries viewport (fixed) coordinates of the image's top edge
  const panelStyle = {
    position:  'fixed',
    top:       pos.top,
    left:      pos.left,
    transform: 'translateY(-100%)',
    marginTop: -6,
  }

  return (
    <div
      className="qhe-resize-panel"
      style={panelStyle}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Width row */}
      <div className="qhe-resize-col">
        <div className="qhe-resize-row">
          <span className="qhe-resize-label">W</span>
          <input
            className={`qhe-resize-input${warnW ? ' qhe-resize-input--warn' : ''}`}
            type="number"
            min="1"
            value={w?.val ?? ''}
            placeholder="auto"
            onChange={e => { setWarnW(false); applyW(e.target.value, w?.unit ?? 'px') }}
          />
          <div className="qhe-resize-units">
            <button
              className={`qhe-resize-unit${!w || w.unit === 'px' ? ' qhe-resize-unit--on' : ''}`}
              onMouseDown={e => e.preventDefault()}
              onClick={() => applyW(w?.val ?? '', 'px')}
            >px</button>
            <button
              className={`qhe-resize-unit${w?.unit === '%' ? ' qhe-resize-unit--on' : ''}`}
              onMouseDown={e => e.preventDefault()}
              onClick={() => applyW(w?.val ?? '', '%')}
            >%</button>
          </div>
        </div>
        {warnW && <span className="qhe-resize-warn">Enter a value first</span>}
      </div>

      {/* Height row */}
      <div className="qhe-resize-col">
        <div className="qhe-resize-row">
          <span className="qhe-resize-label">H</span>
          <input
            className={`qhe-resize-input${warnH ? ' qhe-resize-input--warn' : ''}`}
            type="number"
            min="1"
            value={h?.val ?? ''}
            placeholder="auto"
            onChange={e => { setWarnH(false); applyH(e.target.value, h?.unit ?? 'px') }}
          />
          <div className="qhe-resize-units">
            <button
              className={`qhe-resize-unit${!h || h.unit === 'px' ? ' qhe-resize-unit--on' : ''}`}
              onMouseDown={e => e.preventDefault()}
              onClick={() => applyH(h?.val ?? '', 'px')}
            >px</button>
            <button
              className={`qhe-resize-unit${h?.unit === '%' ? ' qhe-resize-unit--on' : ''}`}
              onMouseDown={e => e.preventDefault()}
              onClick={() => applyH(h?.val ?? '', '%')}
            >%</button>
          </div>
        </div>
        {warnH && <span className="qhe-resize-warn">Enter a value first</span>}
      </div>

      <button
        className="qhe-resize-reset"
        onMouseDown={e => e.preventDefault()}
        onClick={reset}
      >
        Reset
      </button>
    </div>
  )
}

// ── Main editor ───────────────────────────────────────────────────────────────

export default function QuestionHtmlEditor({ value, classroomId, onBlur, placeholder }) {
  const { user } = useAuth()
  const ref      = useRef(null)
  const wrapRef  = useRef(null)
  const savedRange  = useRef(null)
  const lastSynced  = useRef(value)

  const [focused,      setFocused]      = useState(false)
  const [mediaModal,   setMediaModal]   = useState(null)   // null | 'image' | 'video'
  const [resizeTarget, setResizeTarget] = useState(null)   // DOM element
  const [resizePos,    setResizePos]    = useState({ top: 0, left: 0 })
  const [editorH,      setEditorH]      = useState(120)
  const [dragging,     setDragging]     = useState(false)

  const effectiveClassroomId = user?.role === 'admin' ? null : (classroomId ?? null)

  // Set initial innerHTML on mount
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = value || ''
      lastSynced.current = value
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync from parent only when prop changes externally (e.g. switching exercise)
  useEffect(() => {
    if (!ref.current || value === lastSynced.current) return
    ref.current.innerHTML = value || ''
    lastSynced.current = value
    setResizeTarget(null)
  }, [value])

  // Close resize panel on click outside the editor wrap
  useEffect(() => {
    if (!resizeTarget) return
    function onDocDown(e) {
      if (!wrapRef.current?.contains(e.target)) {
        setResizeTarget(null)
      }
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [resizeTarget])

  const saveHtml = useCallback(() => {
    const html = ref.current?.innerHTML ?? ''
    const clean = html === '<br>' ? '' : html
    lastSynced.current = clean
    onBlur(clean)
  }, [onBlur])

  function handleBlur() {
    setFocused(false)
    saveHtml()
  }

  function handleEditorClick(e) {
    const t = e.target
    if (t.tagName === 'IMG' || t.tagName === 'VIDEO') {
      const elRect = t.getBoundingClientRect()
      setResizeTarget(t)
      // Store viewport coords — panel is fixed-positioned via portal
      setResizePos({
        top:  elRect.top,
        left: elRect.left,
      })
    } else {
      setResizeTarget(null)
    }
  }

  function saveSelection() {
    const sel = window.getSelection()
    if (sel?.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange()
  }

  function restoreSelection() {
    if (!savedRange.current) return
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(savedRange.current)
  }

  function handleDragStart(e) {
    e.preventDefault()
    const startY = e.clientY
    const startH = editorH
    setDragging(true)

    function onMove(ev) {
      setEditorH(Math.max(64, startH + ev.clientY - startY))
    }
    function onUp() {
      setDragging(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function openMedia(mode) {
    saveSelection()
    ref.current?.blur()
    setMediaModal(mode)
  }

  function handleInsert(url, fileType) {
    const mode = mediaModal
    setMediaModal(null)
    ref.current?.focus()
    restoreSelection()
    if (fileType === 'image' || mode === 'image') {
      exec('insertHTML', `<img src="${url}" alt="" style="max-width:100%">`)
    } else {
      exec('insertHTML', `<video src="${url}" controls style="max-width:100%"></video>`)
    }
    saveHtml()
  }

  return (
    <>
      <div
        ref={wrapRef}
        className={`qhe-wrap${focused ? ' qhe-wrap--focused' : ''}`}
      >
        {/* Toolbar */}
        <div className="qhe-toolbar" onMouseDown={e => e.preventDefault()}>
          {TOOLS.map((tool, i) => {
            if (!tool) return <span key={`s${i}`} className="qhe-sep" />
            return (
              <button
                key={tool.label}
                className="qhe-btn"
                title={tool.title}
                style={tool.style}
                onClick={() => {
                  if (tool.img)   { openMedia('image'); return }
                  if (tool.video) { openMedia('video'); return }
                  ref.current?.focus()
                  exec(tool.cmd, tool.arg)
                }}
              >
                {tool.label}
              </button>
            )
          })}
        </div>

        {/* Editable content */}
        <div
          ref={ref}
          className="qhe-editor"
          contentEditable
          suppressContentEditableWarning
          style={{ height: editorH }}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onClick={handleEditorClick}
          data-placeholder={placeholder}
        />

        {/* Drag handle */}
        <div
          className={`qhe-drag-handle${dragging ? ' qhe-drag-handle--dragging' : ''}`}
          onMouseDown={handleDragStart}
        >
          <div className="qhe-drag-handle-dots">
            <span /><span /><span />
          </div>
        </div>

      </div>

      {/* Resize panel — rendered in a portal so no parent overflow can clip it */}
      {resizeTarget && createPortal(
        <ResizePanel
          key={resizeTarget}
          target={resizeTarget}
          pos={resizePos}
          onSave={saveHtml}
        />,
        document.body
      )}

      {mediaModal && createPortal(
        <MediaInsertModal
          initialMode={mediaModal}
          classroomId={effectiveClassroomId}
          onInsert={handleInsert}
          onClose={() => setMediaModal(null)}
        />,
        document.body
      )}
    </>
  )
}
