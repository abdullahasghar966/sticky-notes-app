import Masonry from 'react-masonry-css'
import NoteCard from './NoteCard'

// Spec breakpoints: 4 cols default · 3 @1100 · 2 @700 · 1 @500.
const BREAKPOINTS = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
}

// ──────────────────────────────────────────────────────────────
// NoteBoard — react-masonry-css grid. Cards own their entrance /
// hover / exit animations. We deliberately do NOT use Framer's
// layout projection (layout / LayoutGroup) here: masonry physically
// moves card nodes between column <div>s on every add/delete, and
// projection holds stale parent refs across those moves, which
// desyncs the DOM and crashes React's reconciler (removeChild).
// ──────────────────────────────────────────────────────────────
export default function NoteBoard({ notes, onEdit, onDelete }) {
  return (
    <Masonry
      breakpointCols={BREAKPOINTS}
      className="masonry-grid"
      columnClassName="masonry-grid__column"
    >
      {notes.map((note, i) => (
        <NoteCard
          key={note.id}
          note={note}
          index={i}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Masonry>
  )
}
