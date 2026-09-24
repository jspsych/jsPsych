# jsPsych.multiplayer

The multiplayer module lets participants in the same group share data in real time. Each participant has a *slot* in a shared group session that only they write to, and everyone can read every slot.

Before using any multiplayer method, connect with a backend adapter:

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

## How it works

`connect()` opens a *session*. `jsPsych.multiplayer` forwards every method to the current session, so plugins can call `jsPsych.multiplayer.update()` without keeping track of the session themselves. Anything still in progress when a session closes stays with that session and can't affect a later one.

**Your own writes show up at once.** `push()` and `update()` change your slot locally right away, and the session sends it to the backend in the background. Reads, subscribers, and `wait()` see the change immediately; the promise the write returns resolves when the backend confirms it.

**Only the latest value is sent.** The session sends one write at a time. Writes made while one is being sent are combined and go out together in the next one. Other participants therefore see your latest data, but may never see a value you replaced before it was sent. Use data for *state* ("my current answer is 3"). To send *events* that other participants must each see (chat messages, individual clicks), keep them in a list in your slot, or keep a counter the others can compare against.

A write that doesn't change your data sends nothing and doesn't notify subscribers, so it's safe for a subscriber to write the same value each time it's called. A subscriber that writes *different* data every time it's called never settles: the session stops it with a logged error if it loops without waiting for the network, but it will otherwise keep sending for as long as it's subscribed.

**Data must be plain JSON.** Everything you write is copied as JSON when you write it, which matches what other participants receive over the network. `BigInt` and circular data are rejected at the call that wrote them. `Date` values become strings and `undefined` values are dropped.

**Snapshots are frozen and shared.** `getAll()`, `get()`, subscribers, and `wait()` all receive the same frozen object. Changing it throws a `TypeError`; copy it first if you need a modified version.

**Presence.** The session tracks whether each participant is still there:

Status | Meaning
-------|--------
`connected` | Currently connected.
`away` | Dropped out. Brief drops from network blips look like this.
`left` | Away for longer than the dropout timeout (10 seconds by default). A participant who has left stays `left`, even if they come back; the adapter should give a returning participant a new ID.

While your own connection is down, the session pauses the dropout timers for everyone else, since it can't tell whether they are still there.

---

## Properties

### participantId

```javascript
jsPsych.multiplayer.participantId
```

A string identifying this participant within the group session. `null` before `connect()` resolves and after `disconnect()`. Read-only.

### status

```javascript
jsPsych.multiplayer.status
```

The state of this client's connection: `"connected"`, `"reconnecting"` (the connection dropped and the adapter is trying to restore it), or `"closed"` (the connection is gone for good). `null` when there is no session. Read-only.

### session

```javascript
jsPsych.multiplayer.session
```

The current `MultiplayerSession`, the same object `connect()` returns. `null` before `connect()` resolves and after `disconnect()`. A session has the same methods as `jsPsych.multiplayer` (except `connect()`), plus `participantId` and `status`.

---

## Methods

### connect

```javascript
jsPsych.multiplayer.connect(adapter, options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
adapter | `MultiplayerAdapter` | A backend adapter that handles the network layer.
options | object | *(optional)* The options below.

Option | Type | Description
-------|------|------------
dropoutTimeout | number | How long, in milliseconds, a participant can stay disconnected before they count as having left. Defaults to `10000`. `null` or `Infinity` means never.
onParticipantLeft | function | Called with a participant's ID when they reach the `left` status.
onStatusChange | function | Called with the new status whenever this client's connection status changes.
signal | `AbortSignal` | Aborting it cancels a `connect()` that is still pending.

#### Return value

Returns a `Promise<MultiplayerSession>` that resolves when the connection is open.

#### Description

Opens a session with the adapter and makes it the current session. Must be called (and awaited) before `jsPsych.run()` and before any other multiplayer method; other methods throw or reject until it resolves.

Rejects if a session is already open or connecting; call `disconnect()` first. A session whose connection was lost (status `"closed"`) can be replaced without calling `disconnect()`. If the adapter fails to connect, `connect()` rejects and can be called again.

If the connection attempt is cancelled, by `options.signal` or by `disconnect()`, `connect()` rejects with a `MultiplayerCancelledError` once the adapter has closed anything it opened.

What happens to the experiment when a participant leaves is up to you. `onParticipantLeft` is a good place to end the experiment or show a message; multiplayer plugins handle it within their own trials by passing `participants` to `wait()`.

#### Example

```javascript
async function runExperiment() {
  await jsPsych.multiplayer.connect(new JatosAdapter(), {
    dropoutTimeout: 15000,
    onParticipantLeft: () => {
      jsPsych.abortExperiment("Your partner left the study. Thank you for participating.");
    },
  });
  await jsPsych.run(timeline);
}
```

---

### disconnect

```javascript
jsPsych.multiplayer.disconnect()
```

#### Parameters

None.

#### Return value

Returns a `Promise<void>` that resolves once the adapter has closed the connection.

#### Description

Closes the current session, or cancels a `connect()` that is still pending. Pending `wait()` calls reject with a `MultiplayerCancelledError`, and writes that haven't been confirmed reject.

`participantId` and `session` are `null` as soon as `disconnect()` is called, even if the adapter's own disconnect then fails, so `connect()` can always be called again afterward.

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
data | object | A plain object of JSON values to store as this participant's data.

#### Return value

Returns a `Promise<void>` that resolves when the backend confirms a write that includes this data. Rejects if the write fails, if the data isn't plain JSON, or if there is no open session.

#### Description

Replaces this participant's data in the shared group session. Reads reflect the change immediately.

If the write fails, the data stays in your slot and is sent along with your next write.

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
data | object | A plain object of JSON values to merge into this participant's data.

#### Return value

Returns a `Promise<void>`, like `push()`.

#### Description

Shallow-merges `data` into this participant's data: top-level keys in `data` replace existing ones, and other keys are kept. On the first write after connecting, it merges onto whatever the backend already holds for this participant.

#### Example

```javascript
// Keeps any keys already in this participant's slot (e.g. { score: 1 })
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

