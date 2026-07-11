import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import ClassDetailTopbar from '../../components/admin/class-detail/ClassDetailTopbar'
import ClassDetailHeader from '../../components/admin/class-detail/ClassDetailHeader'
import EditDetailsModal from '../../components/admin/class-detail/EditDetailsModal'
import AdminCrewPanel from '../../components/admin/class-detail/AdminCrewPanel'
import AdminCoursesPanel from '../../components/admin/class-detail/AdminCoursesPanel'
import {
  getDepartment, updateDepartment,
  getClassCrew, enrollCrew, removeCrew,
  getClassTests, getDiplomas, awardDiploma, revokeDiploma,
} from '../../api/departments'
import { getUsers, getTrainers } from '../../api/admin'
import { getCourses } from '../../api/modules'
import Sk from '../../components/shared/Skeleton'
import '../css/admin/ClassDetail.css'

function mapCrew(e) {
  return {
    id:                 e.crew,
    name:               e.crew_name,
    email:              e.crew_email,
    initials:           (e.crew_name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    courseLessonsDone:  e.course_lessons_done  ?? 0,
    courseLessonsTotal: e.course_lessons_total ?? 0,
    coursesDone:        e.courses_done  ?? 0,
    coursesTotal:       e.courses_total ?? 0,
    lastActive:         e.last_active ? new Date(e.last_active).toLocaleDateString() : '--',
    status:             e.status ?? 'active',
  }
}

export default function AdminDepartmentDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [cls, setCls]                   = useState(null)
  const [crew, setCrew]                 = useState([])
  const [diplomas, setDiplomas]         = useState([])
  const [courseCount, setCourseCount]   = useState(0)
  const [testCount,   setTestCount]     = useState(0)
  const [allCrew, setAllCrew]           = useState([])
  const [trainers,    setTrainers]      = useState([])
  const [loading, setLoading]           = useState(true)
  const [editMode, setEditMode]         = useState(false)
  const [editForm, setEditForm]         = useState(null)
  const [crewSearch,  setCrewSearch]    = useState('')
  const [crewFocus,   setCrewFocus]     = useState(false)

  useEffect(() => {
    Promise.all([
      getDepartment(id),
      getClassCrew(id),
      getCourses(),
      getClassTests(id),
      getUsers({ 'userprofile__role': 'crew' }),
      getTrainers(),
      getDiplomas(id),
    ]).then(([clsRes, crewRes, coursesRes, tstRes, allCrewRes, tchRes, dipRes]) => {
      const deptId = Number(id)
      setCls(clsRes.data)
      setCrew((crewRes.data ?? []).map(mapCrew))
      setCourseCount((coursesRes.data ?? []).filter(c => c.departments?.some(d => d.id === deptId)).length)
      setTestCount((tstRes.data ?? []).length)
      setAllCrew(allCrewRes.data.map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}`.trim() || u.username, email: u.email })))
      setTrainers(tchRes.data)
      setDiplomas(dipRes.data ?? [])
    }).finally(() => setLoading(false))
  }, [id])

  const handleAwardDiploma = async (diplomaId, crewMemberId) => {
    try {
      const { data } = await awardDiploma(id, diplomaId, { crew_ids: [crewMemberId] })
      setDiplomas(prev => prev.map(d => d.id === data.id ? data : d))
    } catch {}
  }

  const handleRevokeDiploma = async (diplomaId, crewMemberId) => {
    try {
      await revokeDiploma(id, diplomaId, crewMemberId)
      setDiplomas(prev => prev.map(d => d.id === diplomaId
        ? { ...d, recipients: (d.recipients ?? []).filter(r => r.id !== crewMemberId) }
        : d
      ))
    } catch {}
  }

  const openEdit = () => {
    setEditForm({
      name:       cls.name,
      code:       cls.code,
      subject:    cls.subject,
      trainer:    cls.trainer,
      start_date: cls.start_date,
      end_date:   cls.end_date,
      status:     cls.status,
    })
    setEditMode(true)
  }

  const saveEdit = async () => {
    if (!editForm.name.trim()) return
    try {
      const { data } = await updateDepartment(id, editForm)
      setCls(data)
    } catch {}
    setEditMode(false)
  }

  const handleEditChange = (field, value) => setEditForm(f => ({ ...f, [field]: value }))

  const toggleArchive = async () => {
    const newStatus = cls.status === 'active' ? 'archived' : 'active'
    try {
      const { data } = await updateDepartment(id, { status: newStatus })
      setCls(data)
    } catch {}
  }

  const enrolledIds = useMemo(() => new Set(crew.map(s => s.id)), [crew])

  const crewSuggestions = useMemo(() => {
    const q = crewSearch.trim().toLowerCase()
    if (!q) return []
    return allCrew.filter(s =>
      !enrolledIds.has(s.id) &&
      (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
    )
  }, [crewSearch, allCrew, enrolledIds])

  const addCrew = async s => {
    setCrewSearch('')
    try {
      const { data } = await enrollCrew(id, { email: s.email })
      const mapped = data?.crew ? mapCrew(data) : {
        id: s.id, name: s.name, email: s.email,
        initials: (s.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        courseLessonsDone: 0, courseLessonsTotal: 0, coursesDone: 0, coursesTotal: 0,
        lastActive: '--', status: 'active',
      }
      setCrew(prev => [...prev, mapped])
    } catch {}
  }

  const handleRemoveCrew = async uid => {
    setCrew(prev => prev.filter(s => s.id !== uid))
    try {
      await removeCrew(id, uid)
    } catch {
      setCrew(prev => [...prev])
    }
  }

  if (loading) {
    return (
      <div className="cd-page">
        <NavBar />
        <div style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Sk w={120} h={13} r={4} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Sk w={220} h={26} r={6} />
            <Sk w={64} h={20} r={4} />
          </div>
          <Sk w={160} h={13} r={4} />
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div style={{ width: 300, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Sk w={90} h={14} r={4} />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', opacity: 1 - j * 0.15 }}>
                  <Sk w={28} h={28} r={14} style={{ flexShrink: 0 }} />
                  <Sk w={`${50 + (j % 3) * 12}%`} h={12} r={4} />
                </div>
              ))}
            </div>
            <div style={{ flex: 1, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Sk w={90} h={14} r={4} />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', opacity: 1 - j * 0.2 }}>
                  <Sk w={`${60 + (j % 2) * 15}%`} h={12} r={4} />
                  <Sk w={50} h={22} r={4} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cls) {
    return (
      <div className="cd-page">
        <NavBar />
        <div className="cd-not-found">
          <p>Department not found.</p>
          <button className="btn-ghost" onClick={() => navigate('/admin/departments')}>Back to Departments</button>
        </div>
      </div>
    )
  }

  return (
    <div className="cd-page">
      <NavBar />

      <ClassDetailTopbar
        status={cls.status}
        onBack={() => navigate('/admin/departments')}
        onToggleArchive={toggleArchive}
        onEdit={openEdit}
      />

      <ClassDetailHeader cls={cls} crewCount={crew.length} courseCount={courseCount} testCount={testCount} />

      <div className="cd-panels cd-panels--two-col">
        <div className="cd-panels-crew">
          <AdminCrewPanel
            crew={crew}
            diplomas={diplomas}
            searchValue={crewSearch}
            onSearchChange={setCrewSearch}
            suggestions={crewSuggestions}
            isFocused={crewFocus}
            onFocus={() => setCrewFocus(true)}
            onBlur={() => setTimeout(() => setCrewFocus(false), 150)}
            onAdd={addCrew}
            onRemove={handleRemoveCrew}
            onAward={handleAwardDiploma}
            onRevoke={handleRevokeDiploma}
          />
        </div>
        <div className="cd-panels-courses">
          <AdminCoursesPanel departmentId={id} />
        </div>
      </div>

      {editMode && (
        <EditDetailsModal
          editForm={editForm}
          onChange={handleEditChange}
          onClose={() => setEditMode(false)}
          onSave={saveEdit}
          trainers={trainers}
        />
      )}
    </div>
  )
}
