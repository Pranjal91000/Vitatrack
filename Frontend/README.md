# VitaTrack frontend

React 18 + Vite + Tailwind + TanStack Query + Zustand, installable PWA.

```bash
npm install
npm run dev      # http://localhost:5173, /api proxied to http://localhost:5177
npm run build    # type-check + production build into dist/
npm run lint
```

## Structure
- `src/features/*` — screens by area: `today`, `workout` (live logger, routines, history, exercises), `nutrition`, `body`, `progress`, `settings`, `auth`.
- `src/store/activeWorkoutStore.ts` — the in-progress workout, persisted to localStorage until it is saved.
- `src/hooks/*` — API queries and mutations.
- `src/components/ui` — buttons, bottom sheets (vaul), form fields; `src/components/layout` — app shell, headers.
- Weights are stored in kg; `src/lib/format.ts` converts for display when the user picks lb.
