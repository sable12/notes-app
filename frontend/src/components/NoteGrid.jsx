import NoteCard from './NoteCard.jsx'
import './NoteGrid.css'

export default function NoteGrid({ notes, onEdit, onDelete, onAddNew, isFiltered }) {
  if (notes.length === 0 && isFiltered) {
    return (
      <div className="empty-state">
        <p>No notes match that search.</p>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <p>The board is empty. Pin your first note.</p>
        <button className="btn-pin" onClick={onAddNew}>
          + New note
        </button>
      </div>
    )
  }

  return (
    <div className="note-grid">
      {notes.map((note, i) => (
        <NoteCard
          key={note.id}
          note={note}
          tilt={tiltFor(note.id ?? i)}
          onEdit={() => onEdit(note)}
          onDelete={() => onDelete(note.id)}
        />
      ))}
    </div>
  )
}

// Deterministic small rotation per card so the board doesn't feel like a grid,
// but reloading the same note doesn't jitter around.
function tiltFor(seed) {
  const n = Number(seed) || 0
  const options = [-2.2, -1.1, 0, 1.3, 2.4, -1.6]
  return options[n % options.length]
}
