import { useState } from 'react'
import './NoteForm.css'

export default function NoteForm({ note, onCancel, onSave }) {
  const isEditing = Boolean(note?.id)
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError("Title can't be empty")
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({ id: note?.id, title: title.trim(), content })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the note')
      setSaving(false)
    }
  }

  return (
    <div className="form-overlay" role="dialog" aria-modal="true" onClick={onCancel}>
      <form className="form-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <span className="form-eyebrow">{isEditing ? 'Editing note' : 'New note'}</span>
        <label className="form-label" htmlFor="note-title">
          Title
        </label>
        <input
          id="note-title"
          className="form-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give it a title…"
          maxLength={200}
          autoFocus
        />

        <label className="form-label" htmlFor="note-content">
          Content
        </label>
        <textarea
          id="note-content"
          className="form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write it down…"
          rows={8}
          maxLength={10000}
        />

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-pin" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Pin note'}
          </button>
        </div>
      </form>
    </div>
  )
}
