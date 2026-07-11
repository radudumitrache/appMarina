import PersonalInfoTab   from './PersonalInfoTab'
// import AcademicTab       from './AcademicTab'
import AchievementsTab   from './AchievementsTab'
// import CertificationsTab from './CertificationsTab'
import SecurityTab       from './SecurityTab'
import DiplomasTab       from './DiplomasTab'

const TABS = [
  { id: 'personal',     label: 'Personal Info' },
  // { id: 'academic',  label: 'Academic'      },
  { id: 'achievements', label: 'Achievements'  },
  // { id: 'certs',     label: 'Certifications'},
  { id: 'diplomas',     label: 'Diplomas'      },
  { id: 'security',     label: 'Security'      },
]

export default function ProfileTabs({
  activeTab, onTabChange,
  profile, stats, achievements, certifications, diplomas,
  onSave, onChangePassword,
}) {
  const studentName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : ''

  return (
    <div className="profile-main">
      <div className="profile-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'profile-tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'personal'     && <PersonalInfoTab  profile={profile}                            onSave={onSave}           />}
      {/* {activeTab === 'academic'  && <AcademicTab      profile={profile} stats={stats}                                       />} */}
      {activeTab === 'achievements' && <AchievementsTab  achievements={achievements}                                            />}
      {/* {activeTab === 'certs'     && <CertificationsTab certifications={certifications}                                       />} */}
      {activeTab === 'diplomas'     && <DiplomasTab      diplomas={diplomas ?? []} studentName={studentName}                    />}
      {activeTab === 'security'     && <SecurityTab      onChangePassword={onChangePassword}                                    />}
    </div>
  )
}
