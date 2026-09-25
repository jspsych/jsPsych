# jsPsych.multiplayer

The multiplayer module lets participants in a group share data while an experiment runs. Each participant has their own data, which only they write to and everyone in the group can read. Reads return the group's *shared data*: an object that maps each participant ID to that participant's data (type `GroupSessionData`).

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

After a session closes, `getAll()`, `get()`, `presence()`, and `group()` keep returning the last state they saw. Writes and `wait()` stop working.

### Writing data

`update()` merges into your data and `replace()` replaces it:

```javascript
await jsPsych.multiplayer.update({ score: 1 });         // { score: 1 }
await jsPsych.multiplayer.update({ round: 2 });         // { score: 1, round: 2 }
await jsPsych.multiplayer.update({ score: undefined }); // { round: 2 }
await jsPsych.multiplayer.replace({ done: true });      // { done: true }
```

Both change your data immediately, so your own reads, subscribers, and `wait()` calls see the new data at once. The session then sends it to the backend, and the promise returned by the write resolves when the backend confirms it. If the backend rejects a write, the session tries again, waiting a little longer each time, until it succeeds or the connection closes.

The session sends one write at a time. Writes made while a send is in progress are combined into the next send. Other participants always end up with your latest data, but they may never see a value that you replaced before it was sent. Store *state* in your data ("my current answer is 3"). For *events* that every participant must see, such as chat messages or individual clicks, append them to a list or keep a counter that others can compare against.

For the same reason, write `wait()` conditions that stay true once they become true. If the host moves through phases, a partner may never see the phase `"feedback"` if the host moved on to `"results"` before that write went out, and a wait for `phase === "feedback"` would never end. Have the host count steps instead, and wait for `step >= 3`.

A write that leaves your data unchanged sends nothing and doesn't notify subscribers.

### Scopes

The shared data is divided into *scopes*. During a trial, every read, write, subscription, and wait uses that trial's own scope unless you say otherwise. Data written in one trial doesn't appear in the next one, so a plugin can write `{ choice: "left" }` in every round without an answer from an earlier round satisfying a new `wait()`.

**The trial scope's name.** By default, a trial's scope is named after the trial's position in the timeline, such as `#3` or `#2.1`. Every participant running the same timeline gets the same name for the same trial, so they share that trial's data. Each repetition and each pass through a loop counts as a new position, so a repeated trial gets a new scope every time. A conditional timeline that is skipped still counts, so skipping it for some participants doesn't change the names of later trials.

**The `multiplayer_scope` parameter.** Every trial accepts a `multiplayer_scope` parameter that names its scope instead. You need it when participants' timelines differ in shape, for example when some run more trials than others inside the same timeline, or when two trials should deliberately share data. The name is used exactly as written. Trials with the same name share one scope, even when one is a repetition of the other, so a trial that repeats needs a name that changes with each repetition. Build the name from a timeline variable:

```javascript
const round = {
  timeline: [
    {
      type: jsPsychMultiplayerChoice,
      choices: ["Cooperate", "Defect"],
      multiplayer_scope: () => `round-${jsPsych.evaluateTimelineVariable("round")}`,
    },
  ],
  timeline_variables: [{ round: 1 }, { round: 2 }, { round: 3 }],
};
```

The name must be a non-empty string or a number. `multiplayer_scope: jsPsych.timelineVariable("round")` works on its own when the variable is different in each repetition. If you set `multiplayer_scope` on a timeline rather than a trial, every trial in that timeline uses the same scope.

**The session scope.** Data that must last the whole session, such as a nickname or a role, belongs in the *session scope*. Pass `{ scope: "session" }` to use it during a trial. Outside a trial, calls use the session scope by default. That includes code that runs before `jsPsych.run()`, in `on_timeline_start` or `on_timeline_finish`, in `conditional_function` or `loop_function`, in the experiment's `on_finish`, and in dynamic parameters (functions used as trial parameters), which run just before the trial starts. The trial scope starts when the trial's `on_start` runs and lasts until its `on_finish` has finished.

