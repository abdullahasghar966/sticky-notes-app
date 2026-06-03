import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNotes } from './hooks/useNotes'
import { nextColor } from './utils/noteColors'
import Header from './components/Header'
import NoteBoard from './components/NoteBoard'
import EmptyState from './components/EmptyState'
import NoteEditor from './components/NoteEditor'
import ToastStack from './components/Toast'
import Mascot from './components/Mascot'

const VOICE_LANG =
  typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US'

export default function App() {
  const { notes, count, addNote, updateNote, deleteNote, restoreNote, storageAvailable } =
    useNotes()

  // editor: null | { mode: 'create' | 'edit', note?, color }
  const [editor, setEditor] = useState(null)
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  const pushToast = useCallback((toast) => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, duration: 3000, ...toast }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const openCreate = useCallback(() => {
    setEditor({ mode: 'create', color: nextColor(notes.length) })
  }, [notes.length])

  const openEdit = useCallback((note) => {
    setEditor({ mode: 'edit', note })
  }, [])

  const closeEditor = useCallback(() => setEditor(null), [])

  const handleSave = useCallback(
    ({ content, color }) => {
      if (editor?.mode === 'edit') {
        updateNote(editor.note.id, { content, color })
        pushToast({ type: 'success', message: 'Note updated' })
      } else {
        addNote({ content, color })
        pushToast({ type: 'success', message: 'Note saved' })
      }
      setEditor(null)
    },
    [editor, addNote, updateNote, pushToast],
  )

  // Called by NoteCard *after* its exit animation finishes.
  const handleDelete = useCallback(
    (note) => {
      const { note: removed, index } = deleteNote(note.id)
      if (!removed) return
      pushToast({
        type: 'delete',
        message: 'Note deleted',
        duration: 3000,
        action: {
          label: 'Undo',
          onClick: () => {
            restoreNote(removed, index)
            pushToast({ type: 'success', message: 'Note restored' })
          },
        },
      })
    },
    [deleteNote, restoreNote, pushToast],
  )

  // Global shortcut: press "N" to start a new note (when not typing / modal closed).
  useEffect(() => {
    const onKey = (e) => {
      if (editor) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      const typing =
        t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if (typing) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        openCreate()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editor, openCreate])

  return (
    <div className="relative min-h-dvh">
      <div className="grain" />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[340px]"
        style={{
          background:
            'radial-gradient(58% 100% at 50% 0%, rgba(181,69,47,0.06), transparent 72%)',
        }}
        aria-hidden="true"
      />

      <Mascot side="left" />
      <Mascot side="right" />

      {!storageAvailable && (
        <div className="relative z-20 border-b border-danger/25 bg-danger/10 px-5 py-2 text-center font-mono text-[11px] uppercase tracking-wide text-danger/90">
          Private browsing — notes won&apos;t be saved
        </div>
      )}

      <main className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-28 pt-8 sm:px-8 sm:pt-12">
        <Header count={count} onNew={openCreate} />

        <section className="mt-10">
          {count === 0 ? (
            <EmptyState onNew={openCreate} />
          ) : (
            <NoteBoard notes={notes} onEdit={openEdit} onDelete={handleDelete} />
          )}
        </section>

        <footer className="mt-20 border-t border-edge pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          Stored locally · {count} {count === 1 ? 'note' : 'notes'} · Built with React + Framer Motion
        </footer>
      </main>

      <AnimatePresence>
        {editor && (
          <NoteEditor
            key="editor"
            editor={editor}
            lang={VOICE_LANG}
            onSave={handleSave}
            onClose={closeEditor}
          />
        )}
      </AnimatePresence>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
