---
"jspsych": minor
"@jspsych/plugin-multiplayer-sync": minor
"@jspsych/adapter-multiplayer-jatos": minor
---

Add real-time multiplayer support via a two-layer API/adapter architecture.

**`jspsych`** — new top-level `jsPsych.multiplayer` module exposing a shared group-session ("whiteboard") API, organized as a small state primitive plus conveniences:

- State primitive: `push(data)`, `getAll()`, and `subscribe(callback)` — `subscribe()` emits the current snapshot once on registration before forwarding future updates.
- Conveniences built on the primitive: `update(data)` (shallow get→merge→push), `get(participantId)` (single-participant read), `wait(condition, timeout?)` (promise that resolves when a predicate over the group session becomes true).
- Lifecycle: `connect(adapter)`, `disconnect()`, `cancelAllSubscriptions()`, and a `participantId` property.

**`@jspsych/plugin-multiplayer-sync`** — new plugin implementing a synchronization barrier trial. Optionally pushes participant data and waits until a `wait_for` predicate over the group session is satisfied. Supports `push_data`, `message`, `timeout`, `on_timeout`, and `minimum_wait` parameters. Saves `group`, `wait_time`, and `timed_out` to trial data.

**`@jspsych/adapter-multiplayer-jatos`** — new adapter backed by JATOS group sessions. Implements `MultiplayerAdapter` using `jatos.groupSession` with exponential-backoff retry on optimistic concurrency conflicts.
