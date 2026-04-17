export const CAT_LABELS = {
  nav:   'Navigation',
  emg:   'Emergency',
  eng:   'Engineering',
  cargo: 'Cargo',
  comm:  'Communications',
}

export const CAT_COLORS = {
  nav:   'cat--nav',
  emg:   'cat--emg',
  eng:   'cat--eng',
  cargo: 'cat--cargo',
  comm:  'cat--comm',
}

export function formatDuration(mins) {
  if (!mins) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function totalDuration(lessons) {
  const mins = lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)
  return formatDuration(mins)
}
