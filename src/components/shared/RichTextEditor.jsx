import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Video from '../teacher/lesson-panel-editor/VideoExtension'
import MediaInsertModal from '../teacher/lesson-panel-editor/MediaInsertModal'
import '../css/shared/RichTextEditor.css'

const TOOLBAR_GROUPS = [
  {
    label: 'Headings',
    items: [
      { key: 'h1', title: 'Heading 1',  glyph: 'H1', shortLabel: 'Large',  act: e => e.chain().focus().toggleHeading({ level: 1 }).run(), on: e => e.isActive('heading', { level: 1 }) },
      { key: 'h2', title: 'Heading 2',  glyph: 'H2', shortLabel: 'Medium', act: e => e.chain().focus().toggleHeading({ level: 2 }).run(), on: e => e.isActive('heading', { level: 2 }) },
      { key: 'h3', title: 'Heading 3',  glyph: 'H3', shortLabel: 'Small',  act: e => e.chain().focus().toggleHeading({ level: 3 }).run(), on: e => e.isActive('heading', { level: 3 }) },
      { key: 'p',  title: 'Normal text — clears all formatting', glyph: '¶', shortLabel: 'Normal',
        act: e => {
          const { empty } = e.state.selection
          const chain = e.chain().focus()
          if (empty) chain.selectParentNode()
          return chain.unsetAllMarks().clearNodes().run()
        },
        on: e => e.isActive('paragraph') && !e.isActive('bold') && !e.isActive('italic'),
      },
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
          if (empty) return e.chain().focus().selectParentNode().unsetAllMarks().run()
          return e.chain().focus().unsetAllMarks().run()
        },
        on: () => false,
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

/* ── Props ───────────────────────────────────────────────────────────────────
 * value       {string}    Initial HTML content. Loaded once on mount.
 * onChange     {Function}  Called with HTML on every editor update (optional).
 * onBlur      {Function}  Called with HTML when editor loses focus (optional).
 * classroomId {number}    Passed to MediaInsertModal for scoped uploads.
 * placeholder {string}    Placeholder text shown when editor is empty.
 */
export default function RichTextEditor({ value = '', onChange, onBlur, classroomId, placeholder }) {
  const [showHtml,   setShowHtml]   = useState(false)
  const [rawHtml,    setRawHtml]    = useState('')
  const [mediaMode,  setMediaMode]  = useState(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Video,
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'rte-prosemirror' },
    },
    onUpdate({ editor: e }) {
      onChange?.(e.getHTML())
    },
    onBlur({ editor: e }) {
      onBlur?.(e.getHTML())
    },
  })

  // Expose editor destroy on unmount (TipTap handles this but make explicit)
  useEffect(() => () => editor?.destroy(), [editor])

  const handleToggleHtml = () => {
    if (!showHtml) {
      setRawHtml(editor?.getHTML() ?? '')
      setShowHtml(true)
    } else {
      editor?.commands.setContent(rawHtml, false)
      onChange?.(rawHtml)
      setShowHtml(false)
    }
  }

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

  return (
    <div className="rte-wrap">
      {/* Format header */}
      <div className="rte-format-header">
        <button
          className={`rte-html-toggle${showHtml ? ' rte-html-toggle--active' : ''}`}
          onClick={handleToggleHtml}
          title={showHtml ? 'Back to visual' : 'Edit raw HTML'}
        >{'</>'}</button>
      </div>

      {/* Toolbar groups — hidden in HTML mode */}
      {!showHtml && (
        <div className="rte-toolbar-groups">
          {TOOLBAR_GROUPS.map(group => (
            <div key={group.label} className="rte-toolbar-group">
              <span className="rte-toolbar-group-label">{group.label}</span>
              <div className="rte-toolbar-row">
                {group.items.map(item => (
                  <button
                    key={item.key}
                    className={`rte-tbtn${editor && item.on(editor) ? ' rte-tbtn--active' : ''}`}
                    title={item.title}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      if (item.key === 'img') { setMediaMode('image'); return }
                      if (item.key === 'vid') { setMediaMode('video'); return }
                      editor && item.act(editor)
                    }}
                  >
                    {item.icon
                      ? <span className="rte-tbtn-icon">{item.icon}</span>
                      : <span className="rte-tbtn-glyph">{item.glyph ?? item.shortLabel}</span>
                    }
                    <span className="rte-tbtn-label">{item.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content area */}
      {showHtml ? (
        <textarea
          className="rte-html-area"
          value={rawHtml}
          onChange={e => setRawHtml(e.target.value)}
          spellCheck={false}
        />
      ) : (
        <div
          className="rte-editor-area"
          style={{ '--rte-placeholder': `"${placeholder || 'Write here…'}"` }}
        >
          <EditorContent editor={editor} />
        </div>
      )}

      {mediaMode && createPortal(
        <MediaInsertModal
          initialMode={mediaMode}
          classroomId={classroomId}
          onInsert={handleMediaInsert}
          onClose={() => setMediaMode(null)}
        />,
        document.body
      )}
    </div>
  )
}
