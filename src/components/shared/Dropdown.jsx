import { useState, useRef, useEffect } from 'react'
import '../css/shared/Dropdown.css'

function ChevronIcon({ open }) {
  return (
    <svg
      className={`dropdown-chevron${open ? ' dropdown-chevron--open' : ''}`}
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

/**
 * options: Array<{ value: any, label: string }>
 * value: the currently selected option's value (or null/undefined for none)
 * onChange: (value) => void
 * placeholder: string shown when nothing is selected
 */
export default function Dropdown({ value, onChange, options = [], placeholder = '— Select —', disabled = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const selected = options.find(o => o.value === value)
  const hasValue = value !== null && value !== undefined && value !== ''

  return (
    <div className={`dropdown${open ? ' dropdown--open' : ''}${disabled ? ' dropdown--disabled' : ''}`} ref={ref}>
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`dropdown-trigger-label${hasValue ? '' : ' dropdown-trigger-label--placeholder'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="dropdown-list" role="listbox">
          {options.map((opt) => {
            const isActive = opt.value === value
            return (
              <div
                key={opt.value ?? '__none__'}
                className={`dropdown-option${isActive ? ' dropdown-option--active' : ''}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                <span className="dropdown-option-label">{opt.label}</span>
                {isActive && <CheckIcon />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
