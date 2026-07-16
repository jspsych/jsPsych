# @jspsych/plugin-multiplayer-sync

A synchronization-barrier plugin for multiplayer jsPsych experiments, built on the multiplayer plugin API. It packages the common **push → wait** pattern into a single declarative trial: optionally push this participant's data into the shared group session, show a waiting message, and end the trial once a condition over the group session is met (or an optional timeout elapses).

This replaces the awkward idioms previously needed for synchronization points — a `call-function` trial with `async`/`done`, or an `html-keyboard-response` trial with `choices: "NO_KEYS"`, an `on_start` that awaits `multiplayer.wait()`, and a manual `jsPsych.finishTrial()`.

## Prerequisites

Requires a connected multiplayer adapter (e.g. `@jspsych/adapter-multiplayer-jatos`). Connect it before `jsPsych.run()`:

```js
const jsPsych = initJsPsych();
await jsPsych.multiplayer.connect(new jsPsychAdapterMultiplayerJatos());
await jsPsych.run(timeline);
```

## Parameters

| Parameter      | Type             | Default                              | Description |
| -------------- | ---------------- | ------------------------------------ | ----------- |
| `wait_for`     | function         | *undefined* (required)               | Predicate `(group) => boolean` evaluated against the full group session on every update. The trial ends when it returns true. Same condition you would pass to `multiplayer.wait()`. |
| `push_data`    | object \| function | `null`                             | Data pushed into the group session when the trial starts, before waiting. `null` waits without pushing. May be a function returning the object, e.g. `() => ({ offer })`. |
| `message`      | HTML string \| function | `"<p>Waiting for other players…</p>"` | Shown while waiting. |
| `timeout`      | integer          | `null`                               | Max time to wait, in ms. On elapse the trial ends with `timed_out: true` and `on_timeout` is called. `null` waits indefinitely. |
| `on_timeout`   | function         | `null`                               | Called if `timeout` elapses before `wait_for` is satisfied. |
| `minimum_wait` | integer          | `0`                                  | Minimum time, in ms, to keep the message on screen so it doesn't flash by when the condition is already met. |

## Data Generated

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| `group`     | object  | The full group session snapshot at the moment the condition was met (or the timeout fired). Read peers / assign roles from here in `on_finish`. |
| `wait_time` | integer | Time spent waiting, in ms, from trial start until the trial ended. |
| `timed_out` | boolean | True if the trial ended because `timeout` elapsed rather than because `wait_for` was met. |

## Example: a lobby that waits for two players

```js
const lobby = {
  type: jsPsychMultiplayerSync,
  push_data: { status: "ready" },
  wait_for: (group) => Object.keys(group).length >= 2,
  message: "<p>Waiting for another player to join…</p>",
  on_finish: (data) => {
    // Role assignment stays experiment-specific — do it here off data.group.
    const [proposerId, responderId] = Object.keys(data.group).sort();
    myRole = jsPsych.multiplayer.participantId === proposerId ? "proposer" : "responder";
  },
};
```

## Scope

A jsPsych plugin is a trial, so this plugin covers synchronization points that are their own timeline step (barriers, lobbies, send-then-wait handoffs). For communication *in the middle* of another interactive trial, use the raw `jsPsych.multiplayer` API (`push`, `wait`, `get`, `getAll`, `subscribe`) directly.
