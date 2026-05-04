export function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function qualExpiresSoon(iso) {
  if (!iso) return false
  const diff = (new Date(iso) - new Date()) / (1000 * 60 * 60 * 24)
  return diff > 0 && diff <= 180
}
