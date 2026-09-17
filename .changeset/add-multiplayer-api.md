---
"jspsych": minor
---

Add real-time multiplayer support via a two-layer API/adapter architecture.

**`jspsych`** — new top-level `jsPsych.multiplayer` module exposing a shared group-session ("whiteboard") API, organized as a small state primitive plus conveniences:

- State primitive: `push(data)`, `getAll()`, and `subscribe(callback)` — `subscribe()` emits the current snapshot once on registration before forwarding future updates.
- Conveniences built on the primitive: `update(data)` (shallow get→merge→push), `get(participantId)` (single-participant read), `wait(condition, timeout?)` (promise that resolves when a predicate over the group session becomes true).
- Lifecycle: `connect(adapter)`, `disconnect()`, `cancelAllSubscriptions()`, and a `participantId` property.

Backend adapters (e.g. JATOS, Firebase) and multiplayer plugins are distributed as separate packages in the [jspsych-multiplayer](https://github.com/jspsych/jspsych-multiplayer) ecosystem repository; this change adds only the core API and the `MultiplayerAdapter` interface they implement.
