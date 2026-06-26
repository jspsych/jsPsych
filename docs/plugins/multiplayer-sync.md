# multiplayer-sync

Current version: 0.1.0. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-multiplayer-sync/CHANGELOG.md).

A synchronization barrier for multiplayer experiments. The plugin optionally pushes this participant's data into the shared group session, displays a waiting message, and ends the trial once a condition over the group session is satisfied (or an optional timeout elapses). It packages the common push → wait pattern as a single declarative trial.

Requires a connected multiplayer adapter — call `await jsPsych.pluginAPI.connect(adapter)` before `jsPsych.run()`. See [jsPsych.pluginAPI.multiplayer](../reference/jspsych-multiplayer.md) for the full API and [Multiplayer Adapter Development](../developers/adapter-development.md) for how to implement or choose an adapter.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
wait_for | function | *undefined* | Predicate evaluated on every group session update. Receives the full group session (a `GroupSessionData` object keyed by `participantId`). The trial ends as soon as this returns `true`. This is the same condition you would pass to `jsPsych.pluginAPI.wait()`.
push_data | object or function | `null` | Data to push into the shared group session when the trial starts, before waiting. Supply `null` to wait without pushing. As with any jsPsych parameter, you may supply a function that returns the object — useful for reading state captured by earlier trials.
message | HTML string | `"<p>Waiting for other players…</p>"` | HTML shown while waiting for the condition to be met.
timeout | number | `null` | Maximum time to wait in milliseconds before giving up. When the timeout elapses the trial ends with `timed_out: true` and `on_timeout` is called. `null` waits indefinitely.
on_timeout | function | `null` | Called if `timeout` elapses before `wait_for` is satisfied. Receives the timeout `Error` as its first argument.
minimum_wait | number | `0` | Minimum time in milliseconds to keep the waiting message on screen. Prevents the screen from flashing by when the condition is already satisfied. Does not extend a wait that takes longer than this on its own.

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
group | object | The full group session snapshot at the moment the condition was met (or when the timeout fired). Keyed by `participantId`.
wait_time | number | Time spent waiting in milliseconds, from trial start until the trial ended.
timed_out | boolean | `true` if the trial ended because `timeout` elapsed rather than because `wait_for` returned `true`.

## Install

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-multiplayer-sync.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-multiplayer-sync
```
```js
import MultiplayerSync from '@jspsych/plugin-multiplayer-sync';
```

## Examples

???+ example "Lobby barrier: wait until a minimum number of players have joined"
    === "Code"
        ```javascript
        // Before jsPsych.run(), connect an adapter:
        await jsPsych.pluginAPI.connect(new JatosAdapter());

        const lobbyBarrier = {
          type: jsPsychMultiplayerSync,
          push_data: () => ({ role: "player", name: myName }),
          wait_for: (group) => Object.values(group).length >= 4,
          message: "<p>Waiting for 4 players to join…</p>",
        };
        ```

???+ example "Synchronization point: wait for all players to finish a trial"
    === "Code"
        ```javascript
        // Push the player's answer, wait until every member in the group has answered.
        const syncAfterQuestion = {
          type: jsPsychMultiplayerSync,
          push_data: () => ({ answer: myAnswer }),
          wait_for: (group) => {
            const members = Object.values(group);
            return members.length > 0 && members.every((m) => m.answer !== undefined);
          },
          message: "<p>Waiting for everyone to answer…</p>",
          on_finish: (data) => {
            // data.group contains all participants' answers
            console.log(data.group);
          },
        };
        ```

???+ example "Timeout: give up if the group doesn't form within 2 minutes"
    === "Code"
        ```javascript
        const lobbyBarrier = {
          type: jsPsychMultiplayerSync,
          push_data: { status: "ready" },
          wait_for: (group) => Object.keys(group).length >= 2,
          timeout: 120000,
          on_timeout: () => {
            alert("Could not find enough players. Please try again later.");
          },
        };
        ```
