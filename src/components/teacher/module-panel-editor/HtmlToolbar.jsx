const TOOLS = [
  { label: 'H1',  cmd: 'formatBlock', arg: 'h1',  title: 'Heading 1' },
  { label: 'H2',  cmd: 'formatBlock', arg: 'h2',  title: 'Heading 2' },
  { label: 'H3',  cmd: 'formatBlock', arg: 'h3',  title: 'Heading 3' },
  null,
  { label: 'B',   cmd: 'bold',                     title: 'Bold',   style: { fontWeight: 700 } },
  { label: 'I',   cmd: 'italic',                   title: 'Italic', style: { fontStyle: 'italic' } },
  null,
  { label: 'P',   cmd: 'formatBlock', arg: 'p',   title: 'Paragraph' },
  { label: 'UL',  cmd: 'insertUnorderedList',      title: 'Bullet list' },
  { label: 'HR',  cmd: 'insertHorizontalRule',     title: 'Divider' },
  null,
  { label: 'IMG', img: true,                       title: 'Image' },
]

function exec(cmd, arg) {
  document.execCommand(cmd, false, arg ?? null)
}

function fireInput(el) {
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function insertImg(editorRef) {
  const src = window.prompt('Image URL:')
  if (!src) return
  const alt = window.prompt('Alt text (optional):') ?? ''
  const el = editorRef.current
  if (!el) return
  el.focus()
  exec('insertHTML', `<img src="${src}" alt="${alt}">`)
  fireInput(el)
}

export default function HtmlToolbar({ editorRef }) {
  return (
    <div className="lpe-html-toolbar" onMouseDown={e => e.preventDefault()}>
      {TOOLS.map((tool, i) => {
        if (!tool) return <span key={`sep-${i}`} className="lpe-html-toolbar-sep" />
        return (
          <button
            key={tool.label}
            className="lpe-html-toolbar-btn"
            title={tool.title}
            style={tool.style}
            onClick={() => {
              const el = editorRef.current
              if (!el) return
              el.focus()
              if (tool.img) { insertImg(editorRef); return }
              exec(tool.cmd, tool.arg)
              fireInput(el)
            }}
          >
            {tool.label}
          </button>
        )
      })}
    </div>
  )
}
