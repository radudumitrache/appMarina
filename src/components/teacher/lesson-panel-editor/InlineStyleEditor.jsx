import { useState } from 'react'

const FONT_FAMILIES = [
  { label: 'Default',           value: '' },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'IBM Plex Mono',     value: "'IBM Plex Mono', monospace" },
  { label: 'Georgia',           value: 'Georgia, serif' },
  { label: 'Arial',             value: 'Arial, sans-serif' },
]

const FONT_WEIGHTS = [
  { label: 'Default',   value: '' },
  { label: 'Light',     value: '300' },
  { label: 'Normal',    value: '400' },
  { label: 'Medium',    value: '500' },
  { label: 'Semi-bold', value: '600' },
  { label: 'Bold',      value: '700' },
  { label: 'Black',     value: '900' },
]

function toHex(colorStr) {
  if (!colorStr) return ''
  if (/^#[0-9a-f]{6}$/i.test(colorStr)) return colorStr
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = colorStr
    const hex = ctx.fillStyle
    return hex.startsWith('#') ? hex : ''
  } catch { return '' }
}

export default function InlineStyleEditor({ element, editorEl }) {
  const [s, setS] = useState(() => {
    const cs = element.style
    return {
      color:           cs.color           || '',
      backgroundColor: cs.backgroundColor || '',
      fontSize:        parseInt(cs.fontSize) || '',
      fontWeight:      cs.fontWeight      || '',
      fontFamily:      cs.fontFamily      || '',
      textAlign:       cs.textAlign       || '',
    }
  })

  const apply = (prop, value) => {
    setS(prev => ({ ...prev, [prop]: value }))
    element.style[prop] = value
    editorEl?.dispatchEvent(new Event('input', { bubbles: true }))
  }

  return (
    <div className="lpe-style-editor">
      <div className="lpe-style-rows">

        <div className="lpe-style-row">
          <span className="lpe-style-label">Color</span>
          <label className="lpe-style-swatch" style={{ background: s.color || 'rgba(255,255,255,0.08)' }}>
            <input type="color" value={toHex(s.color) || '#ffffff'}
              onChange={e => apply('color', e.target.value)} />
          </label>
          <span className="lpe-style-val">{s.color || '—'}</span>
          {s.color && <button className="lpe-style-reset" onClick={() => apply('color', '')}>↩</button>}
        </div>

        <div className="lpe-style-row">
          <span className="lpe-style-label">Background</span>
          <label className="lpe-style-swatch lpe-style-swatch--checker"
            style={s.backgroundColor ? { background: s.backgroundColor } : undefined}>
            <input type="color" value={toHex(s.backgroundColor) || '#000000'}
              onChange={e => apply('backgroundColor', e.target.value)} />
          </label>
          <span className="lpe-style-val">{s.backgroundColor || '—'}</span>
          {s.backgroundColor && <button className="lpe-style-reset" onClick={() => apply('backgroundColor', '')}>↩</button>}
        </div>

        <div className="lpe-style-divider" />

        <div className="lpe-style-row lpe-style-row--col">
          <div className="lpe-style-row-head">
            <span className="lpe-style-label">Font size</span>
            <span className="lpe-style-val">{s.fontSize ? `${s.fontSize}px` : '—'}</span>
            {s.fontSize && <button className="lpe-style-reset" onClick={() => apply('fontSize', '')}>↩</button>}
          </div>
          <div className="lpe-style-slider-row">
            <span className="lpe-style-range-edge">8</span>
            <input type="range" className="lpe-style-range" min="8" max="72" step="1"
              value={s.fontSize || 16}
              onChange={e => apply('fontSize', e.target.value + 'px')} />
            <span className="lpe-style-range-edge">72</span>
          </div>
        </div>

        <div className="lpe-style-row">
          <span className="lpe-style-label">Weight</span>
          <select className="lpe-style-select" value={s.fontWeight}
            onChange={e => apply('fontWeight', e.target.value)}>
            {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </div>

        <div className="lpe-style-row">
          <span className="lpe-style-label">Font</span>
          <select className="lpe-style-select" value={s.fontFamily}
            onChange={e => apply('fontFamily', e.target.value)}>
            {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        <div className="lpe-style-divider" />

        <div className="lpe-style-row">
          <span className="lpe-style-label">Align</span>
          <div className="lpe-style-align">
            {['left', 'center', 'right'].map(a => (
              <button key={a}
                className={`lpe-style-align-btn${s.textAlign === a ? ' lpe-style-align-btn--on' : ''}`}
                onClick={() => apply('textAlign', s.textAlign === a ? '' : a)}
                title={a.charAt(0).toUpperCase() + a.slice(1)}
              >
                {a === 'left' ? 'L' : a === 'center' ? 'C' : 'R'}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
