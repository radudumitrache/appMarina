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
