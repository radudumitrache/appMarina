import ClassCard from './ClassCard'
import Sk from '../../shared/Skeleton'

export default function ClassesSection({ title, classes, startIndex, loading, skeletonCount = 4, onManage, onEdit, onToggleArchive, onDelete }) {
  return (
    <div className="classes-section">
      <div className="classes-section-head">
        <span className="classes-section-title">{title}</span>
        {!loading && (
          <span className="classes-section-count">{classes.length}</span>
        )}
      </div>

      <div className="classes-grid">
        {loading ? (
          Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="class-card" style={{ opacity: 1 - i * 0.15, animation: 'none' }}>
              <div className="class-card-header">
                <div className="class-card-name-row">
                  <Sk w={`${55 + (i % 3) * 10}%`} h={16} r={4} />
                  <Sk w={52} h={18} r={4} style={{ flexShrink: 0 }} />
                </div>
                <Sk w="45%" h={11} r={3} />
              </div>
              <div className="class-card-teacher">
                <Sk w={120} h={12} r={3} />
              </div>
              <div className="class-card-counts" style={{ gap: 8 }}>
                <Sk w={90} h={28} r={4} />
                <Sk w={90} h={28} r={4} />
              </div>
              <div className="class-card-actions" style={{ paddingTop: 4, borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
                <Sk h={30} r={4} />
                <Sk h={30} r={4} />
                <Sk h={30} r={4} />
              </div>
            </div>
          ))
        ) : classes.length === 0 ? (
          <p className="classes-section-empty">No {title.toLowerCase()} classes.</p>
        ) : (
          classes.map((cls, i) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              index={startIndex + i}
              onManage={() => onManage(cls)}
              onEdit={() => onEdit(cls)}
              onToggleArchive={() => onToggleArchive(cls.id)}
              onDelete={() => onDelete(cls)}
            />
          ))
        )}
      </div>
    </div>
  )
}
