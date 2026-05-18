import { useState } from 'react'
import { updateClass, deleteClass } from '../../../api/classes'

export function useClassEdit(id, cls, setCls) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm,      setEditForm]      = useState({})
  const [editErrors,    setEditErrors]    = useState({})
  const [editSaving,    setEditSaving]    = useState(false)
  const [deleteTarget,  setDeleteTarget]  = useState(null)

  function openEdit() {
    setEditForm({
      name:       cls.name,
      code:       cls.code,
      subject:    cls.subject    ?? '',
      start_date: cls.start_date ?? '',
      end_date:   cls.end_date   ?? '',
      status:     cls.status     ?? 'active',
    })
    setEditErrors({})
    setShowEditModal(true)
  }

  function handleEditChange(field, value) {
    setEditForm(f => ({ ...f, [field]: value }))
    setEditErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  async function handleEditSave() {
    const errs = {}
    if (!editForm.name?.trim())     errs.name       = 'Class name is required.'
    if (!editForm.code?.trim())     errs.code       = 'Class code is required.'
    if (!editForm.subject?.trim())  errs.subject    = 'Subject is required.'
    if (!editForm.start_date)       errs.start_date = 'Start date is required.'
    if (!editForm.end_date)         errs.end_date   = 'End date is required.'
    if (Object.keys(errs).length)  { setEditErrors(errs); return }

    setEditSaving(true)
    setEditErrors({})
    try {
      const { data } = await updateClass(id, editForm)
      setCls(data)
      setShowEditModal(false)
    } catch (err) {
      const d = err?.response?.data
      if (d && typeof d === 'object' && !Array.isArray(d)) {
        setEditErrors(Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
      } else {
        setEditErrors({ non_field_errors: 'Something went wrong. Please try again.' })
      }
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteClass(id)
      window.location.href = '/teacher/classes'
    } catch {}
    setDeleteTarget(null)
  }

  return {
    showEditModal,
    editForm, editErrors, editSaving,
    openEdit, handleEditChange, handleEditSave,
    closeEditModal: () => setShowEditModal(false),
    deleteTarget,
    setDeleteTarget,
    handleDelete,
  }
}
