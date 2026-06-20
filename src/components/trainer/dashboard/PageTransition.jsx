import '../../css/admin/dashboard/PageTransition.css'

export default function PageTransition({ onEnd }) {
  return (
    <div className="page-transition" onClick={onEnd}>
      <video
        className="page-transition-video"
        autoPlay muted playsInline
        onEnded={onEnd}
        onError={onEnd}
        src="/shipInThePortToshipInTheSea.mp4"
        onLoadedMetadata={e => { e.target.playbackRate = 2 }}
      />
    </div>
  )
}
