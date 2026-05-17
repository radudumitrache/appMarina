import { useState, useEffect, useRef, useCallback } from 'react'
import '../css/shared/ColorPicker.css'

/* ── Color math ─────────────────────────────────────────────────────────── */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  if (h.length !== 6) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max, v = max
  if (d > 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: h * 360, s, v }
}

function hsvToRgb(h, s, v) {
  h /= 360
  const i = Math.floor(h * 6), f = h * 6 - i
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s)
  const cases = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]]
  const [r, g, b] = cases[i % 6]
  return { r: r * 255, g: g * 255, b: b * 255 }
}

function isValidHex(h) { return /^#[0-9a-fA-F]{6}$/.test(h) }

/* ── Presets ─────────────────────────────────────────────────────────────── */
const PRESETS = [
  '#ffffff', '#e4edf6', '#9db0c5', '#6b83a0', '#3a4f6a',
  '#253550', '#111b2e', '#0b1220', '#060b14', '#000000',
  '#0bbda4', '#08a38e', '#d9a030', '#e05252', '#2ec77a',
  '#4a9fd4', '#c77dff', '#ff6b6b', '#ff9f43', '#ffd93d',
]

/* ── Component ───────────────────────────────────────────────────────────── */
export default function ColorPicker({ value = '#000000', onChange }) {
  const [open,     setOpen]     = useState(false)
  const [hsv,      setHsv]      = useState(() => { const { r, g, b } = hexToRgb(value); return rgbToHsv(r, g, b) })
  const [hexInput, setHexInput] = useState(value)
  const [dragging, setDragging] = useState(null)
  const [flipUp,   setFlipUp]   = useState(false)

  const rootRef    = useRef(null)
  const popRef     = useRef(null)
  const svRef      = useRef(null)
  const hueRef     = useRef(null)

  /* sync external value changes */
  useEffect(() => {
    if (open || !isValidHex(value)) return
    const { r, g, b } = hexToRgb(value)
    setHsv(rgbToHsv(r, g, b))
    setHexInput(value)
  }, [value, open])

  /* auto-flip popover if near bottom of viewport */
  useEffect(() => {
    if (!open || !rootRef.current || !popRef.current) return
    const triggerBottom = rootRef.current.getBoundingClientRect().bottom
    const spaceBelow    = window.innerHeight - triggerBottom
    setFlipUp(spaceBelow < popRef.current.offsetHeight + 12)
  }, [open])

  /* close on outside click / escape */
  useEffect(() => {
    if (!open) return
    const down = e => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false) }
    const key  = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [open])

  const commit = useCallback((h, s, v) => {
    const { r, g, b } = hsvToRgb(h, s, v)
    const hex = rgbToHex(r, g, b)
    setHexInput(hex)
    onChange?.(hex)
  }, [onChange])

  const handleSvPointer = useCallback((e, rect) => {
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left)  / rect.width))
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))
    const next = { h: hsv.h, s, v }
    setHsv(next)
    commit(next.h, next.s, next.v)
  }, [hsv.h, commit])

  const handleHuePointer = useCallback((e, rect) => {
    const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360))
    const next = { ...hsv, h }
    setHsv(next)
    commit(next.h, next.s, next.v)
  }, [hsv, commit])

  /* global drag handlers */
  useEffect(() => {
    if (!dragging) return
    const move = e => {
      if (dragging === 'sv'  && svRef.current)  handleSvPointer(e,  svRef.current.getBoundingClientRect())
      if (dragging === 'hue' && hueRef.current) handleHuePointer(e, hueRef.current.getBoundingClientRect())
    }
    const up = () => setDragging(null)
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
  }, [dragging, handleSvPointer, handleHuePointer])

  const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v)
  const currentHex  = rgbToHex(r, g, b)
  const hueColor    = `hsl(${hsv.h}, 100%, 50%)`

  return (
    <div className="cp-root" ref={rootRef}>
      <button
        type="button"
        className="cp-trigger"
        style={{ background: currentHex }}
        onClick={() => setOpen(o => !o)}
        title={currentHex}
      />

      {open && (
        <div
          ref={popRef}
          className={`cp-popover${flipUp ? ' cp-popover--flip' : ''}`}
        >
          {/* Saturation / Value square */}
          <div
            ref={svRef}
            className="cp-sv"
            style={{ background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, ${hueColor})` }}
            onMouseDown={e => {
              e.preventDefault()
              setDragging('sv')
              handleSvPointer(e, e.currentTarget.getBoundingClientRect())
            }}
          >
            <div
              className="cp-sv-thumb"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
            />
          </div>

          {/* Hue bar */}
          <div
            ref={hueRef}
            className="cp-hue"
            onMouseDown={e => {
              e.preventDefault()
              setDragging('hue')
              handleHuePointer(e, e.currentTarget.getBoundingClientRect())
            }}
          >
            <div
              className="cp-hue-thumb"
              style={{ left: `${(hsv.h / 360) * 100}%` }}
            />
          </div>

          {/* Hex input */}
          <div className="cp-hex-row">
            <div className="cp-hex-preview" style={{ background: currentHex }} />
            <input
              className="cp-hex-input"
              value={hexInput}
              maxLength={7}
              spellCheck={false}
              onChange={e => {
                const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value
                setHexInput(e.target.value)
                if (isValidHex(v)) {
                  const { r, g, b } = hexToRgb(v)
                  setHsv(rgbToHsv(r, g, b))
                  onChange?.(v)
                }
              }}
              onBlur={() => { if (!isValidHex(hexInput)) setHexInput(currentHex) }}
            />
          </div>

          {/* Preset palette */}
          <div className="cp-presets">
            {PRESETS.map(p => (
              <button
                key={p}
                type="button"
                className={`cp-preset${p.toLowerCase() === currentHex.toLowerCase() ? ' cp-preset--active' : ''}`}
                style={{ background: p }}
                onClick={() => {
                  const { r, g, b } = hexToRgb(p)
                  setHsv(rgbToHsv(r, g, b))
                  setHexInput(p)
                  onChange?.(p)
                }}
                title={p}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