```javascript
const nickname = {
  type: jsPsychSurveyText,
  questions: [{ prompt: "Choose a nickname", name: "nickname" }],
  on_finish: async (data) => {
    await jsPsych.multiplayer.update(
      { nickname: data.response.nickname },
      { scope: "session" }
    );
  },
};

// Later, in any trial or between trials:
const partnerName = jsPsych.multiplayer.get(partnerId, { scope: "session" })?.nickname;
```

Pass `{ scope: "trial" }` to insist on the current trial's scope. It throws a `TypeError` outside a trial.

**Using an earlier trial's results.** A later trial can't see an earlier trial's scope. Record what later trials need in jsPsych's data, and read it from there. A trial's `on_finish` still uses the trial's scope, so it can copy what the group wrote into the trial's data:

```javascript
const choice = {
  type: jsPsychMultiplayerChoice,
  choices: ["Cooperate", "Defect"],
  data: { task: "round" },
  on_finish: (data) => {
    data.shared = jsPsych.multiplayer.getAll();
  },
};

// In a later trial:
const lastRound = jsPsych.data.get().filter({ task: "round" }).last(1).values()[0];
```

Multiplayer plugins usually record their results in the trial's data already; see each plugin's documentation.

### Lifetimes of subscriptions and waits

A subscription or `wait()` made during a trial belongs to the trial. When the trial ends, its subscriptions are removed and its pending waits reject with a `cancelled` error. A plugin doesn't need to clean them up.

To make a subscription that lasts the whole experiment, such as a scoreboard or a "your partner left" message, use the session scope: create it before `jsPsych.run()`, where the session scope is the default, or pass `{ scope: "session" }` inside a trial. It lasts until the experiment ends. It sees only session-scope data, not what trials write in their own scopes; presence and the group are the same in every scope.

```javascript
await jsPsych.multiplayer.connect(adapter);
jsPsych.multiplayer.subscribe((data, presence) => {
  updateScoreboard(data, presence);
});
await jsPsych.run(timeline);
```

When the experiment ends, or `abortExperiment()` is called, every subscription is removed and every pending wait rejects with a `cancelled` error. This happens before the experiment's `on_finish` runs, and the connection stays open, so `on_finish` can still write final data.

### Data format

Shared data must be plain JSON. Each write is copied as JSON when you make it, which matches what other participants receive over the network:

- The data you write must be a plain object. `BigInt` values and circular references make the write reject with a `TypeError`.
- `Date` values become strings.
- Keys whose value is `undefined` are dropped.

All reads return one frozen object that is shared by every reader. Modifying it throws a `TypeError`, so copy it first if you need a changed version.

### How much data you can share

Every write sends all of your data to the backend, not only what changed: your session-scope data plus the data of every trial scope you have written to so far. Other participants receive all of it too. Scopes from finished trials stay in your data until the session ends, so the longer the experiment and the more you write, the larger each write becomes.

Share only what other participants need to see, such as a choice, a score, or a short message. Keep everything else, such as response times and full trial records, in jsPsych's own data, which isn't sent to the group.

Each backend limits how much data it accepts. A write over the limit is rejected, and because the session keeps retrying it, none of your later writes reach the group either. Choose a backend with room for your study:

Backend | Limit
--------|------
Firebase | The adapter's recommended security rules allow each participant up to 128 KB. You can raise this in your rules; Firebase itself allows values of several megabytes.
JATOS | The whole group's data is stored together in one JATOS group session. Its size limit is set in the JATOS server's configuration; ask your JATOS administrator.
Local testing | Every participant's data is stored together in the browser's `localStorage`, which holds about 5 MB per site in most browsers.

### Presence

The session tracks whether each participant is still in the group:

