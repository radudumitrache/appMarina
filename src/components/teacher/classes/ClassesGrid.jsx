import Sk from '../../shared/Skeleton'
import ClassCard from './ClassCard'

export default function ClassesGrid({ loading, classes, onView, onDelete }) {
  if (loading) {
    return (
      <div className="classes-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="class-card" style={{ opacity: 1 - i * 0.15, animation: 'none' }}>
            <div className="class-card-top">
              <Sk w={`${55 + (i % 3) * 10}%`} h={15} r={4} />
              <Sk w={52} h={18} r={4} style={{ flexShrink: 0 }} />
            </div>
            <div className="class-card-meta">
              <Sk w={90} h={13} r={3} />
              <Sk w={90} h={13} r={3} />
            </div>
            <div className="class-card-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: 4 }}>
              <Sk h={34} r={6} />
              <Sk w={34} h={34} r={6} style={{ flexShrink: 0 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (classes.length === 0) {
    return <p className="classes-empty">No departments match your search.</p>
  }

  return (
    <div className="classes-grid">
      {classes.map((cls, i) => (
        <ClassCard
          key={cls.id}
          cls={cls}
          index={i}
          onView={() => onView(cls)}
          onDelete={() => onDelete(cls)}
        />
      ))}
    </div>
  )
}
