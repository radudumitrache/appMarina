import NavBar from '../NavBar'
import Sk from '../../shared/Skeleton'

export default function ClassDetailSkeleton() {
  return (
    <div className="cd-page">
      <div className="cd-layout">
        <NavBar />
        <div style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Sk w={180} h={22} r={5} /><Sk w={60} h={20} r={4} />
          </div>
          <Sk w={120} h={12} r={4} />
          <div style={{ display: 'flex', gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ flex: 1, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                <Sk w="55%" h={22} r={4} mb={6} /><Sk w="70%" h={11} r={3} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {Array.from({ length: 3 }).map((_, i) => <Sk key={i} w={90} h={34} r={6} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
