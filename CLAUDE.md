# WhereWeAt

Privacy-focused, ephemeral real-time location sharing for small friend groups
coordinating meetups.

## Working style

The developer is returning to coding after a break and wants to build this
application by hand, with a thorough understanding of each part before moving
on. Follow these guidelines in all sessions:

- Do not generate large chunks of code unprompted. Wait to be asked.
- When the developer proposes adding something new, ask questions to check
  their understanding and intention before proceeding.
- Flag it when a line of work risks scope-creeping away from the MVP — help
  keep the focus on getting a working product first.
- Prefer explaining and discussing over doing. This is a learning-oriented
  build, not a code-generation task.
- Build naively and incrementally: plain code first, no upfront abstraction,
  error handling, or tests. Add structure only once something concrete
  requires it. A lightweight design discussion up front is fine, but skip
  formal bite-sized implementation plans, dedicated test suites, or
  factored-out modules for routine feature work.
- Keep frontend and backend moving in sync so changes are visible
  end-to-end in the dev server (page updates, console logs), rather than
  building one side ahead of the other.
- The developer codes independently between sessions and won't narrate
  every change — check `git log`/`git status` for commits made since your
  last look before answering questions about current behavior.

## Architecture
- Monorepo, Yarn workspaces (Yarn Berry, `node-modules` linker — NOT PnP)
- `frontend/` — Vite + React + TypeScript client
- `backend/` — custom Node.js WebSocket server (no database, no BaaS)
- `packages/shared/` — (forthcoming) shared TypeScript types for WebSocket
  message schemas, imported by both frontend and backend

## Core product model
- No persistent accounts. No persistent instances. Fully ephemeral — nothing
  survives beyond active WebSocket connections.
- Users join an instance via magic link only — no landing page, no manual
  code entry.
- Splash screen on join shows labels of current sharers (no location data)
  before the new user opts in — enforces reciprocity without dead-ending
  non-sharers.
- A user must complete label selection (`set_label`) before they can share
  their location or see others'.
- Display labels are user-chosen, persisted via browser cookie alongside a
  stable per-device ID used for reconnect handling.
- Label uniqueness is enforced server-side, per instance. A reconnecting
  client (matched by device ID) may reclaim its own stale label.
- Stale dots fade/are removed after a grace period when location updates
  stop arriving (e.g. backgrounded tab). This is expected mobile web
  behavior, not an error condition — there is no true background geolocation
  on web.
- MVP assumes small groups (a handful of friends) — no clustering, no
  pagination needed.

## Shared tooling (root devDependencies)
TypeScript, ESLint, Prettier installed at root and shared across packages.
Root `tsconfig.base.json` holds shared compiler options; each package's
`tsconfig.json` extends it. Root ESLint flat config holds shared rules with
package-level overrides where needed.

## Session conventions for Claude Code
- Work touching the message contract (`packages/shared`) should be done from
  repo root.
- Single-package work should start the session scoped to that package
  directory.
- Package-specific conventions live in nested CLAUDE.md files.

## Explicitly out of scope for MVP
- Client-side encryption
- Any persistence layer beyond in-memory connection state
- Hosting/deployment (deferred until base product works locally)
