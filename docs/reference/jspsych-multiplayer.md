# jsPsych.multiplayer

The multiplayer module lets participants in a group share data while an experiment runs. Each participant has a *slot*: an object that only they write to and that everyone in the group can read. Together, the slots form the group's *shared data*, an object keyed by participant ID (type `GroupSessionData`).

Connect to a backend with an adapter before running the experiment:

```javascript
const jsPsych = initJsPsych();

async function runExperiment() {
  await jsPsych.multiplayer.connect(new JatosAdapter());
  await jsPsych.run(timeline);
}

runExperiment();
```

The `async` function lets this code run in an ordinary `<script>` tag; top-level `await` works only in `<script type="module">`. Adapters for JATOS, Firebase, and local testing are available from the [jspsych-multiplayer](https://github.com/jspsych/jspsych-multiplayer) repository. To write your own, see [Multiplayer Adapter Development](../developers/adapter-development.md).

## How it works

### Sessions

`connect()` opens a *session*: one connection to the backend. `jsPsych.multiplayer` passes every method call to the current session, so plugins can call `jsPsych.multiplayer.update()` without holding a reference to the session. Work still in progress when a session closes stays with that session and cannot affect a later one.

### Writing data

`push()` replaces your slot and `update()` merges into it. Both change your slot immediately, so your own reads, subscribers, and `wait()` calls see the new data at once. The session then sends your slot to the backend, and the promise returned by the write resolves when the backend confirms it.

The session sends one write at a time. Writes made while a send is in progress are combined into the next send. Other participants always end up with your latest data, but they may never see a value that you replaced before it was sent. Store *state* in your slot ("my current answer is 3"). For *events* that every participant must see, such as chat messages or individual clicks, append them to a list in your slot or keep a counter that others can compare against.

A write that leaves your slot unchanged sends nothing and doesn't notify subscribers.

### Data format

Slots must contain plain JSON. Each write is copied as JSON when you make it, which matches what other participants receive over the network:

- `BigInt` values and circular references make the write reject.
- `Date` values become strings.
- Keys whose value is `undefined` are dropped.

All reads return one frozen object that is shared by every reader. Modifying it throws a `TypeError`, so copy it first if you need a changed version.

### Presence

The session tracks whether each participant is still in the group:

Status | Meaning
-------|--------
`connected` | The participant is connected.
`away` | The participant's connection dropped. Brief network interruptions show up this way.
`left` | The participant has been away for longer than the dropout timeout (10 seconds by default). This status is permanent: a participant who has left stays `left` even if they reconnect.

While your own connection is down, the session pauses everyone else's dropout timers, because it can't tell whether they are still there.

---

## Properties

### participantId

```javascript
jsPsych.multiplayer.participantId
```

This participant's ID within the group. `null` until `connect()` resolves and after `disconnect()`. Read-only.

### status

```javascript
jsPsych.multiplayer.status
```

The state of this participant's connection:

- `"connected"`: the connection is open.
- `"reconnecting"`: the connection dropped, and the adapter is trying to restore it.
- `"closed"`: the connection is gone for good.

`null` when there is no session. Read-only.

### session

```javascript
jsPsych.multiplayer.session
```

The current `MultiplayerSession`, which is the object `connect()` returns. `null` until `connect()` resolves and after `disconnect()`. A session has `participantId` and `status` properties and every method listed below except `connect()`.

---

## Methods

### connect

```javascript
jsPsych.multiplayer.connect(adapter, options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
adapter | `MultiplayerAdapter` | The adapter for your backend.
options | object | *(optional)* Any of the options below.

Option | Type | Description
-------|------|------------
dropoutTimeout | number | How long, in milliseconds, a participant can stay disconnected before they count as having left. Defaults to `10000`. Use `null` or `Infinity` to never mark participants as left.
onParticipantLeft | function | Called with a participant's ID when that participant's status becomes `left`.
onStatusChange | function | Called with the new status whenever this participant's connection status changes.
signal | `AbortSignal` | Aborting this signal cancels a `connect()` that hasn't finished.

#### Return value

A `Promise<MultiplayerSession>` that resolves when the connection is open.

#### Description

Opens a session and makes it the current session. Call and await `connect()` before `jsPsych.run()`; until it resolves, every other method throws or rejects.

`connect()` rejects if a session is already open or connecting, so call `disconnect()` first. The exception is a session whose connection was lost (status `"closed"`), which `connect()` replaces. If the adapter fails to connect, `connect()` rejects and you can call it again.

If the attempt is cancelled, by aborting `signal` or by calling `disconnect()`, `connect()` rejects with a `MultiplayerCancelledError`. It waits to reject until the adapter has closed anything it opened.

You decide what the experiment does when a participant leaves. `onParticipantLeft` is a good place to end the experiment or show a message. Multiplayer plugins handle departures within their own trials by passing `participants` to `wait()`.

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

A `Promise<void>` that resolves when the adapter has closed the connection.

#### Description

Closes the current session, or cancels a `connect()` that hasn't finished. Pending `wait()` calls reject with a `MultiplayerCancelledError`, and writes the backend hasn't confirmed reject.

`participantId` and `session` become `null` as soon as you call `disconnect()`, even if the adapter then fails to disconnect. You can always call `connect()` again afterward.

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
data | object | A plain object of JSON values that replaces this participant's slot.

#### Return value

A `Promise<void>` that resolves when the backend confirms a write that includes `data`.

#### Description

Replaces this participant's slot. Reads show the new data immediately.

The promise rejects if the backend rejects the write, if `data` isn't plain JSON, or if the session is closed. When the backend rejects a write, your slot keeps the data and sends it again with your next write.

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
data | object | A plain object of JSON values to merge into this participant's slot.

#### Return value

A `Promise<void>`, as for `push()`.

#### Description

Merges `data` into this participant's slot. Top-level keys in `data` replace the same keys in the slot, and other keys in the slot are kept. The merge is shallow: a nested object in `data` replaces the whole nested object in the slot.

If the backend already holds data for this participant when the session opens, for example after a page reload, `update()` merges into that data.

#### Example

```javascript
// With the slot at { score: 1 }, this produces { score: 1, round: 2 }
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
participantId | string | The participant whose slot to read.

#### Return value

The participant's slot (frozen), or `undefined` if they haven't written anything.

#### Example

```javascript
const host = jsPsych.multiplayer.get(hostId);
if (host?.phase === "question") {
  // ...
}
```

---

### getAll

```javascript
jsPsych.multiplayer.getAll()
```

#### Parameters

None.

#### Return value

The shared data (frozen): an object that maps each participant ID to that participant's slot.

#### Example

```javascript
const group = jsPsych.multiplayer.getAll();
const allReady = Object.values(group).every((slot) => slot.ready === true);
```

---

### presence

```javascript
jsPsych.multiplayer.presence()
```

#### Parameters

None.

#### Return value

An object (frozen) that maps each participant ID to that participant's presence status: `"connected"`, `"away"`, or `"left"`.

#### Description

The object includes this participant. Your own status follows your connection: `"away"` while reconnecting and `"left"` once the connection is closed.

#### Example

```javascript
const partnerLeft = jsPsych.multiplayer.presence()[partnerId] === "left";
```

---

### subscribe

```javascript
jsPsych.multiplayer.subscribe(callback, options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
callback | function | Called with `(data, presence)`: the shared data and the presence of every participant.
options | object | *(optional)* `{ signal }`. Aborting `signal` removes the subscription.

#### Return value

An `Unsubscribe` function. Call it to remove the subscription.

#### Description

Calls `callback` immediately with the current state, then again after every change: another participant's write, your own write, or a change in anyone's presence.

If a callback throws, the error is logged and the other callbacks still run. If a callback writes data, the other callbacks still see each change in order.

A callback that writes the same data every time it runs is safe, because unchanged writes do nothing. A callback that writes *different* data every time it runs never stops sending. If it loops without waiting for the network, the session stops it after 100 rounds and logs an error.

A `signal` lets a plugin remove all of a trial's subscriptions at once: create an `AbortController` when the trial starts and abort it when the trial ends.

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
condition | function | Called with `(data, presence)` after every change. The wait ends when it returns `true`.
options | object | *(optional)* Any of the options below.

Option | Type | Description
-------|------|------------
timeout | number | The longest time to wait, in milliseconds. `null`, `undefined`, negative, and non-finite values mean no limit.
participants | string[] | Participants the wait depends on. If any of them leaves before `condition` returns `true`, the wait rejects.
signal | `AbortSignal` | Aborting this signal cancels the wait.

#### Return value

A `Promise<GroupSessionData>` that resolves with the shared data at the moment `condition` first returns `true`.

#### Description

`wait()` checks `condition` against the current state first, so it resolves immediately if the condition already holds. If `condition` throws, the promise rejects with that error. Otherwise, the promise rejects with one of these errors:

Error name | Cause
-----------|------
`MultiplayerTimeoutError` | `timeout` elapsed.
`MultiplayerParticipantLeftError` | A participant listed in `participants` left. The error's `participantId` property says who.
`MultiplayerCancelledError` | The wait was cancelled by `signal`, `cancelAllSubscriptions()`, `disconnect()`, or the end of the experiment.
`MultiplayerConnectionClosedError` | This participant's connection was lost for good.

All of these error classes are exported from `jspsych`. Compare `error.name` instead of using `instanceof`, which fails when a page loads two copies of jsPsych.

#### Example

```javascript
// Wait up to a minute for the partner's answer, and stop early if they leave
try {
  const group = await jsPsych.multiplayer.wait(
    (data) => data[partnerId]?.answer !== undefined,
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

None.

#### Description

Removes every subscription on the current session and rejects its pending `wait()` calls with a `MultiplayerCancelledError`. The connection stays open. This method mirrors `cancelAllKeyboardResponses()`.

jsPsych calls this method when the timeline finishes and when `abortExperiment()` is called. At the end of the timeline, it runs before `on_finish`, so `on_finish` can still write final data. Call it yourself only to stop listening partway through an experiment.

#### Example

```javascript
jsPsych.multiplayer.cancelAllSubscriptions();
```
