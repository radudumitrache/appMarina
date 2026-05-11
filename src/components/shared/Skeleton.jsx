import '../css/shared/Skeleton.css'

export default function Sk({ w = '100%', h = 14, r = 6, mb, style }) {
  return (
    <div className="sk" style={{ width: w, height: h, borderRadius: r, marginBottom: mb, ...style }} />
  )
}
