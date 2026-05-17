import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import OrgFormModal from '../../components/admin/organisations/OrgFormModal'
import OrgDeleteModal from '../../components/admin/organisations/OrgDeleteModal'
import Sk from '../../components/shared/Skeleton'
import { useAuth } from '../../auth/AuthContext'
import {
  getOrganisations, createOrganisation, updateOrganisation, deleteOrganisation,
} from '../../api/organisations'
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
} from '../../api/departments'
import '../css/admin/Organisations.css'

function BuildingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
    </svg>
  )
}

function DeptIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="6" height="4" rx="1"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <rect x="16" y="3" width="6" height="4" rx="1"/>
      <path d="M5 7v3m7-3v3m7-3v3"/>
      <path d="M5 10h14"/>
      <rect x="8" y="13" width="8" height="4" rx="1"/>
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

export default function Organisations() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirect non-superadmins away from this page
  useEffect(() => {
    if (user && !user.is_staff) navigate('/admin/dashboard', { replace: true })
  }, [user, navigate])

  const [tab, setTab] = useState('organisations')

  const [orgs, setOrgs]           = useState([])
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [depts, setDepts]         = useState([])
  const [deptsLoading, setDeptsLoading] = useState(true)

  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formName, setFormName]   = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    getOrganisations().then(r => setOrgs(r.data)).finally(() => setOrgsLoading(false))
    getDepartments().then(r => setDepts(r.data)).finally(() => setDeptsLoading(false))
  }, [])

  const isOrgs      = tab === 'organisations'
  const items       = isOrgs ? orgs : depts
  const loading     = isOrgs ? orgsLoading : deptsLoading
  const entityLabel = isOrgs ? 'Organisation' : 'Department'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? items.filter(o => o.name.toLowerCase().includes(q)) : items
  }, [items, search])

  const totalMembers = useMemo(() => items.reduce((s, o) => s + (o.member_count ?? 0), 0), [items])

  const switchTab = t => { setTab(t); setSearch('') }

  const openCreate = () => { setFormName(''); setFormError(''); setModal('create') }
  const openEdit   = item => { setFormName(item.name); setFormError(''); setModal(item) }

  const handleSave = async () => {
    if (!formName.trim()) { setFormError('Name is required.'); return }
    setSaving(true)
    setFormError('')
    try {
      if (isOrgs) {
        if (modal === 'create') {
          const { data } = await createOrganisation({ name: formName.trim() })
          setOrgs(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        } else {
          const { data } = await updateOrganisation(modal.id, { name: formName.trim() })
          setOrgs(prev => prev.map(o => o.id === modal.id ? data : o))
        }
      } else {
        if (modal === 'create') {
          const { data } = await createDepartment({ name: formName.trim() })
          setDepts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        } else {
          const { data } = await updateDepartment(modal.id, { name: formName.trim() })
          setDepts(prev => prev.map(o => o.id === modal.id ? data : o))
        }
      }
      setModal(null)
    } catch (err) {
      const msg = err?.response?.data?.name?.[0]
        || err?.response?.data?.detail
        || 'Something went wrong.'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      if (isOrgs) {
        await deleteOrganisation(deleteTarget.id)
        setOrgs(prev => prev.filter(o => o.id !== deleteTarget.id))
      } else {
        await deleteDepartment(deleteTarget.id)
        setDepts(prev => prev.filter(o => o.id !== deleteTarget.id))
      }
      setDeleteTarget(null)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="org-page">
      <div className="org-layout">
        <NavBar />

        {/* ── Header ── */}
        <div className="org-header">
          <div className="org-header-left">
            <h1 className="org-page-title">{isOrgs ? 'Organisations' : 'Departments'}</h1>
            <span className="org-count-badge">{items.length}</span>
          </div>
          <div className="org-header-right">
            <div className="org-search-wrap">
              <svg className="org-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="org-search-input"
                placeholder={`Search ${isOrgs ? 'organisations' : 'departments'}…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={openCreate}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New {entityLabel}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="org-tabs">
          <button
            className={`org-tab${tab === 'organisations' ? ' org-tab--active' : ''}`}
            onClick={() => switchTab('organisations')}
          >
            Organisations
          </button>
          <button
            className={`org-tab${tab === 'departments' ? ' org-tab--active' : ''}`}
            onClick={() => switchTab('departments')}
          >
            Departments
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="org-stats">
          <div className="org-stat-card">
            <span className="org-stat-value">{loading ? '—' : items.length}</span>
            <span className="org-stat-label">Total {isOrgs ? 'Organisations' : 'Departments'}</span>
          </div>
          <div className="org-stat-card">
            <span className="org-stat-value">{loading ? '—' : totalMembers}</span>
            <span className="org-stat-label">Total Members</span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="org-main">
          <div className="org-table">
            <div className="org-table-head">
              <span className="org-col org-col--name">{entityLabel}</span>
              <span className="org-col org-col--members">Members</span>
              <span className="org-col org-col--date">Created</span>
              <span className="org-col org-col--actions" />
            </div>

            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="org-row" style={{ opacity: 1 - i * 0.18 }}>
                  <div className="org-col org-col--name">
                    <Sk w={28} h={28} r={6} />
                    <Sk w={160} h={13} r={4} />
                  </div>
                  <div className="org-col org-col--members"><Sk w={40} h={20} r={4} /></div>
                  <div className="org-col org-col--date"><Sk w={80} h={13} r={4} /></div>
                  <div className="org-col org-col--actions" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="org-empty">
                {search
                  ? `No ${isOrgs ? 'organisations' : 'departments'} match "${search}".`
                  : `No ${isOrgs ? 'organisations' : 'departments'} yet. Create one to get started.`}
              </div>
            ) : (
              filtered.map((item, i) => (
                <div
                  key={item.id}
                  className="org-row"
                  style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                >
                  <div className="org-col org-col--name">
                    <span className="org-icon">{isOrgs ? <BuildingIcon /> : <DeptIcon />}</span>
                    <span className="org-name">{item.name}</span>
                  </div>
                  <div className="org-col org-col--members">
                    <span className="org-member-badge">{item.member_count ?? 0}</span>
                  </div>
                  <div className="org-col org-col--date">
                    <span className="org-date">
                      {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="org-col org-col--actions">
                    <button
                      className="org-action-btn org-action-btn--edit"
                      title="Rename"
                      onClick={() => openEdit(item)}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      className="org-action-btn org-action-btn--delete"
                      title="Delete"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modal !== null && (
        <OrgFormModal
          mode={modal === 'create' ? 'create' : 'edit'}
          entityLabel={entityLabel}
          name={formName}
          error={formError}
          onChange={setFormName}
          onClose={() => { setModal(null); setFormError('') }}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <OrgDeleteModal
          target={deleteTarget}
          entityLabel={entityLabel}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  )
}
