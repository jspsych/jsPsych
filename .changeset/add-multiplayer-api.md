---
"jspsych": minor
---

Add real-time multiplayer support via a two-layer API/adapter architecture.

**`jspsych`** — new top-level `jsPsych.multiplayer` module exposing a shared group session in which each participant writes their own slot and everyone can read every slot:

- Sessions: `connect(adapter, options)` opens a `MultiplayerSession` (cancellable with an `AbortSignal`), and `jsPsych.multiplayer` forwards every method to the current session. `disconnect()` closes it, or cancels a pending connect once the adapter has cleaned up.
- Writing: `push(data)` replaces this participant's data and `update(data)` shallow-merges into it. Reads reflect a write at once; the session sends one write at a time to the backend and combines writes made in the meantime. Data must be plain JSON.
- Reading: `getAll()`, `get(participantId)`, `subscribe(callback)`, and `wait(condition, { timeout, signal, participants })` share one frozen snapshot per change.
- Presence: `presence()` reports each participant as `connected`, `away`, or `left` (after a configurable `dropoutTimeout`). `wait()` rejects with `MultiplayerParticipantLeftError` when a participant it depends on leaves, and `onParticipantLeft` / `onStatusChange` callbacks report dropouts and connection changes.
- Lifecycle: `status`, `participantId`, `cancelAllSubscriptions()`; jsPsych cancels subscriptions when the timeline ends (before `on_finish`) or is aborted.

Backend adapters (e.g. JATOS, Firebase) and multiplayer plugins are distributed as separate packages in the [jspsych-multiplayer](https://github.com/jspsych/jspsych-multiplayer) ecosystem repository; this change adds only the core API and the `MultiplayerAdapter` / `MultiplayerConnection` interfaces they implement.
