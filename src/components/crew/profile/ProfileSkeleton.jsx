import Sk from '../../shared/Skeleton'

const TABS = [
  { id: 'personal' }, { id: 'academic' }, { id: 'achievements' }, { id: 'security' },
]

export default function ProfileSkeleton() {
  return (
    <>
      <header className="profile-header">
        <Sk w={200} h={13} r={4} mb={10} />
        <Sk w={120} h={26} r={6} />
      </header>
      <div className="profile-body">
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Sk h={260} r={12} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {TABS.map(t => <Sk key={t.id} w={110} h={34} r={6} />)}
          </div>
          <Sk h={320} r={10} />
        </div>
      </div>
    </>
  )
}
