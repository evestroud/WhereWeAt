# WhereWeAt — Frontend

## Stack
- Vite + TypeScript
- React with built-in hooks — no external state management library
- React Router
- Tailwind CSS
- `@vis.gl/react-google-maps` for map rendering

## Conventions
- Functional components and hooks throughout.
- Import WebSocket message types from `shared` — do not redefine
  locally. Changes to message shapes go in `shared` first.
- Display label and per-device ID are persisted via cookie, not localStorage.
- A user must have completed `set_label` before location sharing or viewing
  is available — gate these flows accordingly.
- Geolocation interruptions (backgrounded tab, permission revoked) are normal
  states to handle gracefully, not edge cases.

## Out of scope for MVP
- Map marker clustering — group sizes don't require it.