# WhereWeAt — Backend

## Stack
- Node.js, custom WebSocket server
- No database, no BaaS — all state is in-memory, nothing persists past
  process restart by design
- Message types imported from `shared` — source of truth for the
  WS protocol

## Instance lifecycle
- Instances are created via HTTP POST `/create`, decoupled from the WS
  protocol entirely
- Active instances are tracked in a `Record<string, Instance>` map with a
  `lastUsed` timestamp
- A periodic sweep reaps instances where BOTH conditions are true: no active
  connections AND `lastUsed` timestamp has expired. An idle-but-connected
  instance is never reaped.
- Unbounded map growth via `/create` spam is a known non-goal for MVP —
  note this in a code comment rather than solving it

## Connection model
- Each client has a stable device ID (client-generated UUID, stored in a
  cookie) distinct from server-assigned connection identity
- Two independent liveness signals: WebSocket-level ping/pong, and
  application-level location update freshness
- Two explicit timers per connected client: `staleAfter` (fade the dot in
  clients) and `removeAfter` (purge from server state). Both reset on
  reconnect when device ID matches.

## Message flow
- `set_label` is a required step after joining and before a client may share
  location or see others' locations. Server enforces this ordering.
- Label uniqueness is enforced per instance. A reconnecting client may
  reclaim its own stale label via device ID match.
- Label selection is a separate `set_label` message, not bundled into
  connection establishment.

## Conventions
- Keep connection-state logic and message-handling logic separable — message
  handlers should be testable without standing up real sockets.
- Any message shape change goes in `shared` first.