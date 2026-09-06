import { useEffect, useMemo, useState } from 'react'
import { notesApi } from './api'
import NoteGrid from './components/NoteGrid.jsx'
import NoteForm from './components/NoteForm.jsx'
import './App.css'

export default function App() {
  const [notes, setNotes] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [errorMessage, setErrorMessage] = useState('')
  const [editingNote, setEditingNote] = useState(null) // null = closed, {} = new, {...} = editing
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    setStatus('loading')
    try {
      const data = await notesApi.list()
      setNotes(data)
      setStatus('ready')
    } catch (err) {
      setErrorMessage(describeError(err))
      setStatus('error')
    }
  }

  async function handleSave(payload) {
    if (payload.id) {
      const updated = await notesApi.update(payload.id, payload)
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    } else {
      const created = await notesApi.create(payload)
      setNotes((prev) => [created, ...prev])
    }
    setEditingNote(null)
  }

  async function handleDelete(id) {
    const previous = notes
    setNotes((prev) => prev.filter((n) => n.id !== id))
    try {
      await notesApi.remove(id)
    } catch (err) {
      setNotes(previous)
      setErrorMessage(describeError(err))
    }
  }

  const visibleNotes = useMemo(() => {
    if (!query.trim()) return notes
    const q = query.trim().toLowerCase()
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
    )
  }, [notes, query])

  return (
    <div className="board">
      <header className="board-header">
        <div className="board-title">
          <span className="board-eyebrow">// notesdb</span>
          <h1>Pinboard</h1>
        </div>
        <div className="board-controls">
          <input
            className="search-input"
            type="search"
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search notes"
          />
          <button className="btn-pin" onClick={() => setEditingNote({})}>
            + New note
          </button>
        </div>
      </header>

      <div className="board-meta">
        {status === 'ready' && (
          <span>
            {visibleNotes.length} of {notes.length} note{notes.length === 1 ? '' : 's'} pinned
          </span>
        )}
      </div>

      {status === 'loading' && <p className="board-status">Fetching your notes…</p>}

      {status === 'error' && (
        <div className="board-status board-status-error">
          <p>Couldn't reach the notes API.</p>
          <p className="mono-detail">{errorMessage}</p>
          <button className="btn-pin" onClick={loadNotes}>
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && (
        <NoteGrid
          notes={visibleNotes}
          onEdit={(note) => setEditingNote(note)}
          onDelete={handleDelete}
          onAddNew={() => setEditingNote({})}
          isFiltered={notes.length > 0 && visibleNotes.length === 0}
        />
      )}

      {editingNote !== null && (
        <NoteForm
          note={editingNote}
          onCancel={() => setEditingNote(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function describeError(err) {
  if (err.response?.data?.message) return err.response.data.message
  if (err.message) return err.message
  return 'Unknown error'
}
