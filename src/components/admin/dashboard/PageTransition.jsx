import '../../../css/admin/dashboard/PageTransition.css'

export default function PageTransition({ src, onEnd }) {
  return (
    <div className="page-transition">
      <video
        className="page-transition-video"
        autoPlay muted playsInline
        src={src}
        onEnded={onEnd}
        onError={onEnd}
        onLoadedMetadata={e => { e.target.playbackRate = 2 }}
      />
    </div>
  )
}
