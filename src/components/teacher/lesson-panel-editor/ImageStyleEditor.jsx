const FITS   = ['cover', 'contain', 'fill', 'none']
const BSTYLES = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge']

function toHex(color) {
  if (!color) return '#000000'
  if (/^#[0-9a-f]{6}$/i.test(color)) return color
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function parseMargin(val) {
  if (!val) return { top: '', right: '', bottom: '', left: '' }
  const parts = val.trim().split(/\s+/)
  if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
  if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
  if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
  return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
}

function buildMargin({ top, right, bottom, left }) {
  const t = top || '', r = right || '', b = bottom || '', l = left || ''
  if (!t && !r && !b && !l) return ''
  if (t === r && r === b && b === l) return t
  if (t === b && r === l) return `${t} ${r}`
  return `${t} ${r} ${b} ${l}`
}

function fire(el) {
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function readDim(val) {
  if (!val || val === 'auto') return { num: '', unit: '%' }
  const m = val.match(/^([\d.]+)(px|%|em|rem)?$/)
  return m ? { num: m[1], unit: m[2] ?? 'px' } : { num: '', unit: 'px' }
}

function DimInput({ label, value, onChange }) {
  const { num, unit } = readDim(value)
  return (
    <div className="ise-row">
      <span className="ise-label">{label}</span>
      <div className="ise-dim">
        <input
          className="ise-num"
          type="number"
          min="0"
          placeholder="auto"
          value={num}
          onChange={e => onChange(e.target.value ? `${e.target.value}${unit}` : 'auto')}
        />
        <select
          className="ise-unit"
          value={unit}
          onChange={e => onChange(num ? `${num}${e.target.value}` : 'auto')}
        >
          <option value="px">px</option>
          <option value="%">%</option>
          <option value="em">em</option>
        </select>
      </div>
    </div>
  )
}

export default function ImageStyleEditor({ element, editorEl }) {
  const cs = element.style
  const isImg = element.tagName === 'IMG'

  const apply = (prop, value) => {
    element.style[prop] = value
    fire(editorEl)
  }

  const radius      = parseInt(cs.borderRadius) || 0
  const float       = cs.float       || 'none'
  const fit         = cs.objectFit   || ''
  const margin      = cs.margin      || ''
  const borderW     = parseInt(cs.borderWidth) || 0
  const borderStyle = cs.borderStyle || 'none'
  const borderColor = cs.borderColor || '#000000'
  const hasBorder   = borderW > 0 && borderStyle !== 'none'

  return (
    <div className="ise-root">

      <DimInput
        label="Width"
        value={cs.width || ''}
        onChange={v => apply('width', v === 'auto' ? '' : v)}
      />
      <DimInput
        label="Max-width"
        value={cs.maxWidth || ''}
        onChange={v => apply('maxWidth', v === 'auto' ? '' : v)}
      />
      <DimInput
        label="Height"
        value={cs.height || ''}
        onChange={v => apply('height', v === 'auto' ? '' : v)}
      />

      <div className="ise-divider" />

      <div className="ise-row ise-row--col">
        <div className="ise-row-head">
          <span className="ise-label">Border radius</span>
          <span className="ise-val">{radius}px</span>
          {radius > 0 && <button className="ise-reset" onClick={() => apply('borderRadius', '')}>↩</button>}
        </div>
        <div className="ise-slider-row">
          <span className="ise-edge">0</span>
          <input type="range" className="lpe-style-range" min="0" max="50" step="1"
            value={radius}
            onChange={e => apply('borderRadius', `${e.target.value}px`)} />
          <span className="ise-edge">50</span>
        </div>
      </div>

      <div className="ise-divider" />

      <div className="ise-row ise-row--col">
        <div className="ise-row-head">
          <span className="ise-label">Border</span>
          {hasBorder && <button className="ise-reset" onClick={() => { apply('borderWidth', ''); apply('borderStyle', ''); apply('borderColor', '') }}>↩</button>}
        </div>
        <div className="ise-border-grid">
          <div className="ise-row">
            <span className="ise-label ise-label--sm">Width</span>
            <div className="ise-dim">
              <input
                className="ise-num"
                type="number"
                min="0"
                max="20"
                placeholder="0"
                value={borderW || ''}
                onChange={e => {
                  const w = e.target.value
                  apply('borderWidth', w ? `${w}px` : '')
                  if (w && borderStyle === 'none') apply('borderStyle', 'solid')
                }}
              />
              <span className="ise-unit-fixed">px</span>
            </div>
          </div>
          <div className="ise-row">
            <span className="ise-label ise-label--sm">Style</span>
            <select
              className="lpe-style-select"
              value={borderStyle === 'none' ? '' : borderStyle}
              onChange={e => apply('borderStyle', e.target.value || 'none')}
            >
              <option value="">None</option>
              {BSTYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="ise-row ise-border-color-row">
            <span className="ise-label ise-label--sm">Color</span>
            <div className="ise-color-wrap">
              <input
                type="color"
                className="ise-color-picker"
                value={toHex(borderColor)}
                onChange={e => apply('borderColor', e.target.value)}
              />
              <input
                className="ise-color-text"
                value={borderColor}
                onChange={e => apply('borderColor', e.target.value)}
                placeholder="#000000"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ise-divider" />

      <div className="ise-row">
        <span className="ise-label">Float</span>
        <div className="ise-btns">
          {['none', 'left', 'right'].map(f => (
            <button
              key={f}
              className={`ise-btn${float === f ? ' ise-btn--on' : ''}`}
              onClick={() => apply('float', f === 'none' ? '' : f)}
            >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      {isImg && (
        <div className="ise-row">
          <span className="ise-label">Object-fit</span>
          <select className="lpe-style-select" value={fit}
            onChange={e => apply('objectFit', e.target.value)}>
            <option value="">Default</option>
            {FITS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      )}

      <div className="ise-row ise-row--col">
        <div className="ise-row-head">
          <span className="ise-label">Margin</span>
          <button
            className="ise-btn"
            onClick={() => apply('margin', '0 auto')}
            title="Center horizontally"
          >Center</button>
          {margin && <button className="ise-reset" onClick={() => apply('margin', '')}>↩</button>}
        </div>
        <div key={margin} className="ise-margin-grid">
          {[['T', 'top'], ['R', 'right'], ['B', 'bottom'], ['L', 'left']].map(([lbl, side]) => (
            <div key={side} className="ise-margin-cell">
              <span className="ise-margin-lbl">{lbl}</span>
              <input
                className="ise-margin-input"
                defaultValue={parseMargin(margin)[side]}
                placeholder="0"
                onBlur={e => {
                  const updated = { ...parseMargin(cs.margin || ''), [side]: e.target.value }
                  apply('margin', buildMargin(updated))
                }}
                onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
