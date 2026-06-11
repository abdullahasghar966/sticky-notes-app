# Margin (sticky notes app)

**An editorial sticky-notes app — capture thoughts by hand or by voice, kept entirely on your device.**

Margin is a calm, paper-inspired space for loose thoughts. Jot notes by typing or speaking, arrange them on a responsive masonry wall, and trust that everything persists in your browser — no account, no backend, no API keys.

> **Live demo:** you can check this out on live vercel app https://stickynotesapp-two.vercel.app/

<p>
  <img alt="React 18" src="https://img.shields.io/badge/React-18-1c1b18?style=flat-square" />
  <img alt="Vite 6" src="https://img.shields.io/badge/Vite-6-1c1b18?style=flat-square" />
  <img alt="Tailwind CSS v4" src="https://img.shields.io/badge/Tailwind-v4-1c1b18?style=flat-square" />
  <img alt="Framer Motion 11" src="https://img.shields.io/badge/Framer%20Motion-11-1c1b18?style=flat-square" />
</p>

<!-- Add a screenshot: save one to docs/board.png and uncomment ↓
![Margin board](docs/board.png)
-->

---

## ✨ Features

- **Notes, fully managed** — create, edit, and delete in a focused modal editor (auto-resizing textarea, character count, live color preview).
- **Voice-to-text** — dictate with the Web Speech API; interim words stream in live, the final transcript is appended to your note.
- **Local persistence** — everything is saved to `localStorage` under the key `sticky-notes-app` and survives refresh/close. Reads are defensive against corrupted JSON and locked-down/private browsing.
- **Responsive masonry grid** — 4 / 3 / 2 / 1 columns across breakpoints, with smooth Framer Motion reflow on add/delete.
- **Motion, end to end** — staggered + scroll-triggered card entrances, a spring-scaled modal with backdrop blur, an animated note count, and bottom-right toasts.
- **Undo deletes** — a 3-second toast restores the note to its exact position.
- **Six soft "paper" tones** — sage · blush · sky · butter · lilac · stone (no neon sticky-yellow).
- **Keyboard friendly** — `N` to start a new note, `Esc` to close, `Ctrl`/`⌘` + `Enter` to save.
- **A playful 3D mascot** — on wide screens, a character hinges out from behind the column edge, waves hi, and folds back, alternating left ↔ right.
- **Accessible** — honors `prefers-reduced-motion`, keyboard-operable cards and controls, graceful degradation when voice isn't supported.

---

## 🧱 Tech stack

| Concern | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Animation | Framer Motion 11 |
| Layout | react-masonry-css |
| Speech | Web Speech API (built-in) |
| Storage | localStorage (built-in) |
| IDs | uuid v4 |

No backend and **no API keys** required.

---

## 🚀 Getting started

**Prerequisites:** Node.js 18+ and npm.

```bash
# clone
git clone https://github.com/abdullahasghar966/sticky-notes-app.git
cd sticky-notes-app

# install
npm install

# run the dev server (http://localhost:5173)
npm run dev

# production build + local preview
npm run build
npm run preview
```

| Script | Does |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |

---

## 🗂️ Project structure

```
src/
├── components/
│   ├── Header.jsx        # masthead + animated note count + "New note"
│   ├── NoteBoard.jsx     # LayoutGroup + masonry grid
│   ├── NoteCard.jsx      # 3-layer motion card (reflow / entrance / hover+exit)
│   ├── NoteEditor.jsx    # modal: textarea, char count, color picker, voice
│   ├── DeleteButton.jsx  # hover-revealed, two-tap confirm
│   ├── VoiceButton.jsx   # mic with idle/listening/processing/error states
│   ├── EmptyState.jsx    # editorial empty illustration + CTA
│   ├── Toast.jsx         # bottom-right stack with Undo + progress bar
│   ├── Mascot.jsx        # 3D waving side mascot (+ drop-in image slot)
│   └── icons.jsx         # inline stroke-SVG icon set (no icon library)
├── hooks/
│   ├── useLocalStorage.js # generic, error-safe persisted state
│   ├── useNotes.js        # note CRUD on top of localStorage
│   └── useVoiceInput.js   # Web Speech API abstraction
├── utils/
│   ├── storage.js         # defensive localStorage read/write helpers
│   └── noteColors.js      # the six paper tones + assignment
├── App.jsx                # root: editor state, toasts, shortcuts, layout
└── main.jsx
```

---

## 🔍 How it works

### Persistence (three defensive layers)
1. **`utils/storage.js`** wraps every access in `try/catch`; corrupt JSON resets the key, writes never throw, and a write-probe detects private/locked-down mode.
2. **`hooks/useLocalStorage.js`** is a generic `useState`-like hook that persists on change and reports whether storage is available.
3. **`hooks/useNotes.js`** does the CRUD (`addNote`, `updateNote`, `deleteNote`, `restoreNote`) under the key `sticky-notes-app`.

**Note shape:** `{ id, content, color, createdAt, updatedAt }`.

### Voice-to-text — browser support
Uses `window.SpeechRecognition || window.webkitSpeechRecognition`. Requires a **secure context** (HTTPS or `localhost`) and microphone permission.

| Browser | Support |
|---|---|
| Chrome (desktop/Android) | ✅ (webkit prefix) |
| Edge | ✅ |
| Safari (macOS/iOS) | ✅ (webkit prefix) |
| Firefox | ❌ — button is hidden with a tooltip |

> On a deployed Vercel site the mic works because Vercel serves HTTPS. It will **not** work over plain `http://` (only `localhost` is exempt).

### Animation strategy
Each `NoteCard` is three nested motion layers, one concern each — outer `layout` for masonry reflow, middle `whileInView` for staggered/scroll-triggered entrance, inner for hover lift and a self-controlled exit. (Self-exit is deliberate: react-masonry-css distributes children into per-column wrappers, so a top-level `AnimatePresence` can't observe per-card removal.)

---

## 👋 The mascot

The built-in side mascot is **original artwork** drawn as an animated SVG. It only appears where there's genuinely empty space (viewport ≥ 1700px), uses `pointer-events: none`, and is disabled under reduced-motion.

**Want a different character?** Drop a transparent PNG/WebP into `public/` and point the slot at it in `src/components/Mascot.jsx`:

```js
const MASCOT_SRC = '/your-character.png'
```

It will ride the exact same 3D emerge-and-wave motion. Use only assets you have the rights to.

---

## 🎨 Design system — "Parchment"

A light, editorial theme. Tokens live in `src/index.css` via Tailwind v4 `@theme`.

| Role | Token | Value |
|---|---|---|
| Background | `--color-bg` | `#f1ede4` (warm paper) |
| Surface | `--color-surface` | `#fbf8f1` |
| Hairline | `--color-edge` | `#ddd5c5` |
| Ink (text) | `--color-ink` | `#1c1b18` |
| Muted | `--color-muted` | `#6b6862` |
| Accent | `--color-accent` | `#b5452f` (burnt clay) |

**Type:** Clash Display (display) · DM Sans (body) · JetBrains Mono (labels & counts).

---

<sub>Built with React, Vite, Tailwind CSS v4, and Framer Motion.</sub>
