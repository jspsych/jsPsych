# Multiplayer Adapter Development

A *multiplayer adapter* connects jsPsych's [multiplayer module](../reference/jspsych-multiplayer.md) to a backend that relays data between participants, such as JATOS group sessions, Firebase Realtime Database, or your own WebSocket server.

The multiplayer module does most of the work: it handles scopes, subscriptions, and `wait()`, merges updates, sends one write at a time and retries failed ones, copies and freezes data, tracks presence, and enforces timeouts. An adapter has two jobs: move each participant's data to and from the backend, and report which participants are connected.

## Overview

An adapter has two parts. The `jspsych` package exports a TypeScript type for each:

- A **`MultiplayerAdapter`** holds configuration, such as a server URL. Its `connect()` method opens a connection and returns it.
- A **`MultiplayerConnection`** is one open connection. Each call to `connect()` must return a new connection object. This lets an experiment reconnect with the same adapter without the old and new connections sharing state.

Communication runs both ways. The multiplayer module calls the connection's methods to read and write data. The connection calls three functions that the module passes to `connect()`: `onChange()` when data or membership changes, `onStatus()` when its own connection drops, recovers, or closes, and `onResumed()` when other participants may have lost sight of it without its own connection noticing.

```typescript
import {
  AdapterConnectOptions,
  GroupState,
  MultiplayerAdapter,
  MultiplayerConnection,
} from "jspsych";
```

## What the module sends

Each participant has one *payload*: an object the module builds from that participant's data in every scope, plus bookkeeping of its own, such as which page load the participant is on and which participants they have seen leave. The module sends the whole payload on every push and reads everyone's payloads back through `getAll()`.

The payload's format belongs to the module. It carries a version number, and later versions only add fields, so participants on different versions of jsPsych can still read each other's data. Treat the payload as opaque: store it as it is, return it unchanged, and don't read, add, or remove fields. Anything the adapter needs to keep for itself, such as timestamps or presence records, belongs somewhere else in the backend.

Because every push carries all of a participant's data, a payload grows as the experiment goes on. If your backend limits the size of a write or a stored value, state the limit in your adapter's documentation, so researchers can choose a backend with enough room.

## MultiplayerAdapter

### connect

```typescript
connect(options: AdapterConnectOptions): Promise<MultiplayerConnection>
```

