import '../../css/trainer/tests/TestsContent.css'
import TestCard from './TestCard'

export default function TestsContent({ published, drafts }) {
  return (
    <div className="ttests-content">
      <section className="ttests-section">
        <div className="ttests-section-head">
          <span className="ttests-section-title">Published</span>
          <span className="ttests-section-badge">{published.length}</span>
        </div>
        {published.length === 0 ? (
          <p className="ttests-empty">No published tests.</p>
        ) : (
          <div className="ttests-list">
            {published.map((test, i) => (
              <TestCard key={test.id} test={test} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="ttests-section">
        <div className="ttests-section-head">
          <span className="ttests-section-title">Drafts</span>
          <span className="ttests-section-badge">{drafts.length}</span>
        </div>
        {drafts.length === 0 ? (
          <p className="ttests-empty">No draft tests.</p>
        ) : (
          <div className="ttests-list">
            {drafts.map((test, i) => (
              <TestCard key={test.id} test={test} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
