# Multiplayer Adapter Development

A *multiplayer adapter* connects jsPsych's [multiplayer module](../reference/jspsych-multiplayer.md) to a backend that relays data between participants, such as JATOS group sessions, Firebase Realtime Database, or your own WebSocket server.

The multiplayer module does most of the work: it handles subscriptions and `wait()`, merges updates, sends one write at a time, copies and freezes data, and tracks presence. An adapter has two jobs: move each participant's data to and from the backend, and report which participants are connected.

## Overview

An adapter has two parts. The `jspsych` package exports a TypeScript type for each:

- A **`MultiplayerAdapter`** holds configuration, such as a server URL. Its `connect()` method opens a connection and returns it.
- A **`MultiplayerConnection`** is one open connection. Each call to `connect()` must return a new connection object. This lets an experiment reconnect with the same adapter without the old and new connections sharing state.

Communication runs both ways. The multiplayer module calls the connection's methods to read and write data. The connection calls two functions that the module passes to `connect()`: `onChange()` when data or membership changes, and `onStatus()` when its own connection drops, recovers, or closes.

```typescript
import {
  AdapterConnectOptions,
  GroupSessionData,
  MultiplayerAdapter,
  MultiplayerConnection,
} from "jspsych";
```

## MultiplayerAdapter

### connect

```typescript
connect(options: AdapterConnectOptions): Promise<MultiplayerConnection>
```

Open a connection, join the group, and resolve with the connection. If the connection fails, reject; the experiment can then call `connect()` again.

`options` contains:

Option | Description
-------|------------
`signal` | An `AbortSignal` that is aborted if the experiment cancels the connection attempt. When it's aborted, stop connecting, close anything you opened, and reject. If your backend can't be interrupted, you can ignore the signal: the multiplayer module closes any connection that arrives after the attempt was cancelled.
`onChange()` | Call this whenever the results of `getAll()` or `connectedParticipants()` may have changed: another participant wrote data, joined, or dropped out. The module then reads both methods and notifies subscribers only if something actually changed, so extra calls are harmless. A missed call means participants don't see an update.
`onStatus(status)` | Call this with `"reconnecting"` when your connection drops, `"connected"` when it recovers, and `"closed"` when it is gone for good. After `"closed"`, the module calls `disconnect()` and stops using the connection. Report a drop whenever other participants may have seen this participant as disconnected, even if your own channel stayed open (for example, a missed heartbeat): the module rewrites this participant's identity on `"connected"`, and other participants count them as back only after that write.

The module ignores calls to `onChange()` and `onStatus()` made before `connect()` resolves. It reads the initial state once `connect()` returns the connection.

## MultiplayerConnection

### participantId

```typescript
readonly participantId: string;
```

A stable ID for this participant within the group. It is also the key of the participant's slot in the shared data (`data[participantId]`). Set it before `connect()` resolves.

Use the same ID for every connection made from the same page, so a participant whose connection drops and recovers can rejoin. A reloaded page may reuse the ID or get a new one: the module tells a reload from a reconnect with its own bookkeeping, stored in each slot under the reserved key `$mp`. Store and return that key like any other data.

### sessionId

```typescript
readonly sessionId: string;
```

Identifies the group session. Set it before `connect()` resolves. It must be:

- **the same for every participant in the group**, because shared randomness (`jsPsych.multiplayer.random()` and related methods) uses it as its seed. Participants with different session IDs get different random values;
- **stable**: the same for every connection and every page load in the same group, so a participant who reconnects or reloads gets the values they had before;
- **different for each group**, so that groups don't all get the same random values;
- **a non-empty string**. `connect()` rejects otherwise.

Use the backend's own name for the group, such as the session path or room name the connections share, rather than generating one. Don't include anything that differs between participants, like the participant ID.

### getAll

```typescript
getAll(): GroupSessionData
```

Return the shared data synchronously: an object that maps each participant ID to that participant's slot. Return `{}` when there is no data, never `null`.

You can return your internal cache directly. The module copies the data before anyone else sees it. The data must be serializable as JSON.

### connectedParticipants

```typescript
connectedParticipants(): string[]
```

Return the IDs of the participants whose connections are currently open. The list may include this participant's own ID.

This is how the module detects dropouts. A participant missing from this list is `away`, and becomes `left` if they don't return before the dropout timeout. Report what your backend knows about connections, not which participants have data. Most backends track this already:

Backend | Where to get the list
--------|----------------------
JATOS | `jatos.groupChannels`, the group members with an open channel. The `onMemberOpen` and `onMemberClose` callbacks of `jatos.joinGroup()` tell you when to call `onChange()`.
Firebase Realtime Database | A presence node for each participant, removed by `onDisconnect().remove()`. Keep presence separate from the data slots so that a network interruption doesn't delete a participant's data.
Custom WebSocket server | The server's list of open sockets. Add a heartbeat to catch clients that disappear without closing their socket.

### push

```typescript
push(data: Record<string, unknown>): Promise<void>
```

Store `data` as this participant's slot, replacing the previous slot, and resolve when the backend confirms the write. Other participants should then see the new slot through `getAll()` and `onChange()`.

The module sends one push at a time, so you don't need to handle overlapping writes from the same participant. `data` is a frozen object that belongs to the module: send it as it is, and don't modify it. If your backend rejects writes that conflict with other writes, as JATOS group sessions do, retry before rejecting. The [JATOS adapter](https://github.com/jspsych/jspsych-multiplayer/tree/main/packages/adapter-multiplayer-jatos) shows one way to do this.

### disconnect

```typescript
disconnect(): Promise<void>
```

Close the connection and stop calling `onChange()` and `onStatus()`. The module calls `disconnect()` once and doesn't use the connection afterward.

## Example

This adapter keeps the shared data in memory, which is useful for local testing. All connections made through adapters that share one `InMemoryHub` belong to the same group:

```typescript
import {
  AdapterConnectOptions,
  GroupSessionData,
  MultiplayerAdapter,
  MultiplayerConnection,
} from "jspsych";

export class InMemoryHub {
  constructor(readonly sessionId: string) {}

  data: GroupSessionData = {};
  connections = new Set<InMemoryConnection>();

  broadcast() {
    for (const connection of this.connections) {
      connection.options.onChange();
    }
  }
}

class InMemoryConnection implements MultiplayerConnection {
  readonly sessionId: string;

  constructor(
    private hub: InMemoryHub,
    readonly participantId: string,
    readonly options: AdapterConnectOptions
  ) {
    this.sessionId = hub.sessionId;
  }

  getAll(): GroupSessionData {
    return this.hub.data;
  }

  connectedParticipants(): string[] {
    return [...this.hub.connections].map((c) => c.participantId);
  }

  async push(data: Record<string, unknown>): Promise<void> {
    this.hub.data = { ...this.hub.data, [this.participantId]: data };
    this.hub.broadcast();
  }

  async disconnect(): Promise<void> {
    this.hub.connections.delete(this);
    this.hub.broadcast();
  }
}

export class InMemoryAdapter implements MultiplayerAdapter {
  constructor(private hub: InMemoryHub, private participantId: string) {}

  async connect(options: AdapterConnectOptions): Promise<MultiplayerConnection> {
    const connection = new InMemoryConnection(this.hub, this.participantId, options);
    this.hub.connections.add(connection);
    this.hub.broadcast();
    return connection;
  }
}
```

To use it:

```javascript
const hub = new InMemoryHub("pilot-group");

async function runExperiment() {
  await jsPsych.multiplayer.connect(new InMemoryAdapter(hub, "participant-1"));
  await jsPsych.run(timeline);
}

runExperiment();
```

## Production adapters

The official adapters for JATOS, Firebase, and local testing are in the [jspsych-multiplayer](https://github.com/jspsych/jspsych-multiplayer) repository, along with the multiplayer plugins. The [JATOS adapter](https://github.com/jspsych/jspsych-multiplayer/tree/main/packages/adapter-multiplayer-jatos) shows how to retry conflicting writes and how to connect JATOS's single `onGroupSession` callback to `onChange()`.

## Checklist

- Each `connect()` call returns a new connection object that shares no state with other connections.
- `participantId` is set before `connect()` resolves.
- `sessionId` is set before `connect()` resolves, is the same for everyone in the group and across reloads, and differs between groups.
- `getAll()` returns a plain object, and `{}` rather than `null` when there is no data.
- `connectedParticipants()` lists open connections, not participants who have data, and changes when someone drops out.
- The connection calls `onChange()` after every change to data or membership.
- The connection calls `onStatus()` when its own connection drops, recovers, or closes for good.
- `push()` resolves only after the backend confirms the write, not when the write is queued.
- `disconnect()` closes the connection and stops all callbacks.
- A cancelled `connect()` (aborted `signal`) closes anything it opened before it rejects.
