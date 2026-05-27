import '../../css/student/my-class/ClassTabs.css'

export default function ClassTabs({ classes, selectedId, onSelect, showJoinForm, onToggleJoin }) {
  return (
    <div className="myclass-tabs">
      <div className="myclass-tabs-inner">
        {classes.map(cls => (
          <button
            key={cls.id}
            className={`myclass-tab${cls.id === selectedId ? ' myclass-tab--active' : ''}`}
            onClick={() => onSelect(cls.id)}
          >
            {cls.name}
          </button>
        ))}
        <button
          className={`myclass-tab-join${showJoinForm ? ' myclass-tab-join--active' : ''}`}
          onClick={onToggleJoin}
          title="Join another department"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5"  y1="12" x2="19" y2="12"/>
          </svg>
          Join department
        </button>
      </div>
    </div>
  )
}