The participant's current data (frozen), or `undefined` if they haven't written any.

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

The full group session (frozen): an object keyed by `participantId`, where each value is that participant's data.

#### Example

```javascript
const group = jsPsych.multiplayer.getAll();
const allReady = Object.values(group).every((p) => p.ready === true);
```

---

### presence

```javascript
jsPsych.multiplayer.presence()
```

#### Parameters

None.

#### Return value

An object (frozen) keyed by `participantId`, giving each participant's presence status: `"connected"`, `"away"`, or `"left"`. It includes this participant, whose status follows the connection: `"away"` while reconnecting and `"left"` once closed.

#### Example

```javascript
const partnerStillHere = jsPsych.multiplayer.presence()[partnerId] !== "left";
```

---

### subscribe

```javascript
jsPsych.multiplayer.subscribe(callback, options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
callback | function | Called with `(data, presence)`: the group session and the presence of every participant.
options | object | *(optional)* `{ signal }`: aborting `signal` removes the subscription.

#### Return value

Returns an `Unsubscribe` function. Calling it removes the subscription.

#### Description

Calls `callback` once immediately with the current state, then again after every change: another participant's write, your own write, or a change in presence.

A subscriber that throws is logged and doesn't stop other subscribers. If a subscriber writes data, the other subscribers still see the snapshots in order.

Passing a `signal` is a convenient way to remove everything a trial set up at once: create an `AbortController` when the trial starts and abort it when the trial ends.

#### Example

```javascript
const controller = new AbortController();
jsPsych.multiplayer.subscribe(
  (group, presence) => renderScoreboard(group, presence),
  { signal: controller.signal }
);

// When the trial ends:
controller.abort();
```

---

### wait

```javascript
jsPsych.multiplayer.wait(condition, options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
condition | function | Called with `(data, presence)` after every change. The wait resolves when it returns `true`.
options | object | *(optional)* The options below.

Option | Type | Description
-------|------|------------
timeout | number | Maximum time to wait in milliseconds. `null`, `undefined`, negative, and non-finite values mean no timeout.
participants | string[] | Participants the wait depends on. If one of them leaves before the condition is met, the wait rejects.
signal | `AbortSignal` | Aborting it cancels the wait.

#### Return value

Returns a `Promise<GroupSessionData>` that resolves with the group session at the moment the condition first holds.

#### Description

Checks the condition against the current state first, so it resolves right away if the condition already holds. The promise rejects with:

Error name | When
-----------|-----
`MultiplayerTimeoutError` | `timeout` elapsed first.
`MultiplayerParticipantLeftError` | A participant in `participants` left first. The error's `participantId` says who.
`MultiplayerCancelledError` | The wait was cancelled: by `signal`, `cancelAllSubscriptions()`, `disconnect()`, or the experiment finishing or being aborted.
`MultiplayerConnectionClosedError` | This client's connection was lost for good.

It also rejects with the thrown error if `condition` throws. All of these error classes are exported from `jspsych`; check `error.name` rather than `instanceof`, which fails when two copies of jsPsych are loaded.

#### Example

```javascript
// Wait for the partner's answer, but stop if they leave
try {
  const group = await jsPsych.multiplayer.wait(
    (g) => g[partnerId]?.answer !== undefined,
    { participants: [partnerId], timeout: 60000 }
  );
} catch (error) {
  if (error.name === "MultiplayerParticipantLeftError") {
    // End the trial and record that the partner left
  }
}
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

Removes every subscription on the current session and rejects its pending `wait()` calls with a `MultiplayerCancelledError`. The connection stays open. Mirrors `cancelAllKeyboardResponses()`.

jsPsych calls this automatically when the timeline finishes (before `on_finish`, so `on_finish` can still write final data) and when `abortExperiment()` is called, so you only need to call it yourself to stop listening partway through an experiment.

#### Example

```javascript
jsPsych.multiplayer.cancelAllSubscriptions();
```
