# claude.md — Technical Decisions & Architecture

**Margin** — an editorial, light-themed ("Parchment") sticky-notes app.
React 18 + Vite 6 · Tailwind v4 (CSS-first tokens) · Framer Motion 11 ·
react-masonry-css · Web Speech API · localStorage. No backend, **no API keys**.

---

## Component tree & responsibilities

```
App.jsx ........... root: owns editor modal state, toast queue, global "N"
│                   shortcut, storage-unavailable banner, atmosphere layers
├── Header ........ masthead: mono eyebrow, display wordmark, animated note
│                   count (number-flip), primary "New note" action
├── EmptyState .... shown when 0 notes: editorial stacked-cards SVG + CTA
├── NoteBoard ..... <LayoutGroup> + react-masonry-css grid
│   └── NoteCard ... 3-layer motion card (reflow / entrance / hover+exit)
│       └── DeleteButton .. hover-revealed, two-tap confirm, self-reverts
├── NoteEditor .... modal: autoresize textarea, char count, 6-swatch color
│   │               picker (live tint), keyboard shortcuts, backdrop blur
│   └── VoiceButton .. mic w/ idle·listening·processing·error states
├── Toast / ToastStack .. bottom-right stack, progress bar, Undo action
└── icons.jsx ...... inline stroke SVG set (no icon library)

hooks/  useLocalStorage (generic) · useNotes (CRUD) · useVoiceInput (speech)
utils/  storage.js (defensive LS) · noteColors.js (palette + assignment)
```

> Note: `icons.jsx` is an addition to the brief's file list — a shared inline
> SVG set so no icon dependency is pulled in.

---

## Design system & theming ("Parchment")

Tokens live in **`src/index.css`** using Tailwind v4 `@theme`, which emits both
utility classes (`bg-bg`, `text-ink`, `border-edge`, `font-display`…) **and**
real `:root` CSS variables for hand-written rules.

| Role        | Token                | Value     |
|-------------|----------------------|-----------|
| Background  | `--color-bg`         | `#f1ede4` (warm paper) |
| Surface     | `--color-surface`    | `#fbf8f1` |
| Hairline    | `--color-edge`       | `#ddd5c5` |
| Ink (text)  | `--color-ink`        | `#1c1b18` |
| Muted       | `--color-muted`      | `#6b6862` |
| Accent      | `--color-accent`     | `#b5452f` (burnt clay) |
| Danger      | `--color-danger`     | `#c0392b` |

**Note papers** are the source of truth in **`utils/noteColors.js`** (NOT the
`@theme` `--color-note-*` mirror, which is kept only for documentation). Each
tone is `{ bg, edge, glow }`: sage · blush · sky · butter · lilac · stone.

### Re-theming checklist (theme lives in a few satellite spots)
1. `src/index.css` → `@theme` tokens + `::selection` + scrollbar + `.grain` blend
2. `src/utils/noteColors.js` → `NOTE_COLORS` (card papers)
3. `src/App.jsx` → top radial-glow `rgba()`
4. `src/components/EmptyState.jsx` → illustration SVG fills
5. `public/note.svg` → favicon
6. `index.html` → `color-scheme` + `theme-color`

### Typography
- **Display:** Clash Display (Fontshare) → headings/wordmark
- **Body:** DM Sans (Google) — chosen over Inter for more editorial character
- **Mono:** JetBrains Mono (Google) → counts, timestamps, eyebrows
- Loaded via `<link>` + `display=swap` with system fallbacks (FOUT-safe).

---

## localStorage integration pattern

Three layers, each defensive:

1. **`utils/storage.js`** — every access wrapped in `try/catch`.
   `isStorageAvailable()` write-probes (catches private-mode throw);
   `readJSON()` resets the key on corrupt JSON; `writeJSON()` never throws.
2. **`hooks/useLocalStorage.js`** — generic `[value, setValue, { available }]`,
   mirrors `useState`, persists on every change via effect, surfaces
   `available` so the UI can warn in private/locked-down browsers.
3. **`hooks/useNotes.js`** — CRUD on key **`sticky-notes-app`**:
   - `addNote` → newest-first, auto-cycles palette color
   - `updateNote` → patch + bump `updatedAt`
   - `deleteNote` → returns `{ note, index }` so Undo can restore exactly
   - `restoreNote(note, index)` → re-inserts at original position

**Schema:** `{ id (uuid v4), content, color (hex), createdAt, updatedAt }` (ISO).

---

## Voice-to-Text

`hooks/useVoiceInput.js` wraps `window.SpeechRecognition || webkitSpeechRecognition`.

- Config: `continuous=false`, `interimResults=true`, `lang=navigator.language||'en-US'`.
- States: `idle → listening → processing → error`; `interim` transcript exposed
  live (shown muted/italic under the textarea); **final** text pushed via
  `onFinal` → appended to the editor (smart spacing, capped at 1000 chars).
- Errors mapped to human copy: `not-allowed`/`service-not-allowed` →
  "Microphone access denied…"; `no-speech`; `audio-capture`; `network`.
  `aborted` is ignored (it's our own cleanup/stop, not a user error).
- **Unsupported browser** → `VoiceButton` hides the actionable control and shows
  a tooltip: *"Voice not supported in this browser."*

### Browser support (Web Speech API)
| Browser | Support | Notes |
|---|---|---|
| Chrome (desktop/Android) | ✅ | `webkit` prefix |
| Edge | ✅ | |
| Safari (macOS/iOS) | ✅ | `webkit` prefix |
| Firefox | ❌ | button hidden gracefully |

Requires a **secure context** (HTTPS or `localhost`) and microphone permission
(prompted on first use).

---

## Animation strategy (Framer Motion)

**NoteCard = three nested motion layers, one concern each** (the key design call):
- **outer** `layout="position"` → smooth masonry reflow on add/delete
- **middle** `initial` + `whileInView` (`once`, `amount: 0.12`, `delay = min(index,10)·0.04`)
  → scroll-triggered **and** staggered entrance
- **inner** `whileHover` lift + **self-controlled exit** (`scale .85`, `rotate -3`,
  `opacity 0` → `onAnimationComplete` fires `onDelete`)

Splitting layout-driven transforms from animation-driven transforms avoids the
classic `whileInView`-vs-`layout` transform conflict.

**Why cards self-exit instead of `<AnimatePresence>`:** react-masonry-css clones
children into per-column wrappers, so a top-level `AnimatePresence` can't observe
per-card removal. The card animates itself out, then unmounts; remaining cards
reflow via `layout`. A **`<LayoutGroup>`** around `<Masonry>` lets those layout
animations cross column boundaries (masonry re-distributes on every change).

`AnimatePresence` **is** used where it composes cleanly: the editor modal
(backdrop fade + spring-scaled panel via variant propagation), the toast stack,
the delete confirm swap, and the Header number-flip. `prefers-reduced-motion`
is honored via a CSS media query.

---

## Gotchas / non-obvious decisions
- Editor body is tinted with the **selected** note color = live preview.
- `StrictMode` kept; the recognition instance is recreated on mount with a
  guarded `abort()` cleanup, so double-invoke in dev is harmless.
- Char cap 1000; textarea grows via `scrollHeight` measurement.
- **Sandbox-only quirks** (do not affect real browsers): the preview screenshot
  tool times out on this app's tall motion tree; CDP viewport resizes don't fire
  react-masonry-css's recalc; Fontshare (Clash Display) didn't load. Verified via
  computed-style inspection instead — colors confirmed exact.
