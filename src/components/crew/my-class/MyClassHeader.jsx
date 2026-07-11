import '../../css/crew/my-class/MyClassHeader.css'

export default function MyClassHeader({ classInfo, onBack }) {
  return (
    <header className="myclass-header">
      <div className="myclass-header-left">
        <div className="myclass-breadcrumb">
          <button className="breadcrumb-link" onClick={onBack}>
            Dashboard
          </button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="breadcrumb-current">My Department</span>
        </div>
        <div className="myclass-header-title-row">
          <h1 className="myclass-page-title">{classInfo.name}</h1>
          <span className="myclass-code">{classInfo.code}</span>
        </div>
      </div>
      <div className="myclass-header-right">
        <span className="myclass-trainer-label">Instructor</span>
        <span className="myclass-trainer-name">{classInfo.trainer}</span>
        <span className="myclass-semester">{classInfo.semester}</span>
      </div>
    </header>
  )
}
