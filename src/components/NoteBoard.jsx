import Masonry from 'react-masonry-css'
import { LayoutGroup } from 'framer-motion'
import NoteCard from './NoteCard'

// Spec breakpoints: 4 cols default · 3 @1100 · 2 @700 · 1 @500.
const BREAKPOINTS = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
}

// ──────────────────────────────────────────────────────────────
// NoteBoard — react-masonry-css grid wrapped in a LayoutGroup so
// Framer layout animations reflow cards smoothly *across* columns
// (masonry re-distributes items on every add/delete).
// ──────────────────────────────────────────────────────────────
export default function NoteBoard({ notes, onEdit, onDelete }) {
  return (
    <LayoutGroup>
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
    </LayoutGroup>
  )
}