Status | Meaning
-------|--------
`connected` | The participant is connected.
`away` | The participant's connection dropped. Brief network interruptions show up this way, and the participant can still come back.
`left` | The participant was away for longer than the dropout timeout (10 seconds by default), or reloaded the page.

`left` is final: a participant who has left stays `left`, even if their connection comes back. The group agrees on it. When one participant sees someone leave, they tell the rest of the group, and the others who have also lost sight of that participant count them as left at once, without waiting for their own dropout timers. A participant the group counted as left finds out when their connection recovers: their session closes with a `connection_lost` error.

While your own connection is down, the session pauses everyone else's dropout timers, because it can't tell whether they are still there.

To give participants more time to come back, choose a longer `dropoutTimeout` when you connect.

### Reconnecting and reloading

A participant whose connection drops and recovers on the same page, for example after a network outage or a laptop going to sleep, is `connected` again as long as they return before the dropout timeout. Their experiment is still where they left it.

A participant who reloads the page, or opens the study again in a new tab, can't rejoin. Their experiment started over, so it is out of step with the group, and the rest of the group counts them as `left`. On the reloaded page, `jsPsych.multiplayer.restarted` is `true`, and the session closes with a `connection_lost` error once the group has seen the reload. Check `restarted` after connecting, so the experiment can explain what happened instead of starting over (see the [`connect()` example](#connect)).

### Groups

Some backends put arriving participants into groups for you: everyone opens the same link, and the backend fills each group as people arrive. JATOS group studies work this way. With these backends, `connect()` resolves once the participant has a group, and `group()` reports how the group stands:

Property | Meaning
---------|--------
`size` | The most participants the group can hold, or `null` if the backend doesn't say.
`members` | The participants in the group, including you.
`sealed` | `true` once nobody new can join.

A group is *forming* until it is sealed. While it forms, a participant who leaves frees their place, and the backend can give it to someone new. Once it is sealed, `members` is the final roster: a member who leaves stays on it and counts as a dropout, and new arrivals go to another group. A sealed group never becomes unsealed. Every member of a sealed group appears in `presence()`, even one who never connected: they start out `away` and become `left` after the dropout timeout, so nobody waits for them forever.

With these backends, reads include only the group members' data.

Adapters seal a group when it is full. To hold participants in a waiting room until then, wait for the seal:

```javascript
try {
  const group = await jsPsych.multiplayer.waitForGroup({ timeout: 5 * 60000 });
  // group.members is the final roster
} catch (error) {
  if (error.name === "MultiplayerError" && error.code === "timeout") {
    // The group didn't fill in time: end the study for this participant
  }
}
```

To start with fewer participants than the group can hold, call `sealGroup()` yourself, for example after the waiting room times out with enough participants present.

With backends that don't form groups, you assign the groups, for example by giving each group its own link. Then `group()` lists everyone who has shown up, the group is never sealed, and `sealGroup()` and `waitForGroup()` reject with an `unsupported` error. Wait for a number of participants with `wait()` instead.

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

### Errors

When a multiplayer operation fails, it throws or rejects with a `MultiplayerError`. Its `name` is `"MultiplayerError"`, and its `code` says why:

Code | Cause
-----|------
`timeout` | A `wait()`, `waitForGroup()`, or `connect()` ran out of time.
`cancelled` | The operation was cancelled on purpose: by its `signal`, by `disconnect()`, or because its trial or the experiment ended.
`participant_left` | A participant listed in a `wait()`'s `participants` left. The error's `participantId` property says who.
`connection_lost` | This participant's connection was lost for good, or the group counted this participant as having left.
`not_connected` | There is no open session: `connect()` hasn't finished, or the session was disconnected.
`unsupported` | The adapter can't do what was asked, such as seal a group.

Check an error by comparing `error.name` and `error.code`:

```javascript
if (error.name === "MultiplayerError" && error.code === "participant_left") {
  // error.participantId says who left
}
```

