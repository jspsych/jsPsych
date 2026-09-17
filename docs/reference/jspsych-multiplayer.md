# jsPsych.multiplayer

The multiplayer module exposes a real-time group session API for synchronizing participants. All methods are accessible through `jsPsych.multiplayer` after calling `connect()` with a backend adapter.

Before using any multiplayer method, connect an adapter:

```javascript
const jsPsych = initJsPsych({ ... });

async function runExperiment() {
  await jsPsych.multiplayer.connect(new JatosAdapter());
  await jsPsych.run(timeline);
}

runExperiment();
```

Wrapping the calls in an `async` function lets this work in a regular `<script>` tag. Top-level `await` is only allowed in `<script type="module">`.

See [Multiplayer Adapter Development](../developers/adapter-development.md) for how to implement or choose an adapter.

---

## Properties

### participantId

```javascript
jsPsych.multiplayer.participantId
```

A string identifying this participant within the current group session. Read from the adapter once `connect()` resolves; `null` before that and after `disconnect()`. Read-only.

---

## Methods

### connect

```javascript
jsPsych.multiplayer.connect(adapter)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
adapter | `MultiplayerAdapter` | A backend adapter instance that handles the network layer.

#### Return value

Returns a `Promise<void>` that resolves when the channel is open and `participantId` has been set.

#### Description

Registers a backend adapter and opens the communication channel. Must be called (and awaited) before `jsPsych.run()` and before any other multiplayer method.

Throws if `connect()` has already been called without a subsequent `disconnect()`. Other multiplayer methods throw until the returned promise resolves. If the adapter's `connect()` rejects (e.g., network error), the API rolls back to its initial state so the call can be retried. If `disconnect()` is called while `connect()` is still pending, the adapter is disconnected as soon as it finishes connecting and `connect()` rejects.

#### Example

```javascript
const jsPsych = initJsPsych();

async function runExperiment() {
  await jsPsych.multiplayer.connect(new JatosAdapter());
  await jsPsych.run(timeline);
}

runExperiment();
```

---

### disconnect

```javascript
jsPsych.multiplayer.disconnect()
```

#### Parameters

None.

#### Return value

Returns a `Promise<void>`.

#### Description

Cancels all active subscriptions (rejecting any pending `wait()` calls) and closes the communication channel. The API is detached from the adapter before the adapter's `disconnect()` runs, so even if that call rejects, `participantId` is `null` afterward, all multiplayer methods throw, and `connect()` can be called again.

#### Example

```javascript
await jsPsych.multiplayer.disconnect();
```

---

### push

```javascript
jsPsych.multiplayer.push(data)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
data | object | Key-value pairs to write into this participant's slot in the shared group session.

#### Return value

Returns a `Promise<void>` that resolves when the write is confirmed by the backend. Rejects if `connect()` has not finished.

#### Description

Writes `data` into this participant's namespace in the shared group session. Other participants see the update immediately through their subscriptions and `wait()` callbacks. Each call to `push()` replaces the participant's entire data object (not a merge).

#### Example

```javascript
await jsPsych.multiplayer.push({ answer: 2, rt: 542 });
```

---

### update

```javascript
jsPsych.multiplayer.update(data)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
data | object | Key-value pairs to shallow-merge into this participant's slot in the shared group session.

#### Return value

Returns a `Promise<void>` that resolves when the write is confirmed by the backend. Rejects if `connect()` has not finished.

#### Description

Convenience wrapper around a get→merge→push sequence: shallow-merges `data` on top of this participant's current slot and pushes the result. Unlike `push()`, existing keys in the slot that aren't present in `data` are preserved.

The merge starts from this participant's last successful `push()` or `update()`, or from the slot's current contents before the first write, so it doesn't depend on how quickly the backend echoes writes back. `update()` calls run one at a time in the order they were made, so you don't need to await one before starting the next. A direct `push()` made while updates are still queued is not part of that ordering.

#### Example

```javascript
// Preserves any keys already in this participant's slot (e.g. { score: 1 })
await jsPsych.multiplayer.update({ round: 2 });
```

---

### get

```javascript
jsPsych.multiplayer.get(participantId)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
participantId | string | The participant whose data to retrieve.

