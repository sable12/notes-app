import './NoteCard.css'

export default function NoteCard({ note, tilt, onEdit, onDelete }) {
  return (
    <article className="note-card" style={{ '--tilt': `${tilt}deg` }}>
      <span className="note-pin" aria-hidden="true" />
      <h3 className="note-title">{note.title}</h3>
      <p className="note-content">{note.content || <em>No content yet.</em>}</p>
      <div className="note-footer">
        <time className="note-stamp" dateTime={note.updatedAt}>
          {formatStamp(note.updatedAt)}
        </time>
        <div className="note-actions">
          <button className="note-action" onClick={onEdit} aria-label={`Edit ${note.title}`}>
            Edit
          </button>
          <button
            className="note-action note-action-danger"
            onClick={onDelete}
            aria-label={`Delete ${note.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

function formatStamp(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date
    .toLocaleString(undefined, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    .toUpperCase()
}
