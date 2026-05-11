import Sk from '../../shared/Skeleton'

export default function LessonsSkeleton() {
  return (
    <div className="les-skeletons">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="les-sk-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sk w="55%" h={14} r={4} />
            <Sk w={80} h={4} r={2} style={{ marginLeft: 'auto' }} />
            <Sk w={34} h={11} r={3} />
          </div>
          <Sk w="30%" h={11} r={3} mt={6} />
        </div>
      ))}
    </div>
  )
}
