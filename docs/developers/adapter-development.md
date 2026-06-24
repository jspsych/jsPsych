# Multiplayer Adapter Development

A *multiplayer adapter* is a thin class that connects jsPsych's [`MultiplayerAPI`](../reference/jspsych-multiplayer.md) to a real-time backend (JATOS group sessions, Firebase Realtime Database, a WebSocket server, etc.). The `MultiplayerAPI` handles the high-level logic — `wait()`, `subscribe()` replay, subscription tracking — so the adapter only needs to implement the network layer.

## The MultiplayerAdapter interface

Your adapter must implement the following interface (exported from `jspsych`):

```typescript
import { GroupSessionData, MultiplayerAdapter, Unsubscribe } from "jspsych";
```

### participantId

```typescript
readonly participantId: string;
```

A stable string identifier for this participant within the group session namespace. It is used as the key under which this participant's data is stored (`groupSession[participantId]`). Set in the constructor or during `connect()` before the promise resolves.

---

### connect

```typescript
connect(): Promise<void>
```

Open the communication channel and establish group membership. The `MultiplayerAPI` calls this exactly once and awaits it before allowing any other method call. If the connection fails, reject the promise — the API will roll back so the caller can retry.

---

### push

```typescript
push(data: Record<string, unknown>): Promise<void>
```

Write `data` into the shared group session under this participant's `participantId`. Resolves when the write is confirmed by the backend. Each call replaces the participant's entire data object, not a merge.

If your backend uses optimistic concurrency (like JATOS group sessions), implement a retry loop with exponential backoff — see the JATOS adapter source for a reference implementation.

---

### getAll

```typescript
getAll(): GroupSessionData
```

Return the full current group session as a synchronous snapshot. The return type is `Record<string, Record<string, unknown>>` — a map from `participantId` to that participant's data. If the backend has no data yet, return `{}`.

---

### get

```typescript
get(participantId: string): Record<string, unknown> | undefined
```

Return one participant's data from the local snapshot, or `undefined` if they have not pushed yet. This is typically just `this.getAll()[participantId]`.

---

### subscribe

```typescript
subscribe(callback: (data: GroupSessionData) => void): Unsubscribe
```

Register a callback that fires on every **future** group session update. Return an unsubscribe function that, when called, removes the subscription.

**Important:** The adapter's `subscribe()` must be future-only. Do not replay the current snapshot inside the adapter — the `MultiplayerAPI` wrapper handles that automatically so all adapters behave consistently.

---

### disconnect

```typescript
disconnect(): Promise<void>
```

Close the channel cleanly and clear all subscribers. Called automatically by `jsPsych.pluginAPI.disconnect()`. After this, the adapter instance will not be used again.

---

## Minimal example

Here is a complete in-memory adapter suitable for local testing or unit tests:

```typescript
import { GroupSessionData, MultiplayerAdapter, Unsubscribe } from "jspsych";

export class InMemoryAdapter implements MultiplayerAdapter {
  readonly participantId: string;
  private store: GroupSessionData = {};
  private subscribers = new Set<(data: GroupSessionData) => void>();

  /** Shared channel — all InMemoryAdapter instances that have connected. */
  static channel: InMemoryAdapter[] = [];

  constructor(participantId: string) {
    this.participantId = participantId;
  }

  connect(): Promise<void> {
    InMemoryAdapter.channel.push(this);
    return Promise.resolve();
  }

  push(data: Record<string, unknown>): Promise<void> {
    // Fan out to every peer's store and notify their subscribers
    for (const peer of InMemoryAdapter.channel) {
      peer.store = { ...peer.store, [this.participantId]: data };
      for (const cb of peer.subscribers) {
        cb(peer.store);
      }
    }
    return Promise.resolve();
  }

  getAll(): GroupSessionData {
    return this.store;
  }

  get(participantId: string): Record<string, unknown> | undefined {
    return this.store[participantId];
  }

  subscribe(callback: (data: GroupSessionData) => void): Unsubscribe {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  disconnect(): Promise<void> {
    this.subscribers.clear();
    InMemoryAdapter.channel = InMemoryAdapter.channel.filter((a) => a !== this);
    return Promise.resolve();
  }
}
```

Usage:

```javascript
// Before jsPsych.run():
InMemoryAdapter.channel = [];
await jsPsych.pluginAPI.connect(new InMemoryAdapter("participant-1"));
```

## Real-world example

The official JATOS adapter (`@jspsych/adapter-multiplayer-jatos`) is a good reference for a production implementation. It maps the interface onto JATOS group sessions, with a retry loop for optimistic concurrency conflicts on `push()` and a single `onGroupSession` dispatcher that fans out to multiple `subscribe()` callbacks. The source is at `packages/adapter-multiplayer-jatos/src/index.ts` in the jsPsych repository.

## Checklist for new adapters

- `participantId` is set **before** `connect()` resolves
- `push()` resolves only after the write is **confirmed** by the backend (not just locally enqueued)
- `getAll()` returns a plain object, never `null` (return `{}` when empty)
- `subscribe()` is **future-only** — no replay in the adapter
- `subscribe()` returns a working unsubscribe function
- `disconnect()` removes all subscribers so updates stop arriving after the experiment ends
