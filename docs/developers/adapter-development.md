# Multiplayer Adapter Development

A *multiplayer adapter* connects jsPsych's [multiplayer API](../reference/jspsych-multiplayer.md) to a real-time backend (JATOS group sessions, Firebase Realtime Database, a WebSocket server, etc.). The API handles everything above the network: subscriptions, `wait()`, merging updates, sending one write at a time, copying and freezing data, and turning raw connection events into presence statuses. The adapter only needs to move data and report who is connected.

## Overview

An adapter has two parts, both exported as types from `jspsych`:

- **`MultiplayerAdapter`** holds configuration only. Its `connect()` opens a new channel and returns it.
- **`MultiplayerConnection`** is one open channel. Every `connect()` call returns a new, independent connection, so an experiment can reuse the same adapter object to reconnect without the old and new connections sharing state.

The API talks to a connection in two directions. It *calls* the connection to read and write, and the connection *notifies* the API through two callbacks passed to `connect()`: `onChange()` when data or membership changes, and `onStatus()` when the channel itself drops, recovers, or closes.

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

Open the channel, join the group, and resolve with the connection. Reject if the connection fails; the experiment can then call `connect()` again.

`options` contains:

Option | Description
-------|------------
`signal` | An `AbortSignal` that is aborted if the experiment cancels the connection attempt. Stop connecting, close anything you opened, then reject. If your backend can't be interrupted, it's fine to ignore it: the API closes a connection that arrives after cancellation.
`onChange()` | Call whenever `getAll()` or `connectedParticipants()` may have changed: another participant wrote data, joined, or dropped out. The API re-reads both, so calling it too often is harmless; calling it too rarely means updates are missed.
`onStatus(status)` | Call with `"reconnecting"` when your own channel drops, `"connected"` when it recovers, and `"closed"` when it is gone for good. After `"closed"`, the API calls `disconnect()` and stops using the connection.

Calls to `onChange()` and `onStatus()` made before `connect()` resolves are ignored; the API reads the initial state once the connection is returned.

## MultiplayerConnection

### participantId

```typescript
readonly participantId: string;
```

A stable identifier for this participant within the group session, and the key under which their data is stored (`groupSession[participantId]`). Must be set when `connect()` resolves.

The API treats a participant who has been away longer than the dropout timeout as having left for good, so a participant who returns after that should get a new ID.

### getAll

```typescript
getAll(): GroupSessionData
```

Return the full group session synchronously: a map from `participantId` to that participant's data. Return `{}` when it is empty, never `null`.

The API copies the result on every `onChange()`, so returning your internal cache directly is safe. Data must be JSON-serializable.

### connectedParticipants

```typescript
connectedParticipants(): string[]
```

Return the IDs of the participants whose channels are currently open. It may include this participant's own ID.

This is how the API detects dropouts: a participant who disappears from this list becomes `away`, and `left` if they don't come back within the dropout timeout. Report what your backend actually knows about connections, not who has data. Most backends provide this directly:

Backend | Source
--------|-------
JATOS | `jatos.groupMembers` or `jatos.groupChannels`, kept current with the `onMemberOpen` and `onMemberClose` callbacks of `jatos.joinGroup()`.
Firebase Realtime Database | A presence node per participant, removed with `onDisconnect().remove()`. Keep it separate from data slots so a network blip doesn't delete data.
Custom WebSocket | The server's list of open sockets, with a heartbeat to catch clients that vanish without closing their socket.

### push

```typescript
push(data: Record<string, unknown>): Promise<void>
```

Store `data` as this participant's data, replacing the previous value, and resolve when the backend confirms the write. Other participants should then see it through `getAll()` and `onChange()`.

The API sends one push at a time, so you don't need to guard against overlapping writes from the same client. `data` is a frozen object the API owns; send it as is, but don't modify it. If your backend uses optimistic concurrency (like JATOS group sessions), retry on conflicts before rejecting; see the [JATOS adapter source](https://github.com/jspsych/jspsych-multiplayer/tree/main/packages/adapter-multiplayer-jatos) for an example.

### disconnect

```typescript
disconnect(): Promise<void>
```

Close the channel cleanly and stop calling `onChange()` and `onStatus()`. The API calls this once and doesn't use the connection afterward.

## Minimal example

An in-memory adapter for local testing. Every connection made from adapters sharing one `InMemoryHub` sees the same group session:

```typescript
import {
  AdapterConnectOptions,
  GroupSessionData,
  MultiplayerAdapter,
  MultiplayerConnection,
} from "jspsych";

export class InMemoryHub {
  data: GroupSessionData = {};
  connections = new Set<InMemoryConnection>();

  broadcast() {
    for (const connection of this.connections) {
      connection.options.onChange();
    }
  }
}

class InMemoryConnection implements MultiplayerConnection {
  constructor(
    private hub: InMemoryHub,
    readonly participantId: string,
    readonly options: AdapterConnectOptions
  ) {}

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

Usage:

```javascript
const hub = new InMemoryHub();

async function runExperiment() {
  await jsPsych.multiplayer.connect(new InMemoryAdapter(hub, "participant-1"));
  await jsPsych.run(timeline);
}

runExperiment();
```

## Real-world examples

The official adapters live in the [jspsych-multiplayer](https://github.com/jspsych/jspsych-multiplayer) repository, along with multiplayer plugins. The [JATOS adapter](https://github.com/jspsych/jspsych-multiplayer/tree/main/packages/adapter-multiplayer-jatos) shows how to handle optimistic-concurrency conflicts on `push()` and map one `onGroupSession` callback onto `onChange()`.

## Checklist for new adapters

- Each `connect()` returns a new connection object; no state is shared between connections.
- `participantId` is set when `connect()` resolves.
- `getAll()` returns a plain object, never `null` (`{}` when empty).
- `connectedParticipants()` reflects open channels, not who has data, and changes when someone drops out.
- `onChange()` is called after every change to data or membership.
- `onStatus()` reports your own channel dropping, recovering, and closing for good.
- `push()` resolves only after the backend **confirms** the write, not when it is queued locally.
- `disconnect()` closes the channel and stops all callbacks.
- A cancelled `connect()` (aborted `signal`) closes anything it opened before rejecting.
