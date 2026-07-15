---
"jspsych": minor
"@jspsych/plugin-multiplayer-sync": minor
"@jspsych/adapter-multiplayer-jatos": minor
---

Add real-time multiplayer support via a two-layer API/adapter architecture.

**`jspsych`** — new `MultiplayerAPI` on `jsPsych.pluginAPI`: `connect(adapter)`, `disconnect()`, `push(data)`, `update(data)` (shallow get→merge→push convenience), `get(participantId)`, `getAll()`, `subscribe(callback)` (replays current state on registration), `wait(condition, timeout?)`, `communicate(data, condition, timeout?)`, and `cancelAllSubscriptions()`. Exposes `participantId`. `subscribe()` emits the current snapshot once on registration before forwarding future updates.

**`@jspsych/plugin-multiplayer-sync`** — new plugin implementing a synchronization barrier trial. Optionally pushes participant data and waits until a `wait_for` predicate over the group session is satisfied. Supports `push_data`, `message`, `timeout`, `on_timeout`, and `minimum_wait` parameters. Saves `group`, `wait_time`, and `timed_out` to trial data.

**`@jspsych/adapter-multiplayer-jatos`** — new adapter backed by JATOS group sessions. Implements `MultiplayerAdapter` using `jatos.groupSession` with exponential-backoff retry on optimistic concurrency conflicts.
