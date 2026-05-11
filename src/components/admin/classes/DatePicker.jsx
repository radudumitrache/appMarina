import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../../css/admin/classes/DatePicker.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa']

function parseYMD(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toYMD(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

function formatDisplay(str) {
  const d = parseYMD(str)
  if (!d) return null
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function buildCells(year, month) {
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev  = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, cur: false })
  for (let d = 1; d <= daysInMonth; d++)  cells.push({ day: d, cur: true })
  while (cells.length % 7 !== 0)          cells.push({ day: cells.length - firstDay - daysInMonth + 1, cur: false })
  return cells
}

export default function DatePicker({ value, onChange, placeholder = 'Select date', hasError }) {
  const today = new Date()
  const sel   = parseYMD(value)

  const [open,       setOpen]       = useState(false)
  const [viewYear,   setViewYear]   = useState((sel ?? today).getFullYear())
  const [viewMonth,  setViewMonth]  = useState((sel ?? today).getMonth())
  const [popStyle,   setPopStyle]   = useState({})

  const triggerRef  = useRef(null)
  const popoverRef  = useRef(null)

  const openPicker = () => {
    const r     = triggerRef.current.getBoundingClientRect()
    const popW  = 296
    const popH  = 340
    const left  = r.left + popW > window.innerWidth ? r.right - popW : r.left
    const below = r.bottom + 6 + popH <= window.innerHeight
    const top   = below ? r.bottom + 6 : r.top - popH - 6
    setPopStyle({ position: 'fixed', top, left, width: popW, zIndex: 500 })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = e => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !popoverRef.current?.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const prevMonth = e => {
    e.stopPropagation()
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = e => {
    e.stopPropagation()
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const select = cell => {
    if (!cell.cur) return
    onChange(toYMD(new Date(viewYear, viewMonth, cell.day)))
    setOpen(false)
  }

  const isSelected = c => sel && c.cur
    && sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && sel.getDate() === c.day
  const isToday = c => c.cur
    && today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === c.day

  const cells = buildCells(viewYear, viewMonth)

  return (
    <div className="dp-root" ref={triggerRef}>
      <button
        type="button"
        className={[
          'dp-trigger',
          'form-input',
          hasError ? 'form-input--error' : '',
          open ? 'dp-trigger--open' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => open ? setOpen(false) : openPicker()}
      >
        <span className={value ? 'dp-value' : 'dp-placeholder'}>
          {formatDisplay(value) ?? placeholder}
        </span>
        <svg className="dp-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && createPortal(
        <div className="dp-popover" ref={popoverRef} style={popStyle}>
          <div className="dp-header">
            <button type="button" className="dp-nav" onClick={prevMonth} aria-label="Previous month">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span className="dp-month-label">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" className="dp-nav" onClick={nextMonth} aria-label="Next month">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <div className="dp-grid">
            {DAY_NAMES.map(d => (
              <span key={d} className="dp-day-name">{d}</span>
            ))}
            {cells.map((cell, i) => (
              <button
                key={i}
                type="button"
                className={[
                  'dp-day',
                  !cell.cur        ? 'dp-day--other'    : '',
                  isSelected(cell) ? 'dp-day--selected' : '',
                  isToday(cell)    ? 'dp-day--today'    : '',
                ].filter(Boolean).join(' ')}
                onClick={() => select(cell)}
                tabIndex={cell.cur ? 0 : -1}
              >
                {cell.day}
              </button>
            ))}
          </div>

          {value && (
            <div className="dp-footer">
              <button type="button" className="dp-clear" onClick={() => { onChange(''); setOpen(false) }}>
                Clear
              </button>
              <span className="dp-selected-label">{formatDisplay(value)}</span>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
