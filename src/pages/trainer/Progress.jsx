import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar            from '../../components/trainer/NavBar'
import ProgressStats     from '../../components/trainer/progress/ProgressStats'
import ProgressClassTabs from '../../components/trainer/progress/ProgressClassTabs'
import ProgressToolbar   from '../../components/trainer/progress/ProgressToolbar'
import ProgressTable     from '../../components/trainer/progress/ProgressTable'
import { getTrainerProgress } from '../../api/progress'
import { getDepartments, getDiplomas, awardDiploma, revokeDiploma } from '../../api/departments'
import Sk from '../../components/shared/Skeleton'
import '../css/trainer/Progress.css'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function relativeTime(iso) {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d}d ago`
  return `${Math.floor(d / 7)}w ago`
}

function mapCrew(s) {
  return {
    id:            s.crew_member_id,
    name:          s.crew_name,
    initials:      initials(s.crew_name),
    departmentId:  s.department_id,
    className:     s.department_name,
    coursesDone:   s.courses_done,
    coursesTotal:  s.courses_total,
    lastActive:    relativeTime(s.last_active),
    status:        s.status,
  }
}

export default function Progress() {
  const navigate = useNavigate()

  const [crew,              setCrew]              = useState([])
  const [departments,       setDepartments]       = useState([])
  const [loading,           setLoading]           = useState(true)
  const [departmentFilter,  setDepartmentFilter]  = useState('all')
  const [search,          setSearch]          = useState('')
  const [sortBy,          setSortBy]          = useState('name')
  const [page,            setPage]            = useState(1)
  const [pageSize,        setPageSize]        = useState(10)

  useEffect(() => {
    Promise.all([getTrainerProgress(), getDepartments()])
      .then(([progRes, clsRes]) => {
        setCrew(progRes.data.map(mapCrew))
        setDepartments([
          { id: 'all', label: 'All Departments' },
          ...clsRes.data.map(c => ({ id: c.id, label: c.code ? `${c.code} — ${c.name}` : c.name })),
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  const [diplomaCache, setDiplomaCache] = useState({})
  const [busyIds,      setBusyIds]      = useState(new Set())

  async function fetchDiplomas(deptId) {
    if (diplomaCache[deptId]) return diplomaCache[deptId]
    const { data } = await getDiplomas(deptId)
    setDiplomaCache(prev => ({ ...prev, [deptId]: data }))
    return data
  }

  function setCrewStatus(crewId, deptId, status) {
    setCrew(prev => prev.map(s =>
      s.id === crewId && s.departmentId === deptId ? { ...s, status } : s
    ))
  }

  async function handleAward(crewMember) {
    const key = `${crewMember.id}-${crewMember.departmentId}`
    setBusyIds(prev => new Set([...prev, key]))
    try {
      const diplomas = await fetchDiplomas(crewMember.departmentId)
      await Promise.all(
        diplomas.map(d => awardDiploma(crewMember.departmentId, d.id, { crew_ids: [crewMember.id] }))
      )
      setCrewStatus(crewMember.id, crewMember.departmentId, 'awarded')
    } catch { /* leave status as-is */ }
    finally { setBusyIds(prev => { const n = new Set(prev); n.delete(key); return n }) }
  }

  async function handleRevoke(crewMember) {
    if (crewMember.status !== 'awarded') return
    const key = `${crewMember.id}-${crewMember.departmentId}`
    setBusyIds(prev => new Set([...prev, key]))
    try {
      const diplomas = await fetchDiplomas(crewMember.departmentId)
      const awardedDiplomas = diplomas.filter(d => d.recipients?.some(r => r.id === crewMember.id))
      await Promise.all(
        awardedDiplomas.map(d => revokeDiploma(crewMember.departmentId, d.id, crewMember.id))
      )
      const revertStatus = crewMember.coursesTotal > 0 && crewMember.coursesDone === crewMember.coursesTotal
        ? 'completed'
        : crewMember.coursesDone > 0 ? 'in-progress' : 'to-begin'
      setCrewStatus(crewMember.id, crewMember.departmentId, revertStatus)
    } catch { /* leave status as-is */ }
    finally { setBusyIds(prev => { const n = new Set(prev); n.delete(key); return n }) }
  }

  async function handleBulkAward(crewList) {
    await Promise.allSettled(crewList.map(s => handleAward(s)))
  }

  async function handleBulkRevoke(crewList) {
    await Promise.allSettled(crewList.map(s => handleRevoke(s)))
  }

  const visible = useMemo(() => {
    setPage(1)
    return crew
      .filter(s => departmentFilter === 'all' || s.departmentId === departmentFilter)
      .filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        s.className.toLowerCase().includes(search.toLowerCase().trim())
      )
      .sort((a, b) => {
        if (sortBy === 'name')     return a.name.localeCompare(b.name)
        if (sortBy === 'progress') return (b.coursesDone / (b.coursesTotal || 1)) - (a.coursesDone / (a.coursesTotal || 1))
        return 0
      })
  }, [crew, departmentFilter, search, sortBy])

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize))
  const paginated  = visible.slice((page - 1) * pageSize, page * pageSize)

  const avgPct = crew.length
    ? Math.round(crew.reduce((sum, s) => sum + (s.coursesDone / (s.coursesTotal || 1)) * 100, 0) / crew.length)
    : 0


  if (loading) {
    return (
      <div className="tp-page">
        <NavBar />
        <header className="tp-header">
          <div className="tp-header-left">
            <Sk w={180} h={13} r={4} mb={8} />
            <Sk w={160} h={24} r={6} />
          </div>
        </header>
        <div className="tp-content">
          <div className="tp-stats">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="tp-stat-card">
                <Sk w="60%" h={11} r={3} mb={8} />
                <Sk w="40%" h={28} r={4} mb={6} />
                <Sk w="70%" h={10} r={3} />
              </div>
            ))}
          </div>
          <div className="tp-body">
            <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => <Sk key={i} w="100%" h={56} r={8} />)}
            </div>
            <div className="tp-main">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--border)', opacity: 1 - i * 0.1 }}>
                  <Sk w={32} h={32} r={16} style={{ flexShrink: 0 }} />
                  <Sk w={`${120 + (i % 3) * 30}px`} h={13} r={4} />
                  <Sk w={100} h={13} r={4} style={{ marginLeft: 'auto' }} />
                  <Sk w={120} h={8} r={4} />
                  <Sk w={40} h={13} r={4} />
                  <Sk w={60} h={13} r={4} />
                  <Sk w={64} h={20} r={4} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tp-page">
      <NavBar />

      <header className="tp-header">
        <div className="tp-header-left">
          <div className="tp-breadcrumb">
            <button className="tp-crumb-link" onClick={() => navigate('/trainer/dashboard')}>Dashboard</button>
            <span className="tp-crumb-sep">/</span>
          </div>
          <h1 className="tp-title">Crew Progress</h1>
        </div>
      </header>

      <div className="tp-content">
        <ProgressStats
          totalCrew={crew.length}
          classCount={departments.length - 1}
          avgPct={avgPct}
        />

        <div className="tp-body">
          <ProgressClassTabs
            departments={departments}
            crew={crew}
            departmentFilter={departmentFilter}
            onDepartmentChange={setDepartmentFilter}
          />

          <div className="tp-main">
            <ProgressToolbar
              search={search}
              onSearchChange={setSearch}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <ProgressTable
              crew={paginated}
              allVisible={visible}
              filteredCount={visible.length}
              totalCount={crew.length}
              selectedId={null}
              onSelect={s => navigate(`/trainer/crew/${s.id}/progress`)}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={n => { setPageSize(n); setPage(1) }}
              busyIds={busyIds}
              onAward={handleAward}
              onRevoke={handleRevoke}
              onBulkAward={handleBulkAward}
              onBulkRevoke={handleBulkRevoke}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
