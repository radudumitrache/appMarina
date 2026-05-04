export default function LogoutTransition({ onEnd }) {
  return (
    <div className="page-transition">
      <video
        className="page-transition-video"
        autoPlay muted playsInline
        onEnded={onEnd}
        onError={onEnd}
        src="/shipInThePortToshipInTheSea.mp4"
        onLoadedMetadata={(e) => { e.target.playbackRate = 2 }}
      />
    </div>
  )
}
