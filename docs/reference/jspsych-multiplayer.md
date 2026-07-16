# jsPsych.pluginAPI — Multiplayer

The multiplayer module exposes a real-time group session API for synchronizing participants. All methods are accessible through `jsPsych.pluginAPI` after calling `connect()` with a backend adapter.

Before using any multiplayer method, connect an adapter:

```javascript
const jsPsych = initJsPsych({ ... });
await jsPsych.pluginAPI.connect(new JatosAdapter());
await jsPsych.run(timeline);
```

See [Multiplayer Adapter Development](../developers/adapter-development.md) for how to implement or choose an adapter.

---

## Properties

### participantId

```javascript
jsPsych.pluginAPI.participantId
```

A string identifying this participant within the current group session. Set by `connect()` from the adapter; `null` before `connect()` is called or after `disconnect()`.

---

## Methods

### connect

```javascript
jsPsych.pluginAPI.connect(adapter)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
adapter | `MultiplayerAdapter` | A backend adapter instance that handles the network layer.

#### Return value

Returns a `Promise<void>` that resolves when the channel is open and `participantId` has been set.

#### Description

Registers a backend adapter and opens the communication channel. Must be called (and awaited) before `jsPsych.run()` and before any other multiplayer method.

Throws if `connect()` has already been called without a subsequent `disconnect()`. If the adapter's `connect()` rejects (e.g., network error), the API rolls back to its initial state so the call can be retried.

#### Example

```javascript
const jsPsych = initJsPsych();
await jsPsych.pluginAPI.connect(new JatosAdapter());
await jsPsych.run(timeline);
```

---

### disconnect

```javascript
jsPsych.pluginAPI.disconnect()
```

#### Parameters

None.

#### Return value

Returns a `Promise<void>`.

#### Description

Cancels all active subscriptions and closes the communication channel. After this call, `participantId` is `null` and all multiplayer methods throw until `connect()` is called again.

#### Example

```javascript
await jsPsych.pluginAPI.disconnect();
```

---

### push

```javascript
jsPsych.pluginAPI.push(data)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
data | object | Key-value pairs to write into this participant's slot in the shared group session.

#### Return value

Returns a `Promise<void>` that resolves when the write is confirmed by the backend.

#### Description

Writes `data` into this participant's namespace in the shared group session. Other participants see the update immediately through their subscriptions and `wait()` callbacks. Each call to `push()` replaces the participant's entire data object (not a merge).

#### Example

```javascript
await jsPsych.pluginAPI.push({ answer: 2, rt: 542 });
```

---

### update

```javascript
jsPsych.pluginAPI.update(data)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
data | object | Key-value pairs to shallow-merge into this participant's slot in the shared group session.

#### Return value

Returns a `Promise<void>` that resolves when the write is confirmed by the backend.

#### Description

Convenience wrapper around a get→merge→push sequence: reads this participant's current slot, shallow-merges `data` on top of it, and pushes the result. Unlike `push()`, existing keys in the slot that aren't present in `data` are preserved. Equivalent to `push({ ...get(participantId), ...data })`.

#### Example

```javascript
// Preserves any keys already in this participant's slot (e.g. { score: 1 })
await jsPsych.pluginAPI.update({ round: 2 });
```

---

### get

```javascript
jsPsych.pluginAPI.get(participantId)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
participantId | string | The participant whose data to retrieve.

#### Return value

Returns the participant's current data object, or `undefined` if they have not pushed yet.

#### Description

Reads a single participant's current data from the local snapshot of the group session.

#### Example

```javascript
const hostData = jsPsych.pluginAPI.get(hostId);
if (hostData?.phase === "question") { /* ... */ }
```

---

### getAll

```javascript
jsPsych.pluginAPI.getAll()
```

#### Parameters

None.

#### Return value

Returns a `GroupSessionData` object — a record keyed by `participantId`, where each value is that participant's most recently pushed data object.

#### Description

Returns the full current group session snapshot. This is a synchronous read of the local cache maintained by the adapter.

#### Example

```javascript
const group = jsPsych.pluginAPI.getAll();
const allReady = Object.values(group).every((p) => p.ready === true);
```

---

### subscribe

```javascript
jsPsych.pluginAPI.subscribe(callback)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
callback | function | Called with the full group session snapshot (`GroupSessionData`) on every update, and once immediately on registration with the current state.

#### Return value

Returns an `Unsubscribe` function. Calling it removes the subscription.

#### Description

Registers a callback that fires whenever the group session changes. The callback is also called once synchronously on registration with the current snapshot — this ensures the subscriber always sees the present state regardless of join order.

Subscriptions are tracked internally and are all cancelled automatically by `cancelAllSubscriptions()` and `disconnect()`.

#### Example

```javascript
const stop = jsPsych.pluginAPI.subscribe((group) => {
  renderScoreboard(group);
});

// Later, to stop receiving updates:
stop();
```

---

### wait

```javascript
jsPsych.pluginAPI.wait(condition, timeout)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
condition | function | Predicate evaluated with the group session snapshot (`GroupSessionData`). The promise resolves when this returns `true`.
timeout | number | *(optional)* Maximum time to wait in milliseconds. The promise rejects if the condition is not met within this window.

#### Return value

Returns a `Promise<GroupSessionData>` that resolves with the snapshot at the moment the condition first becomes true.

#### Description

Waits until `condition(groupSession)` returns `true`, then resolves with the snapshot. Checks the current session state immediately (fast-path) — resolves right away if the condition is already met. Implemented on top of `subscribe()`; does not poll.

The promise rejects with a `MultiplayerTimeoutError` (exported from the `jspsych` package) if `timeout` is specified and elapses before the condition is met. It also rejects if `condition` itself throws — a throwing predicate is treated as a programming error, not a timeout. To distinguish the two, check `error.name === "MultiplayerTimeoutError"`.

#### Example

```javascript
// Wait until all 4 players have submitted an answer
const group = await jsPsych.pluginAPI.wait(
  (g) => Object.values(g).filter((p) => p.answer !== undefined).length >= 4
);
```

---

### cancelAllSubscriptions

```javascript
jsPsych.pluginAPI.cancelAllSubscriptions()
```

#### Parameters

None.

#### Return value

Returns nothing.

#### Description

Cancels all currently active subscriptions created by `subscribe()`. Mirrors `cancelAllKeyboardResponses()` — call at experiment end (or in `on_finish`) to prevent ghost listeners. `disconnect()` calls this automatically.

#### Example

```javascript
jsPsych.pluginAPI.cancelAllSubscriptions();
```