Open a connection, join a group, and resolve with the connection. If the connection fails, reject; the experiment can then call `connect()` again. If your backend puts arriving participants into groups, resolve once this participant has one; see [Forming groups](#forming-groups).

Before resolving, load the backend's current state into the connection, so that `getAll()`, `connectedParticipants()`, and `group()` answer correctly as soon as `connect()` resolves. The module reads them straight away. That state includes this participant's own payload if one is stored: the module uses it to pick up where this participant left off, and to tell whether they reloaded the page.

`options` contains:

Option | Description
-------|------------
`signal` | An `AbortSignal` that is aborted when the experiment cancels the connection attempt, or when it takes longer than the experiment's `connectTimeout`. When it's aborted, stop connecting, close anything you opened, and reject. If your backend can't be interrupted, you can ignore the signal: the module closes any connection that arrives after the attempt was cancelled.
`onChange()` | Call this whenever the results of `getAll()`, `connectedParticipants()`, or `group()` may have changed: another participant wrote data, joined, or dropped out, or the group was sealed. The module then reads all three and notifies subscribers only if something actually changed, so extra calls are harmless. A missed call means participants don't see an update. Calls made before `connect()` resolves are allowed and ignored; the module reads everything once `connect()` returns the connection.
`onStatus(status)` | Call this with `"reconnecting"` when your connection drops, `"connected"` when it recovers, and `"closed"` when it is gone for good. After `"closed"`, the module ends the session with a `connection_lost` error, calls `disconnect()`, and stops using the connection. When the connection recovers, the module pushes this participant's payload again, so the rest of the group sees that they are back on the same page.
`onResumed()` | Call this when other participants may have seen this participant drop out even though your connection never reported `"reconnecting"`, for example after a missed heartbeat that the backend noticed before you did. The module then pushes again, as it does after `"connected"`. Other participants count someone who dropped out as back only after a push made since the drop, so a missed call can leave this participant looking `away` until they write something.

The module owns the timeouts. It gives up on `connect()` after the experiment's `connectTimeout` (by aborting `signal`), and on a connection that stays `"reconnecting"` for longer than the experiment's `reconnectTimeout` (by calling `disconnect()`). Don't add connection or give-up timers of your own; keep reconnecting until the backend says the connection is gone for good, or until `disconnect()` is called.

## MultiplayerConnection

### participantId

```typescript
readonly participantId: string;
```

A stable ID for this participant within the group. It is also the key of the participant's payload in `getAll()`. Set it before `connect()` resolves.

Use the same ID for every connection made from the same page, so a participant whose connection drops and recovers can rejoin. A reloaded page may reuse the ID or get a new one. The module tells a reload from a reconnect using its own bookkeeping in the payload.

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
getAll(): Record<string, unknown>
```

Return every participant's latest payload, synchronously, keyed by participant ID. Return `{}` when there is no data, never `null`. Return each payload as it was pushed, unchanged (see [What the module sends](#what-the-module-sends)).

Reads are synchronous, so an adapter for an asynchronous backend keeps an in-memory mirror of the backend's state. Fill it before `connect()` resolves, keep it up to date as the backend reports changes, and call `onChange()` after each change. You can return your mirror directly: the module copies the data before anyone else sees it. The data must be serializable as JSON.

Include payloads of participants whose connections are down. The module decides from presence whether they are `away` or `left`, and keeps showing their last data.

### connectedParticipants

```typescript
connectedParticipants(): string[]
```

Return the IDs of the participants whose connections are currently open, including this participant's own ID.

This is how the module detects dropouts. A participant missing from this list is `away`, and becomes `left` if they don't come back before the dropout timeout. Report what your backend knows about connections, not which participants have data. Most backends track this already:

Backend | Where to get the list
--------|----------------------
JATOS | `jatos.groupChannels`, the group members with an open channel. The `onMemberOpen` and `onMemberClose` callbacks of `jatos.joinGroup()` tell you when to call `onChange()`.
Firebase Realtime Database | A presence node for each participant, removed by `onDisconnect().remove()`. Keep presence separate from the payloads so that a network interruption doesn't delete a participant's data.
Custom WebSocket server | The server's list of open sockets. Add a heartbeat to catch clients that disappear without closing their socket, and call `onResumed()` if the server dropped this client from the list while its socket stayed open.

### push

```typescript
push(data: Record<string, unknown>): Promise<void>
```

Store `data` as this participant's payload, replacing the previous one, and resolve when the backend confirms the write. Other participants should then see the new payload through `getAll()` and `onChange()`.

If the write fails, reject. The module keeps the data and retries, waiting longer after each failure (from a quarter of a second up to 10 seconds), until a push succeeds or the connection closes. Don't build long retry loops of your own that keep `push()` from settling: the module sends one push at a time, so while yours is pending, nothing newer goes out. A short retry is fine for a conflict the backend expects, such as JATOS rejecting a group session update that raced with another member's; after that, reject and let the module try again.

The module sends one push at a time, so you don't need to handle overlapping writes from the same participant. `data` is a frozen object that belongs to the module: send it as it is, and don't modify it.

Whether this participant's own `getAll()` reflects the push, and whether you call `onChange()` for it, before or after the push resolves, is up to you. The module shows a participant their own writes directly, so echoing them back is optional.

Where the backend allows it, let each participant write only their own payload, for example with security rules that compare the write's key to the authenticated user. The module doesn't rely on this, but it keeps one participant, or a modified client, from changing another's data.

### group

```typescript
group?(): GroupState
```

Optional. Return the group's membership as your backend reports it, synchronously:

Property | Description
---------|------------
`size` | The most participants the group can hold, or `null` if the backend doesn't say.
`members` | The IDs of the participants assigned to the group. Report everyone the backend counts as a member, including participants whose connections are down.
`sealed` | `true` once the backend has confirmed that nobody new can join. Never go back to `false`.

Every member's connection must report the seal, not only the connection of the member who asked for it. Once sealed, `members` must be the final roster, including members who have since dropped out. See [Forming groups](#forming-groups).

Leave `group()` out if your backend doesn't form groups.

### sealGroup

```typescript
sealGroup?(): Promise<void>
```

Optional. Ask the backend to stop letting new participants join this group, and resolve once it confirms. After that, `group()` must report `sealed: true`. Sealing a group that's already sealed should succeed.

Leave the method out entirely if your backend can't seal groups; don't include one that throws. `jsPsych.multiplayer.sealGroup()` then rejects with an `unsupported` error.

### disconnect

```typescript
disconnect(): Promise<void>
```

Close the connection and stop calling `onChange()`, `onStatus()`, and `onResumed()`. The module calls `disconnect()` once, including after you report `"closed"`, and doesn't use the connection afterward.

## Forming groups

Participants usually arrive at a single link and have to be put into groups as they arrive. Two parts of that must happen on the backend, because two browsers working it out separately will disagree when participants arrive at the same moment:

1. **Assign.** Put each arriving participant into a group that still has room, or into a new group. Do this in `connect()`, and set `sessionId` to the group's ID. Your adapter runs in the browser, so it can't make this decision by itself. It asks the backend, which handles one arrival at a time. For example, JATOS assigns group members on its server, and Firebase Realtime Database can do it with a transaction.
2. **Seal.** Once a group is complete, stop anyone new from joining. Until then, a member who leaves frees their place for someone new. After the group is sealed, a member who leaves counts as a dropout, and a newcomer goes to a different group. Sealing is how the module tells a participant who left the waiting room from one who left mid-experiment. Seal the group automatically when the last place is filled, and implement `sealGroup()` so that experiments can also seal a group early, for example to start with fewer participants after a wait.

Report both through `group()`:

- **Every member must see the seal.** The module doesn't pass the seal from one member to the others, so each member's `group()` must report `sealed: true` on its own. Some backends tell only the member who sealed the group; JATOS is one. For these, the adapter has to make the seal visible to everyone, for example by recording it in a place in the backend that every member reads, written only by that member, and calling `onChange()` when it appears. Report `sealed: true` only after the backend has confirmed the seal.
- **The roster is final.** After sealing, report the same `members` list to every member, including members who have dropped out. The module also keeps every member it has seen on the roster, and a sealed group never becomes unsealed.

With `group()` in place, the module shows only members' data, lists every member in `presence()` (a member who never connects starts out `away` and becomes `left` after the dropout timeout), gives experiments `jsPsych.multiplayer.waitForGroup()`, and passes the group to subscribers and `wait()` conditions.

Where the group size comes from depends on the backend. Read it from the backend's settings when it has them (JATOS's batch properties have `maxActiveMembers`), and take it as an adapter option when it doesn't. If the backend can enforce the size, as Firebase security rules can check a size stored in the database, a modified client can't overfill a group.

Not every backend forms groups. If each group gets its own link, as with the `?mp_session=` parameter of the local and Firebase adapters, the researcher has already assigned the groups. Leave `group()` and `sealGroup()` out. The module then reports the group as everyone who has shown up, unsealed, and `waitForGroup()` rejects. Experiments wait for a number of participants with `wait()` instead.

## Example

This adapter keeps the shared data in memory, which is useful for local testing. All connections made through adapters that share one `InMemoryHub` belong to the same group:

```typescript
import { AdapterConnectOptions, MultiplayerAdapter, MultiplayerConnection } from "jspsych";

export class InMemoryHub {
  constructor(readonly sessionId: string) {}

  data: Record<string, unknown> = {};
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

  getAll(): Record<string, unknown> {
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

Everything is in memory, so the connection never drops and never needs `onStatus()` or `onResumed()`, and `push()` never fails. The hub's data doubles as the synchronous mirror. To use it:

```javascript
const hub = new InMemoryHub("pilot-group");

async function runExperiment() {
  await jsPsych.multiplayer.connect(new InMemoryAdapter(hub, "participant-1"));
  await jsPsych.run(timeline);
}

runExperiment();
```

## Production adapters

The official adapters for JATOS, Firebase, and local testing are in the [jspsych-multiplayer](https://github.com/jspsych/jspsych-multiplayer) repository, along with the multiplayer plugins. The [JATOS adapter](https://github.com/jspsych/jspsych-multiplayer/tree/main/packages/adapter-multiplayer-jatos) shows how to handle conflicting writes and how to connect JATOS's single `onGroupSession` callback to `onChange()`.

## Checklist

- Each `connect()` call returns a new connection object that shares no state with other connections.
- `participantId` and `sessionId` are set before `connect()` resolves. `sessionId` is the same for everyone in the group and across reloads, and differs between groups.
- `getAll()`, `connectedParticipants()`, and `group()` answer synchronously from a mirror that is filled before `connect()` resolves, including this participant's own stored payload.
- `getAll()` returns a plain object, `{}` rather than `null` when there is no data, and each payload unchanged.
- `connectedParticipants()` lists open connections, including this participant's, not participants who have data, and changes when someone drops out.
- If the backend forms groups, `connect()` resolves once the backend has assigned this participant a group, and `sessionId` is that group's ID.
- `group()`, if present, reports `sealed: true` on every member's connection, only after the backend confirms, and never goes back to `false`; once sealed, `members` is the final roster.
- `sealGroup()` is present only if the backend can seal groups; it resolves only after the backend confirms, and succeeds on a group that's already sealed.
- The connection calls `onChange()` after every change to data, membership, or the group. Calls before `connect()` resolves are fine.
- The connection calls `onStatus()` when its own connection drops, recovers, or closes for good, and `onResumed()` when others may have seen it drop out without it noticing.
- `push()` resolves only after the backend confirms the write, rejects promptly when it fails, and doesn't retry for long on its own.
- Where the backend allows it, a participant can write only their own payload.
- The adapter has no connect or reconnect timeouts of its own; the module's `signal` and `disconnect()` handle them.
- `disconnect()` closes the connection and stops all callbacks.
- A cancelled `connect()` (aborted `signal`) closes anything it opened before it rejects.
- The adapter's documentation states any limit on the size of a participant's payload.