Don't use `instanceof MultiplayerError`. Plugins are bundled separately from jsPsych, and `instanceof` fails when a page loads more than one copy of jsPsych.

Mistakes in the arguments, such as a scope other than `"trial"` or `"session"` or a timeout of `0`, throw or reject with a `TypeError` or `RangeError` instead.

### Timeouts

Every timeout option (`timeout`, `connectTimeout`, `dropoutTimeout`, and `reconnectTimeout`) takes a positive number of milliseconds, or `null` for no limit. Leaving the option out uses its default. `Infinity` also means no limit.

Any other value, including `0`, a negative number, `NaN`, or a string such as `"5000"`, is treated as a mistake: the call throws or rejects with a `TypeError` rather than guessing what you meant. Some plugins accept `0` in their own parameters to mean "no limit"; that is up to each plugin.

---

## Properties

### participantId

```javascript
jsPsych.multiplayer.participantId
```

This participant's ID within the group. `null` until `connect()` resolves. It keeps its value after the session closes. Read-only.

### sessionId

```javascript
jsPsych.multiplayer.sessionId
```

The ID of the group session, reported by the adapter. It is the same for every participant in the group and stays the same when a participant reconnects or reloads. Shared randomness uses it as its seed. `null` until `connect()` resolves. It keeps its value after the session closes. Read-only.

### status

```javascript
jsPsych.multiplayer.status
```

The state of this participant's connection:

- `"connected"`: the connection is open.
- `"reconnecting"`: the connection dropped, and the adapter is trying to restore it.
- `"closed"`: the connection is gone for good, either lost or closed by `disconnect()`.

`null` until `connect()` resolves. Read-only.

### restarted

```javascript
jsPsych.multiplayer.restarted
```

