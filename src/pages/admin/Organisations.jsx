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
import '../css/admin/Organisations.css'

function BuildingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
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

  useEffect(() => {
    if (user && !user.is_staff) navigate('/admin/dashboard', { replace: true })
  }, [user, navigate])

  const [orgs, setOrgs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formName, setFormName]   = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    getOrganisations().then(r => setOrgs(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? orgs.filter(o => o.name.toLowerCase().includes(q)) : orgs
  }, [orgs, search])

  const totalMembers = useMemo(() => orgs.reduce((s, o) => s + (o.member_count ?? 0), 0), [orgs])

  const openCreate = () => { setFormName(''); setFormError(''); setModal('create') }
  const openEdit   = item => { setFormName(item.name); setFormError(''); setModal(item) }

  const handleSave = async () => {
    if (!formName.trim()) { setFormError('Name is required.'); return }
    setSaving(true)
    setFormError('')
    try {
      if (modal === 'create') {
        const { data } = await createOrganisation({ name: formName.trim() })
        setOrgs(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      } else {
        const { data } = await updateOrganisation(modal.id, { name: formName.trim() })
        setOrgs(prev => prev.map(o => o.id === modal.id ? data : o))
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
      await deleteOrganisation(deleteTarget.id)
      setOrgs(prev => prev.filter(o => o.id !== deleteTarget.id))
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
            <h1 className="org-page-title">Organisations</h1>
            <span className="org-count-badge">{orgs.length}</span>
          </div>
          <div className="org-header-right">
            <div className="org-search-wrap">
              <svg className="org-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="org-search-input"
                placeholder="Search organisations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={openCreate}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Organisation
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="org-stats">
          <div className="org-stat-card">
            <span className="org-stat-value">{loading ? '—' : orgs.length}</span>
            <span className="org-stat-label">Total Organisations</span>
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
              <span className="org-col org-col--name">Organisation</span>
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
                  ? `No organisations match "${search}".`
                  : 'No organisations yet. Create one to get started.'}
              </div>
            ) : (
              filtered.map((item, i) => (
                <div
                  key={item.id}
                  className="org-row"
                  style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                >
                  <div className="org-col org-col--name">
                    <span className="org-icon"><BuildingIcon /></span>
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
          entityLabel="Organisation"
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
          entityLabel="Organisation"
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  )
}
