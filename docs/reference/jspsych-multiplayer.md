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
- The key `$mp` is reserved. The session stores its own bookkeeping there (see [Rejoining](#rejoining)) and removes it from everything you read; writing it makes the write reject.

All reads return one frozen object that is shared by every reader. Modifying it throws a `TypeError`, so copy it first if you need a changed version.

### Presence

The session tracks whether each participant is still in the group:

Status | Meaning
-------|--------
`connected` | The participant is connected.
`away` | The participant's connection dropped. Brief network interruptions show up this way.
`left` | The participant has been away for longer than the dropout timeout (10 seconds by default).

While your own connection is down, the session pauses everyone else's dropout timers, because it can't tell whether they are still there.

### Rejoining

A participant who drops out can come back, but only from the same page. The session tells the two cases apart:

- **Same page.** Their connection dropped and recovered, for example after a network outage or a laptop going to sleep. Their experiment is still where they left it, so they become `connected` again. If they had reached `left`, `onParticipantRejoined` is called.
- **New page load.** They reloaded, or opened the study again in a new tab, under the same ID. Their experiment started over, so it is out of step with the group. They stay `left` (or become `left` at once, if they were `away`), and `onParticipantRestarted` is called. On their side, `jsPsych.multiplayer.previousInstance` is set, so the experiment can explain that they can't rejoin.

To tell the cases apart, each page load writes a random ID and a counter into its slot under the reserved `$mp` key, and writes them again whenever its connection recovers. A participant counts as back only once a write made since they dropped out arrives. Being back in the adapter's list of connected participants isn't enough, because a reloaded page connects before its first write arrives.

Trials that already ended because a participant left stay ended; rejoining affects only what happens next. To give a participant time to come back before moving on, wait on their presence, for example with a `wait()` whose condition is `presence[partnerId] === "connected"` and a `timeout`.

### Groups

Some backends put arriving participants into groups for you: everyone opens the same link, and the backend fills each group as people arrive. JATOS group studies work this way. With these backends, `connect()` resolves once the participant has a group, and `group()` reports how the group stands:

Property | Meaning
---------|--------
`size` | The most participants the group can hold, or `null` if the backend doesn't say.
`members` | The participants in the group, including you.
`sealed` | `true` once nobody new can join.

A group is *forming* until it is sealed. While it forms, a participant who leaves frees their place, and the backend can give it to someone new. Once it is sealed, `members` is the final roster: a member who leaves stays on it and counts as a dropout, and new arrivals go to another group. A sealed group never becomes unsealed.

Adapters seal a group when it is full. To hold participants in a waiting room until then, wait for the seal:

```javascript
try {
  const group = await jsPsych.multiplayer.waitForGroup({ timeout: 5 * 60000 });
  // group.members is the final roster
} catch (error) {
  if (error.name === "MultiplayerTimeoutError") {
    // The group didn't fill in time: end the study for this participant
  }
}
```

To start with fewer participants than the group can hold, call `sealGroup()` yourself, for example after the waiting room times out with enough participants present.

With backends that don't form groups, you assign the groups, for example by giving each group its own link. Then `group()` lists everyone who has shown up, the group is never sealed, and `sealGroup()` and `waitForGroup()` reject. Wait for a number of participants with `wait()` instead.

### Shared randomness

`random()`, `randomInt()`, `shuffle()`, and `sample()` return the same values for every participant in the group, without sending anything. Use them for anything random the group must agree on, such as a condition or a stimulus order. `Math.random()` and `jsPsych.randomization` give each participant different values.

Each call takes a *key*, a string that names what the value is for:

```javascript
const condition = jsPsych.multiplayer.sample("condition", ["cooperate", "compete"], 1)[0];
const order = jsPsych.multiplayer.shuffle(`round-${round}-stimuli`, stimuli);
```

A value depends only on the key, the method, and the session's seed. It doesn't matter how many other calls a participant makes or in what order, and calling again with the same key returns the same value. A participant who reloads the page therefore gets the values they had before.

- **Use a different key for each random event.** Two calls with the same key and method return the same value, so put the round or trial number in the key when you need a new value each time.
- **Every participant must use the same key.** If one participant asks for `"offer"` and another for `"offer-1"`, they get different values.
- **The seed is the session ID** that the adapter reports, so each group gets different values. To get the same values in every session, for example to reproduce a study exactly, pass the same `randomSeed` to `connect()` for every participant.

---

## Properties

### participantId

```javascript
jsPsych.multiplayer.participantId
```

This participant's ID within the group. `null` until `connect()` resolves and after `disconnect()`. Read-only.

### sessionId

```javascript
jsPsych.multiplayer.sessionId
```

The ID of the group session, reported by the adapter. It is the same for every participant in the group and stays the same when a participant reconnects or reloads. Shared randomness uses it as its seed. `null` until `connect()` resolves and after `disconnect()`. Read-only.

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

The current `MultiplayerSession`, which is the object `connect()` returns. `null` until `connect()` resolves and after `disconnect()`. A session has `participantId`, `sessionId`, `status`, and `previousInstance` properties and every method listed below except `connect()`.


### previousInstance

```javascript
jsPsych.multiplayer.previousInstance
```

Set when this participant's slot came from an earlier page load: they reloaded or reopened the study, so their experiment started over while the group moved on. `null` otherwise, and when there is no session. Other participants see this participant as `left`. Read-only.

```javascript
await jsPsych.multiplayer.connect(adapter);
if (jsPsych.multiplayer.previousInstance) {
  // Show a message instead of starting the experiment again
}
```
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
randomSeed | string | Seed for [shared randomness](#shared-randomness) in place of the session ID. Every participant in the group must pass the same value.
onParticipantLeft | function | Called with a participant's ID when that participant's status becomes `left`.
onParticipantRejoined | function | Called with a participant's ID when a participant who had `left` comes back from the same page. See [Rejoining](#rejoining).
onParticipantRestarted | function | Called with a participant's ID when a participant comes back from a new page load, so their experiment started over. They stay `left`.
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

Closes the current session, or cancels a `connect()` that hasn't finished. Subscribers are called one last time and then removed, pending `wait()` calls reject with a `MultiplayerCancelledError`, and writes the backend hasn't confirmed reject.

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
// host is undefined until the host writes something
if (host !== undefined && host.phase === "question") {
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

// Check whether every participant has set ready to true
let allReady = true;
for (const id in group) {
  if (group[id].ready !== true) {
    allReady = false;
  }
}
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

### group

```javascript
jsPsych.multiplayer.group()
```

#### Parameters

None.

#### Return value

An object (frozen) with the group's `size`, `members`, and `sealed` properties. See [Groups](#groups).

#### Description

`members` lists participant IDs in sorted order, so every participant in a sealed group sees the same list. With an adapter that doesn't form groups, `size` is `null`, `members` is everyone who has shown up in the session, and `sealed` is `false`.

#### Example

```javascript
const { members, sealed } = jsPsych.multiplayer.group();
if (sealed) {
  const partners = members.filter((id) => id !== jsPsych.multiplayer.participantId);
}
```

---

### sealGroup

```javascript
jsPsych.multiplayer.sealGroup()
```

#### Parameters

None.

#### Return value

A `Promise` that resolves once the backend confirms the group is sealed.

#### Description

Stops new participants from joining the group, so it is sealed with the members it has now. Adapters seal a group automatically when it is full, so call this only to start with fewer participants. The seal reaches every member of the group, and `waitForGroup()` resolves for all of them.

Resolves at once if the group is already sealed. Rejects if the adapter can't seal groups, or if the session is closed.

#### Example

```javascript
// After five minutes in the waiting room, start with whoever is here, if there are enough
try {
  await jsPsych.multiplayer.waitForGroup({ timeout: 5 * 60000 });
} catch (error) {
  if (error.name !== "MultiplayerTimeoutError") throw error;
  const presence = jsPsych.multiplayer.presence();
  const here = Object.values(presence).filter((status) => status === "connected").length;
  if (here < 3) throw error;
  await jsPsych.multiplayer.sealGroup();
}
```

---

### waitForGroup

```javascript
jsPsych.multiplayer.waitForGroup(options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
options | object | *(optional)* `{ timeout, signal }`, as for [`wait()`](#wait).

#### Return value

A `Promise` that resolves with the group's state, as returned by `group()`, once the group is sealed.

#### Description

Resolves at once if the group is already sealed. Rejects for the same reasons as `wait()`. It also rejects at once if the adapter doesn't form groups, since the group would then never be sealed.

#### Example

```javascript
const { members } = await jsPsych.multiplayer.waitForGroup({ timeout: 300000 });
```

---

### subscribe

```javascript
jsPsych.multiplayer.subscribe(callback, options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
callback | function | Called with `(data, presence, group)`: the shared data, the presence of every participant, and the group's state (see [`group()`](#group)).
options | object | *(optional)* `{ signal }`. Aborting `signal` removes the subscription.

#### Return value

An `Unsubscribe` function. Call it to remove the subscription.

#### Description

Calls `callback` immediately with the current state, then again after every change: another participant's write, your own write, a change in anyone's presence, or a change in the group.

When the session closes, because of `disconnect()` or a lost connection, each callback is called one last time, with this participant's presence set to `"left"`, and then removed. A plugin that only subscribes can use this call to find out that the session has closed.

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
condition | function | Called with `(data, presence, group)` after every change. The wait ends when it returns `true`.
options | object | *(optional)* Any of the options below. Passing a number, as in the older `wait(condition, timeout)` form, makes the promise reject with a `TypeError`.

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
    (data) => {
      const partner = data[partnerId];
      return partner !== undefined && partner.answer !== undefined;
    },
    { participants: [partnerId], timeout: 60000 }
  );
} catch (error) {
  if (error.name === "MultiplayerParticipantLeftError") {
    // End the trial and record that the partner left
  }
}
```

---

### random

```javascript
jsPsych.multiplayer.random(key)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
key | string | Names what the value is for. Every participant who uses the same key gets the same value.

#### Return value

A number from 0 (inclusive) to 1 (exclusive).

#### Description

The shared counterpart of `Math.random()`. See [Shared randomness](#shared-randomness). Throws if `key` isn't a non-empty string.

#### Example

```javascript
const bonusRound = jsPsych.multiplayer.random("bonus") < 0.25;
```

---

### randomInt

```javascript
jsPsych.multiplayer.randomInt(key, lower, upper)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
key | string | Names what the value is for.
lower | integer | The smallest possible value.
upper | integer | The largest possible value. Must be at least `lower`.

#### Return value

An integer from `lower` to `upper`, inclusive.

#### Description

The shared counterpart of `jsPsych.randomization.randomInt()`. See [Shared randomness](#shared-randomness).

#### Example

```javascript
const endowment = jsPsych.multiplayer.randomInt(`round-${round}-endowment`, 5, 15);
```

---

### shuffle

```javascript
jsPsych.multiplayer.shuffle(key, array)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
key | string | Names what the order is for.
array | array | The items to shuffle.

#### Return value

A shuffled copy of `array`. The array itself is not changed.

#### Description

The shared counterpart of `jsPsych.randomization.shuffle()`: every participant who passes the same key and the same array gets the same order. See [Shared randomness](#shared-randomness).

#### Example

```javascript
const order = jsPsych.multiplayer.shuffle("trial-order", stimuli);

const trials = [];
for (const stimulus of order) {
  trials.push({ type: jsPsychMultiplayerChoice, stimulus: stimulus });
}
```

---

### sample

```javascript
jsPsych.multiplayer.sample(key, array, size)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
key | string | Names what the sample is for.
array | array | The items to draw from.
size | integer | How many items to draw, from 0 to the length of `array`.

#### Return value

An array of `size` items drawn from `array` without replacement, in random order.

#### Description

The shared counterpart of `jsPsych.randomization.sampleWithoutReplacement()`. See [Shared randomness](#shared-randomness).

#### Example

```javascript
const condition = jsPsych.multiplayer.sample("condition", ["gain", "loss"], 1)[0];
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