#### Return value

Returns a copy of the participant's current data object, or `undefined` if they have not pushed yet.

#### Description

Reads a single participant's current data from the local snapshot of the group session.

#### Example

```javascript
const hostData = jsPsych.multiplayer.get(hostId);
if (hostData?.phase === "question") { /* ... */ }
```

---

### getAll

```javascript
jsPsych.multiplayer.getAll()
```

#### Parameters

None.

#### Return value

Returns a `GroupSessionData` object — a record keyed by `participantId`, where each value is that participant's most recently pushed data object.

#### Description

Returns the full current group session snapshot. This is a synchronous read of the local cache maintained by the adapter. The returned object is a copy, so changing it doesn't affect the session or later reads.

#### Example

```javascript
const group = jsPsych.multiplayer.getAll();
const allReady = Object.values(group).every((p) => p.ready === true);
```

---

### subscribe

```javascript
jsPsych.multiplayer.subscribe(callback)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
callback | function | Called with the full group session snapshot (`GroupSessionData`) on every update, and once immediately on registration with the current state.

#### Return value

Returns an `Unsubscribe` function. Calling it removes the subscription.

#### Description

Registers a callback that fires whenever the group session changes. The callback is also called once synchronously on registration with the current snapshot — this ensures the subscriber always sees the present state regardless of join order.

Each call receives its own copy of the snapshot, so a callback can modify or keep its argument without affecting the session or other subscribers.

Subscriptions are tracked internally and are all cancelled automatically by `cancelAllSubscriptions()` and `disconnect()`. If the adapter throws while reading the current snapshot, `subscribe()` throws and nothing stays registered.

#### Example

```javascript
const stop = jsPsych.multiplayer.subscribe((group) => {
  renderScoreboard(group);
});

// Later, to stop receiving updates:
stop();
```

---

### wait

```javascript
jsPsych.multiplayer.wait(condition, timeout)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
condition | function | Predicate evaluated with the group session snapshot (`GroupSessionData`). The promise resolves when this returns `true`.
timeout | number | *(optional)* Maximum time to wait in milliseconds. The promise rejects if the condition is not met within this window. `null`, `undefined`, negative, and non-finite values mean no timeout.

#### Return value

Returns a `Promise<GroupSessionData>` that resolves with a copy of the snapshot at the moment the condition first becomes true. Later updates don't change it. Rejects if `connect()` has not finished.

#### Description

Waits until `condition(groupSession)` returns `true`, then resolves with the snapshot. Checks the current session state immediately (fast-path) — resolves right away if the condition is already met. Implemented on top of `subscribe()`; does not poll.

The promise rejects with a `MultiplayerTimeoutError` (exported from the `jspsych` package) if `timeout` is specified and elapses before the condition is met. It also rejects if `condition` itself throws — a throwing predicate is treated as a programming error, not a timeout. If the wait is cancelled first, by `cancelAllSubscriptions()`, `disconnect()`, or the experiment finishing or being aborted, it rejects with a `MultiplayerCancelledError`. To tell these cases apart, check `error.name` for `"MultiplayerTimeoutError"` or `"MultiplayerCancelledError"`.

#### Example

```javascript
// Wait until all 4 players have submitted an answer
const group = await jsPsych.multiplayer.wait(
  (g) => Object.values(g).filter((p) => p.answer !== undefined).length >= 4
);
```

---

### cancelAllSubscriptions

```javascript
jsPsych.multiplayer.cancelAllSubscriptions()
```

#### Parameters

None.

#### Return value

Returns nothing.

#### Description

Cancels all currently active subscriptions created by `subscribe()` and rejects any pending `wait()` calls with a `MultiplayerCancelledError`. Mirrors `cancelAllKeyboardResponses()`. jsPsych calls this automatically after `on_finish` when the experiment ends and when `abortExperiment()` is called, and `disconnect()` calls it too, so you only need to call it yourself to stop listening partway through an experiment.

#### Example

```javascript
jsPsych.multiplayer.cancelAllSubscriptions();
```