`true` when this participant reloaded or reopened the study after joining the group: their experiment started over, the group has moved on, and the other participants count them as having left. `false` otherwise. See [Reconnecting and reloading](#reconnecting-and-reloading). Read-only.

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
dropoutTimeout | number | How long, in milliseconds, a participant can stay disconnected before they count as having left. Defaults to `10000`. `null` means participants are never marked as left.
reconnectTimeout | number | How long, in milliseconds, this participant's own connection can stay `"reconnecting"` before the session gives up and closes with a `connection_lost` error. Defaults to `null`: keep trying as long as the adapter does.
connectTimeout | number | How long, in milliseconds, to wait for the adapter to connect before rejecting with a `timeout` error. Defaults to `20000`. `null` means no limit.
randomSeed | string | Seed for [shared randomness](#shared-randomness) in place of the session ID. Every participant in the group must pass the same value.
recordIds | boolean | Whether to add `multiplayer_participant_id` and `multiplayer_session_id` to every row of jsPsych's data recorded while connected, so you can match up the data from the members of a group. Each row keeps the IDs of the session it was recorded in. Defaults to `true`.
onParticipantLeft | function | Called with a participant's ID once, when that participant's status becomes `left`.
onStatusChange | function | Called with the new status whenever this participant's connection status changes.
signal | `AbortSignal` | Aborting this signal cancels a `connect()` that hasn't finished.

See [Timeouts](#timeouts) for the values the timeout options accept.

#### Return value

A `Promise<void>` that resolves when the connection is open.

#### Description

Opens a session and makes it the current session. Call and await `connect()` before `jsPsych.run()`; until it resolves, every other method throws or rejects with a `not_connected` error.

`connect()` rejects if a session is already open or connecting, so call `disconnect()` first. The exception is a session whose status is `"closed"`, which `connect()` replaces. If the adapter fails to connect, `connect()` rejects and you can call it again.

If the attempt is cancelled, by aborting `signal` or by calling `disconnect()`, `connect()` rejects with a `cancelled` error. If it takes longer than `connectTimeout`, it rejects with a `timeout` error. Either way, it waits to reject until the adapter has closed anything it opened.

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
  if (jsPsych.multiplayer.restarted) {
    document.body.innerHTML =
      "<p>You reloaded the page, so you can't rejoin your group. Thank you for participating.</p>";
    return;
  }
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

Closes the current session, or cancels a `connect()` that hasn't finished. Subscribers are called one last time and then removed. Pending `wait()` calls, and writes the backend hasn't confirmed, reject with a `cancelled` error.

Reads keep returning the last state, and `status` becomes `"closed"`. You can call `connect()` again afterward. Reconnecting from the same page this way is not a reload, so `restarted` stays `false`.

#### Example

```javascript
await jsPsych.multiplayer.disconnect();
```

---

### update

```javascript
jsPsych.multiplayer.update(data, options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
data | object | A plain object of JSON values to merge into this participant's data.
options | object | *(optional)* `{ scope }`: `"trial"` or `"session"`. See [Scopes](#scopes).

#### Return value

A `Promise<void>` that resolves when the backend confirms a write that includes `data`.

#### Description

Merges `data` into this participant's data in the scope. Top-level keys in `data` replace the same keys, other keys are kept, and a key set to `undefined` is removed. The merge is shallow: a nested object in `data` replaces the whole nested object.

If the backend already holds data for this participant when the session opens, for example after reconnecting, `update()` merges into that data.

The promise rejects with a `TypeError` if `data` isn't a plain object of JSON values, and with a `MultiplayerError` if the session is closed.

#### Example

```javascript
// With this participant's data at { score: 1 }, this produces { score: 1, round: 2 }
await jsPsych.multiplayer.update({ round: 2 });

// Session-scope data lasts beyond the current trial
await jsPsych.multiplayer.update({ role: "sender" }, { scope: "session" });
```

---

### replace

```javascript
jsPsych.multiplayer.replace(data, options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
data | object | A plain object of JSON values that replaces this participant's data in the scope.
options | object | *(optional)* `{ scope }`, as for `update()`.

#### Return value

A `Promise<void>`, as for `update()`.

#### Description

Replaces this participant's data in the scope with `data`, dropping every key that `data` leaves out. Other scopes are not affected.

#### Example

```javascript
await jsPsych.multiplayer.replace({ answer: 2 });
```

---

### get

```javascript
jsPsych.multiplayer.get(participantId, options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
participantId | string | The participant whose data to read.
options | object | *(optional)* `{ scope }`, as for `update()`.

#### Return value

The participant's data in the scope (frozen), or `undefined` if they haven't written anything there.

#### Example

```javascript
const host = jsPsych.multiplayer.get(hostId);
// host is undefined until the host writes something in this trial
if (host !== undefined && host.step >= 2) {
  // ...
}
```

---

### getAll

```javascript
jsPsych.multiplayer.getAll(options)
```

#### Parameters

Parameter | Type | Description
----------|------|------------
options | object | *(optional)* `{ scope }`, as for `update()`.

#### Return value

The shared data in the scope (frozen): an object that maps each participant ID to that participant's data. Participants who haven't written anything in the scope are left out. With a backend that forms groups, only the group's members are included.

#### Example

```javascript
const data = jsPsych.multiplayer.getAll();

// Check whether every group member has set ready to true
const { members } = jsPsych.multiplayer.group();
const allReady = members.every((id) => data[id]?.ready === true);
```

---

### presence

```javascript
jsPsych.multiplayer.presence()
```

#### Parameters

None.

#### Return value

An object (frozen) that maps each participant ID to that participant's presence status: `"connected"`, `"away"`, or `"left"`. See [Presence](#presence).

#### Description

The object includes this participant. Your own status follows your connection: `"away"` while reconnecting and `"left"` once the connection is closed. Presence is the same in every scope.

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

A `Promise<void>` that resolves once the backend confirms the group is sealed.

#### Description

Stops new participants from joining the group, so it is sealed with the members it has now. Adapters seal a group automatically when it is full, so call this only to start with fewer participants. Every member of the group sees the seal, and `waitForGroup()` resolves for all of them.

Resolves at once if the group is already sealed. Rejects with an `unsupported` error if the adapter can't seal groups, and with a `not_connected` or `connection_lost` error if the session is closed.

#### Example

```javascript
// After five minutes in the waiting room, start with whoever is here, if there are enough
try {
  await jsPsych.multiplayer.waitForGroup({ timeout: 5 * 60000 });
} catch (error) {
  if (error.name !== "MultiplayerError" || error.code !== "timeout") throw error;
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

Resolves at once if the group is already sealed. Rejects for the same reasons as `wait()`, and, if it was called during a trial, is cancelled when the trial ends. It rejects at once with an `unsupported` error if the adapter doesn't form groups, since the group would then never be sealed.

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
callback | function | Called with `(data, presence, group)`: the shared data in the scope, the presence of every participant, and the group's state (see [`group()`](#group)).
options | object | *(optional)* Any of the options below.

Option | Type | Description
-------|------|------------
scope | string | `"trial"` or `"session"`. See [Scopes](#scopes).
signal | `AbortSignal` | Aborting this signal removes the subscription.

#### Return value

An `Unsubscribe` function. Call it to remove the subscription.

#### Description

Calls `callback` immediately with the current state, then again after every change: another participant's write, your own write, a change in anyone's presence, or a change in the group.

A subscription made during a trial with the trial scope is removed when the trial ends. One that uses the session scope lasts until the experiment ends. See [Lifetimes](#lifetimes-of-subscriptions-and-waits).

When the session closes, because of `disconnect()` or a lost connection, each callback is called one last time, with this participant's presence set to `"left"`, and then removed. A plugin that only subscribes can use this call to find out that the session has closed.

If a callback throws, the error is logged and the other callbacks still run. If a callback writes data, the other callbacks still see each change in order.

A callback that writes the same data every time it runs is safe, because unchanged writes do nothing. A callback that writes *different* data every time it runs never stops sending. If it loops without waiting for the network, the session stops it after 100 rounds and logs an error.

#### Example

```javascript
// Inside a plugin's trial(): the subscription ends with the trial
jsPsych.multiplayer.subscribe((data, presence) => {
  renderChoices(display_element, data, presence);
});
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
timeout | number | The longest time to wait, in milliseconds, or `null` for no limit (the default). See [Timeouts](#timeouts).
participants | string[] | Participants the wait depends on. If any of them leaves before `condition` returns `true`, the wait rejects with a `participant_left` error.
scope | string | `"trial"` or `"session"`. See [Scopes](#scopes).
signal | `AbortSignal` | Aborting this signal cancels the wait.

#### Return value

A `Promise<GroupSessionData>` that resolves with the shared data at the moment `condition` first returns `true`.

#### Description

`wait()` checks `condition` against the current state first, so it resolves immediately if the condition already holds, even if a participant in `participants` has already left. Write conditions that stay true once they become true, because another participant's in-between values may never arrive (see [Writing data](#writing-data)).

If `condition` throws, the promise rejects with that error. Otherwise it rejects with a `MultiplayerError` whose `code` is `timeout`, `participant_left`, `cancelled` (the signal was aborted, the trial or experiment ended, or `disconnect()` was called), or `connection_lost`. See [Errors](#errors).

A wait made during a trial with the trial scope is cancelled when the trial ends. One that uses the session scope lasts until the experiment ends.

#### Example

```javascript
// Wait up to a minute for the partner's answer, and stop early if they leave
try {
  const data = await jsPsych.multiplayer.wait(
    (data) => data[partnerId]?.answer !== undefined,
    { participants: [partnerId], timeout: 60000 }
  );
} catch (error) {
  if (error.name === "MultiplayerError" && error.code === "participant_left") {
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
  trials.push({ type: jsPsychMultiplayerChoice, prompt: stimulus, choices: ["A", "B"] });
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
