import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";
import {
  AdapterConnectOptions,
  ConnectOptions,
  GroupSessionData,
  MultiplayerAPI,
  MultiplayerAdapter,
  MultiplayerConnection,
} from "../../src/modules/multiplayer";

function deferred<T = void>() {
  let resolve: (value: T) => void;
  let reject: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

/** Let pending promise callbacks run. Works under fake timers, unlike setTimeout(0). */
async function flushPromises() {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}

/** A shared backend that every MockConnection on it reads and writes. */
class MockHub {
  data: GroupSessionData = {};
  connections = new Set<MockConnection>();

  /** Tell every open connection that something changed. */
  broadcast() {
    for (const connection of [...this.connections]) {
      connection.options.onChange();
    }
  }
}

class MockConnection implements MultiplayerConnection {
  online = true;
  pushes: Record<string, unknown>[] = [];
  disconnectCalls = 0;

  /** Replace to control when and how pushes settle. */
  pushImpl: (data: Record<string, unknown>) => Promise<void> = async (data) => this.write(data);

  constructor(
    readonly hub: MockHub,
    readonly participantId: string,
    readonly options: AdapterConnectOptions
  ) {}

  /** Store data on the backend and broadcast it, as a confirmed push does. */
  write(data: Record<string, unknown>) {
    this.hub.data = { ...this.hub.data, [this.participantId]: data };
    this.hub.broadcast();
  }

  getAll() {
    return this.hub.data;
  }

  connectedParticipants() {
    return [...this.hub.connections].filter((c) => c.online).map((c) => c.participantId);
  }

  push(data: Record<string, unknown>) {
    this.pushes.push(data);
    return this.pushImpl(data);
  }

  async disconnect() {
    this.disconnectCalls++;
    this.hub.connections.delete(this);
    this.hub.broadcast();
  }

  /** Simulate this participant's network dropping or recovering, as the others see it. */
  setOnline(online: boolean) {
    this.online = online;
    this.hub.broadcast();
  }
}

class MockAdapter implements MultiplayerAdapter {
  connections: MockConnection[] = [];
  signals: AbortSignal[] = [];

  /** While set, connect() waits for it, ignoring the abort signal like a slow backend. */
  gate: Promise<void> | null = null;

  /** When set, the next connect() rejects with it. */
  failNext: Error | null = null;

  constructor(readonly hub: MockHub, readonly participantId: string) {}

  async connect(options: AdapterConnectOptions) {
    this.signals.push(options.signal);
    if (this.failNext) {
      const error = this.failNext;
      this.failNext = null;
      throw error;
    }
    if (this.gate) await this.gate;
    const connection = new MockConnection(this.hub, this.participantId, options);
    this.connections.push(connection);
    this.hub.connections.add(connection);
    this.hub.broadcast();
    return connection;
  }

  /** The most recent connection. */
  get connection() {
    return this.connections[this.connections.length - 1];
  }
}

let hub: MockHub;

beforeEach(() => {
  hub = new MockHub();
});

// Restore in afterEach so a failing assertion can't leak fake timers or mocks into later tests
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

async function join(participantId: string, options?: ConnectOptions) {
  const api = new MultiplayerAPI();
  const adapter = new MockAdapter(hub, participantId);
  const session = await api.connect(adapter, options);
  return { api, adapter, session, connection: adapter.connection };
}

describe("connecting and disconnecting", () => {
  test("connect returns the session and sets participantId and status", async () => {
    const { api, session } = await join("p1");
    expect(api.session).toBe(session);
    expect(api.participantId).toBe("p1");
    expect(api.status).toBe("connected");
    await api.disconnect();
    expect(api.session).toBeNull();
    expect(api.participantId).toBeNull();
    expect(api.status).toBeNull();
  });

  test("two participants see each other's data", async () => {
    const a = await join("p1");
    const b = await join("p2");
    await a.api.push({ choice: "left" });
    await b.api.push({ choice: "right" });
    expect(a.api.get("p2")).toEqual({ choice: "right" });
    expect(b.api.get("p1")).toEqual({ choice: "left" });
  });

  test("methods throw or reject before connect", async () => {
    const api = new MultiplayerAPI();
    await expect(api.push({})).rejects.toThrow("connect()");
    await expect(api.update({})).rejects.toThrow("connect()");
    await expect(api.wait(() => true)).rejects.toThrow("connect()");
    expect(() => api.get("p1")).toThrow("connect()");
    expect(() => api.getAll()).toThrow("connect()");
    expect(() => api.presence()).toThrow("connect()");
    expect(() => api.subscribe(() => {})).toThrow("connect()");
  });

  test("methods throw or reject while connect() is still pending", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter(hub, "p1");
    const gate = deferred();
    adapter.gate = gate.promise;
    const connecting = api.connect(adapter);

    await expect(api.update({})).rejects.toThrow("connect()");
    expect(() => api.getAll()).toThrow("connect()");

    gate.resolve();
    await connecting;
    expect(api.getAll()).toEqual({});
  });

  test("calling connect() twice rejects", async () => {
    const { api, adapter } = await join("p1");
    await expect(api.connect(adapter)).rejects.toThrow("already been called");
  });

  test("a failed connect() allows a retry", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter(hub, "p1");
    adapter.failNext = new Error("network down");
    await expect(api.connect(adapter)).rejects.toThrow("network down");
    await api.connect(adapter);
    expect(api.participantId).toBe("p1");
  });

  test("aborting connect's signal cancels it", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter(hub, "p1");
    const gate = deferred();
    adapter.gate = gate.promise;
    const controller = new AbortController();

    const connecting = api.connect(adapter, { signal: controller.signal });
    controller.abort();
    expect(adapter.signals[0].aborted).toBe(true);
    gate.resolve();

    await expect(connecting).rejects.toMatchObject({ name: "MultiplayerCancelledError" });
    expect(adapter.connections[0].disconnectCalls).toBe(1);
    expect(api.session).toBeNull();
  });

  test("an already-aborted signal rejects without calling the adapter", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter(hub, "p1");
    await expect(api.connect(adapter, { signal: AbortSignal.abort() })).rejects.toMatchObject({
      name: "MultiplayerCancelledError",
    });
    expect(adapter.signals).toHaveLength(0);
  });

  test("disconnect during a pending connect waits until the adapter has closed it", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter(hub, "p1");
    const gate = deferred();
    adapter.gate = gate.promise;
    const connecting = api.connect(adapter);
    connecting.catch(() => {});

    let disconnected = false;
    const disconnecting = api.disconnect().then(() => (disconnected = true));
    await flushPromises();
    expect(adapter.signals[0].aborted).toBe(true);
    expect(disconnected).toBe(false);

    gate.resolve();
    await disconnecting;
    expect(adapter.connections[0].disconnectCalls).toBe(1);
    expect(hub.connections.size).toBe(0);
    await expect(connecting).rejects.toMatchObject({ name: "MultiplayerCancelledError" });
  });

  test("reusing an adapter object after a cancelled connect doesn't close the new connection", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter(hub, "p1");
    const gate = deferred();
    adapter.gate = gate.promise;

    const first = api.connect(adapter);
    first.catch(() => {});
    const disconnecting = api.disconnect();
    // Retry with the same object before the first attempt has finished
    const second = api.connect(adapter);

    gate.resolve();
    await disconnecting;
    const session = await second;
    await expect(first).rejects.toMatchObject({ name: "MultiplayerCancelledError" });

    const [stale, live] = adapter.connections;
    expect(stale.disconnectCalls).toBe(1);
    expect(live.disconnectCalls).toBe(0);
    expect(api.session).toBe(session);
    await api.update({ ok: true });
    expect(hub.data.p1).toEqual({ ok: true });
  });

  test("a rejecting adapter disconnect still leaves the API disconnected", async () => {
    const { api, adapter, connection } = await join("p1");
    connection.disconnect = async () => {
      throw new Error("boom");
    };
    await expect(api.disconnect()).rejects.toThrow("boom");
    expect(api.participantId).toBeNull();
    await api.connect(adapter);
    expect(api.participantId).toBe("p1");
  });

  test("overlapping disconnect calls close the connection once", async () => {
    const { api, session, connection } = await join("p1");
    await Promise.all([api.disconnect(), api.disconnect(), session.disconnect()]);
    expect(connection.disconnectCalls).toBe(1);
  });

  test("a session held after disconnect rejects writes and leaves the new session alone", async () => {
    const { api, adapter, session: old } = await join("p1");
    await api.disconnect();
    await api.connect(adapter);

    await expect(old.update({ stale: true })).rejects.toThrow("disconnected");
    await api.update({ fresh: true });
    expect(hub.data.p1).toEqual({ fresh: true });
  });
});

describe("writing", () => {
  test("push replaces the slot and update merges into it", async () => {
    const { api } = await join("p1");
    await api.push({ a: 1, b: 2 });
    await api.update({ b: 3, c: 4 });
    expect(hub.data.p1).toEqual({ a: 1, b: 3, c: 4 });
    await api.push({ z: 0 });
    expect(hub.data.p1).toEqual({ z: 0 });
  });

  test("update merges onto slot data already on the backend when connecting", async () => {
    hub.data = { p1: { score: 5 } };
    const { api } = await join("p1");
    await api.update({ round: 2 });
    expect(hub.data.p1).toEqual({ score: 5, round: 2 });
  });

  test("the adapter never receives the caller's object", async () => {
    const { api, connection } = await join("p1");
    const peer = await join("p2");
    const data = { round: 1, nested: { x: 1 } };

    await api.push(data);
    data.round = 2;
    data.nested.x = 2;

    expect(connection.pushes[0]).not.toBe(data);
    expect(hub.data.p1).toEqual({ round: 1, nested: { x: 1 } });
    expect(peer.api.get("p1")).toEqual({ round: 1, nested: { x: 1 } });
  });

  test("reads show a write before the backend confirms it", async () => {
    const { api, connection } = await join("p1");
    const ack = deferred();
    connection.pushImpl = () => ack.promise;
    const seen: unknown[] = [];
    api.subscribe((data) => seen.push(data.p1));

    const writing = api.update({ ready: true });
    expect(api.get("p1")).toEqual({ ready: true });
    expect(api.getAll().p1).toEqual({ ready: true });
    expect(seen).toEqual([undefined, { ready: true }]);

    ack.resolve();
    await writing;
  });

  test("writes made during a push go out together in the next one", async () => {
    const { api, connection } = await join("p1");
    const ack = deferred();
    const send = connection.pushImpl;
    connection.pushImpl = () => ack.promise;

    const first = api.update({ a: 1 });
    connection.pushImpl = send;
    const second = api.update({ b: 1 });
    const third = api.update({ b: 2, c: 3 });

    expect(connection.pushes).toEqual([{ a: 1 }]);
    ack.resolve();
    await Promise.all([first, second, third]);

    expect(connection.pushes).toEqual([{ a: 1 }, { a: 1, b: 2, c: 3 }]);
    expect(hub.data.p1).toEqual({ a: 1, b: 2, c: 3 });
  });

  test("callers whose writes share a push share its outcome", async () => {
    const { api, connection } = await join("p1");
    const ack = deferred();
    connection.pushImpl = () => ack.promise;
    const first = api.update({ a: 1 });

    connection.pushImpl = async () => {
      throw new Error("conflict");
    };
    const second = api.update({ b: 1 });
    const third = api.update({ c: 1 });

    ack.resolve();
    await first;
    await expect(second).rejects.toThrow("conflict");
    await expect(third).rejects.toThrow("conflict");
  });

  test("writes reach the backend in call order", async () => {
    const { api, connection } = await join("p1");
    const acks: Array<() => void> = [];
    connection.pushImpl = (data) =>
      new Promise((resolve) =>
        acks.push(() => {
          connection.write(data);
          resolve();
        })
      );

    const a = api.push({ phase: "a" });
    const b = api.push({ phase: "b" });
    // Only one push is in flight, so "b" can't overtake "a"
    expect(acks).toHaveLength(1);
    acks[0]();
    await a;
    acks[1]();
    await b;

    connection.pushImpl = async (data) => connection.write(data);
    await api.update({ x: 1 });
    expect(hub.data.p1).toEqual({ phase: "b", x: 1 });
  });

  test("a merged update keeps nested values as they were when update() was called", async () => {
    const { api, connection } = await join("p1");
    const ack = deferred();
    const send = connection.pushImpl;
    connection.pushImpl = () => ack.promise;

    const first = api.update({ a: 0 });
    connection.pushImpl = send;
    const strokes = [1];
    const second = api.update({ strokes });
    strokes.push(2);

    ack.resolve();
    await Promise.all([first, second]);
    expect(hub.data.p1).toEqual({ a: 0, strokes: [1] });
  });

  test("a write that doesn't change the slot sends nothing", async () => {
    const { api, connection } = await join("p1");
    await api.update({ a: 1 });
    await api.update({ a: 1 });
    await api.push({ a: 1 });
    expect(connection.pushes).toHaveLength(1);
  });

  test("repeating the data of a failed push sends it again", async () => {
    const { api, connection } = await join("p1");
    const send = connection.pushImpl;
    connection.pushImpl = async () => {
      throw new Error("conflict");
    };
    await expect(api.update({ a: 1 })).rejects.toThrow("conflict");
    connection.pushImpl = send;
    await api.update({ a: 1 });
    expect(hub.data.p1).toEqual({ a: 1 });
  });

  test("a failed push rejects, and its data goes out with the next write", async () => {
    const { api, connection } = await join("p1");
    const send = connection.pushImpl;
    connection.pushImpl = async () => {
      throw new Error("conflict");
    };
    await expect(api.update({ a: 1 })).rejects.toThrow("conflict");
    expect(api.get("p1")).toEqual({ a: 1 });

    connection.pushImpl = send;
    await api.update({ b: 2 });
    expect(hub.data.p1).toEqual({ a: 1, b: 2 });
  });

  test("a push that resolves after a reconnect doesn't affect the new session", async () => {
    const { api, adapter, connection } = await join("p1");
    const ack = deferred();
    connection.pushImpl = () => ack.promise;
    const stale = api.update({ old: true });
    stale.catch(() => {});

    await api.disconnect();
    await expect(stale).rejects.toThrow("disconnect()");
    await api.connect(adapter);

    ack.resolve();
    await flushPromises();
    await api.update({ fresh: true });
    expect(hub.data.p1).toEqual({ fresh: true });
  });

  test("data must be a plain object of JSON values", async () => {
    const { api } = await join("p1");
    await expect(api.push(null)).rejects.toThrow("plain object");
    await expect(api.update([1] as any)).rejects.toThrow("plain object");
    await expect(api.push({ n: BigInt(1) })).rejects.toThrow(TypeError);
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    await expect(api.push(circular)).rejects.toThrow(TypeError);

    await api.push({ when: new Date(0), gone: undefined });
    expect(api.get("p1")).toEqual({ when: "1970-01-01T00:00:00.000Z" });
  });

  test("disconnect rejects unsent writes, and later writes reject", async () => {
    const { api, session, connection } = await join("p1");
    const ack = deferred();
    connection.pushImpl = () => ack.promise;
    const inFlight = api.update({ a: 1 });
    const queued = api.update({ b: 1 });

    await api.disconnect();
    await expect(inFlight).rejects.toThrow("disconnect()");
    await expect(queued).rejects.toThrow("disconnect()");
    await expect(session.update({ c: 1 })).rejects.toThrow("disconnected");
  });
});

describe("reading and subscribing", () => {
  test("every reader shares one frozen snapshot", async () => {
    const a = await join("p1");
    const b = await join("p2");
    const received: GroupSessionData[][] = [[], []];
    a.api.subscribe((data) => received[0].push(data));
    a.api.subscribe((data) => received[1].push(data));

    await b.api.push({ nested: { x: 1 } });
    const snapshot = received[0][received[0].length - 1];
    expect(received[1][received[1].length - 1]).toBe(snapshot);
    expect(a.api.getAll()).toBe(snapshot);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(() => {
      (snapshot.p2.nested as Record<string, unknown>).x = 2;
    }).toThrow(TypeError);
  });

  test("subscribe replays the current state, then fires on every change", async () => {
    const a = await join("p1");
    const b = await join("p2");
    await b.api.push({ n: 1 });

    const seen: unknown[] = [];
    const stop = a.api.subscribe((data) => seen.push(data.p2?.n));
    await b.api.push({ n: 2 });
    stop();
    await b.api.push({ n: 3 });
    expect(seen).toEqual([1, 2]);
  });

  test("subscribers receive presence too", async () => {
    const a = await join("p1");
    let presence;
    a.api.subscribe((_data, p) => (presence = p));
    await join("p2");
    expect(presence).toEqual({ p1: "connected", p2: "connected" });
  });

  test("aborting a subscription's signal removes it", async () => {
    const a = await join("p1");
    const b = await join("p2");
    const controller = new AbortController();
    const seen: unknown[] = [];
    a.api.subscribe((data) => seen.push(data.p2?.n), { signal: controller.signal });
    controller.abort();
    await b.api.push({ n: 1 });
    expect(seen).toEqual([undefined]);
  });

  test("a throwing subscriber doesn't stop the others", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const a = await join("p1");
    const b = await join("p2");
    a.api.subscribe((data) => {
      if (data.p2) throw new Error("bad subscriber");
    });
    const seen: unknown[] = [];
    a.api.subscribe((data) => seen.push(data.p2?.n));
    await b.api.push({ n: 1 });
    expect(seen).toEqual([undefined, 1]);
    expect(console.error).toHaveBeenCalled();
  });

  test("a subscriber that writes doesn't make others see snapshots out of order", async () => {
    const a = await join("p1");
    const b = await join("p2");
    a.api.subscribe((data) => {
      if (data.p2 && !data.p1) void a.api.update({ seen: true });
    });
    const seen: unknown[] = [];
    a.api.subscribe((data) => seen.push(data.p1?.seen));

    await b.api.push({ hello: true });
    await flushPromises();
    expect(seen[0]).toBeUndefined();
    expect(seen.slice(seen.indexOf(true))).not.toContain(undefined);
  });

  test("a subscriber that writes the same value every time doesn't loop", async () => {
    const a = await join("p1");
    const b = await join("p2");
    a.api.subscribe(() => void a.api.update({ seen: true }));
    await b.api.push({ n: 1 });
    await b.api.push({ n: 2 });
    await flushPromises();
    expect(a.connection.pushes).toEqual([{ seen: true }]);
  });

  test("a subscriber that writes new data every time is stopped instead of hanging", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const a = await join("p1");
    // Hold pushes open so only the synchronous loop runs, not echoes from the backend
    a.connection.pushImpl = () => new Promise(() => {});
    let count = 0;
    a.api.subscribe(() => void a.api.update({ count: count++ }).catch(() => {}));
    expect(count).toBeLessThanOrEqual(101);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("stopped notifying"));
    a.api.cancelAllSubscriptions();
  });

  test("cancelAllSubscriptions removes subscribers and keeps the connection open", async () => {
    const a = await join("p1");
    const b = await join("p2");
    const seen: unknown[] = [];
    a.api.subscribe((data) => seen.push(data.p2?.n));
    a.api.cancelAllSubscriptions();
    await b.api.push({ n: 1 });
    expect(seen).toEqual([undefined]);
    await a.api.update({ still: "open" });
    expect(hub.data.p1).toEqual({ still: "open" });
  });
});

describe("wait", () => {
  test("resolves at once when the condition already holds", async () => {
    const { api } = await join("p1");
    await api.push({ ready: true });
    await expect(api.wait((data) => data.p1?.ready === true)).resolves.toEqual({
      p1: { ready: true },
    });
  });

  test("resolves once another participant meets the condition", async () => {
    const a = await join("p1");
    const b = await join("p2");
    const waiting = a.api.wait((data) => data.p2?.ready === true);
    await b.api.push({ ready: true });
    expect((await waiting).p2).toEqual({ ready: true });
  });

  test("the condition receives presence", async () => {
    const a = await join("p1");
    const waiting = a.api.wait((_data, presence) => presence.p2 === "connected");
    await join("p2");
    await waiting;
  });

  test("rejects with MultiplayerTimeoutError when the timeout elapses", async () => {
    jest.useFakeTimers();
    const { api } = await join("p1");
    const waiting = api.wait(() => false, { timeout: 1000 });
    jest.advanceTimersByTime(1000);
    await expect(waiting).rejects.toMatchObject({ name: "MultiplayerTimeoutError" });
  });

  test.each([null, undefined, -1, Infinity, NaN, 2 ** 31])(
    "timeout %p means no timeout",
    async (timeout) => {
      jest.useFakeTimers();
      const { api } = await join("p1");
      let settled = false;
      const waiting = api.wait(() => false, { timeout });
      waiting.catch(() => {}).finally(() => (settled = true));
      jest.advanceTimersByTime(2 ** 31);
      await flushPromises();
      expect(settled).toBe(false);
      api.cancelAllSubscriptions();
    }
  );

  test("the old wait(condition, timeout) form rejects instead of waiting forever", async () => {
    const { api } = await join("p1");
    await expect(api.wait(() => false, 1000 as any)).rejects.toThrow("options object");
  });

  test("a throwing condition rejects the wait", async () => {
    const a = await join("p1");
    const b = await join("p2");
    const waiting = a.api.wait((data) => {
      if (data.p2) throw new Error("bad condition");
      return false;
    });
    await b.api.push({ n: 1 });
    await expect(waiting).rejects.toThrow("bad condition");
  });

  test("aborting the wait's signal rejects it with MultiplayerCancelledError", async () => {
    const { api } = await join("p1");
    const controller = new AbortController();
    const waiting = api.wait(() => false, { signal: controller.signal });
    controller.abort();
    await expect(waiting).rejects.toMatchObject({ name: "MultiplayerCancelledError" });
  });

  test("cancelAllSubscriptions and disconnect reject pending waits", async () => {
    jest.useFakeTimers();
    const { api } = await join("p1");
    const first = api.wait(() => false);
    api.cancelAllSubscriptions();
    await expect(first).rejects.toMatchObject({ name: "MultiplayerCancelledError" });

    const second = api.wait(() => false, { timeout: 1000 });
    await api.disconnect();
    jest.advanceTimersByTime(1000);
    await expect(second).rejects.toMatchObject({ name: "MultiplayerCancelledError" });
  });
});

describe("presence", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test("lists every connected participant, including this one", async () => {
    const a = await join("p1");
    expect(a.api.presence()).toEqual({ p1: "connected" });
    await join("p2");
    expect(a.api.presence()).toEqual({ p1: "connected", p2: "connected" });
  });

  test("a participant who comes back within the dropout timeout never leaves", async () => {
    const left = jest.fn();
    const a = await join("p1", { dropoutTimeout: 5000, onParticipantLeft: left });
    const b = await join("p2");

    b.connection.setOnline(false);
    expect(a.api.presence().p2).toBe("away");
    jest.advanceTimersByTime(4000);
    b.connection.setOnline(true);
    expect(a.api.presence().p2).toBe("connected");

    jest.advanceTimersByTime(10000);
    expect(a.api.presence().p2).toBe("connected");
    expect(left).not.toHaveBeenCalled();
  });

  test("a participant away longer than the dropout timeout has left, for good", async () => {
    const left = jest.fn();
    const a = await join("p1", { dropoutTimeout: 5000, onParticipantLeft: left });
    const b = await join("p2");

    await b.api.disconnect();
    expect(a.api.presence().p2).toBe("away");
    jest.advanceTimersByTime(5000);
    expect(a.api.presence().p2).toBe("left");
    expect(left).toHaveBeenCalledTimes(1);
    expect(left).toHaveBeenCalledWith("p2");

    await join("p2");
    expect(a.api.presence().p2).toBe("left");
  });

  test("the default dropout timeout is 10 seconds", async () => {
    const a = await join("p1");
    const b = await join("p2");
    b.connection.setOnline(false);
    jest.advanceTimersByTime(9999);
    expect(a.api.presence().p2).toBe("away");
    jest.advanceTimersByTime(1);
    expect(a.api.presence().p2).toBe("left");
  });

  test("a dropout timeout of null means participants are never marked as left", async () => {
    const a = await join("p1", { dropoutTimeout: null });
    const b = await join("p2");
    b.connection.setOnline(false);
    jest.advanceTimersByTime(2 ** 31);
    expect(a.api.presence().p2).toBe("away");
  });

  test("a participant with data who isn't connected at join starts out away", async () => {
    hub.data = { ghost: { x: 1 } };
    const a = await join("p1", { dropoutTimeout: 5000 });
    expect(a.api.presence().ghost).toBe("away");
    jest.advanceTimersByTime(5000);
    expect(a.api.presence().ghost).toBe("left");
  });

  test("a wait on a participant who leaves rejects with MultiplayerParticipantLeftError", async () => {
    const a = await join("p1", { dropoutTimeout: 5000 });
    const b = await join("p2");
    const waiting = a.api.wait((data) => data.p2?.ready === true, { participants: ["p2"] });

    await b.api.disconnect();
    jest.advanceTimersByTime(5000);
    await expect(waiting).rejects.toMatchObject({
      name: "MultiplayerParticipantLeftError",
      participantId: "p2",
    });
  });

  test("a wait whose condition holds resolves even if the participant has left", async () => {
    const a = await join("p1", { dropoutTimeout: 0 });
    const b = await join("p2");
    await b.api.push({ answer: 42 });
    await b.api.disconnect();
    jest.advanceTimersByTime(0);
    expect(a.api.presence().p2).toBe("left");

    const data = await a.api.wait((d) => d.p2?.answer === 42, { participants: ["p2"] });
    expect(data.p2).toEqual({ answer: 42 });
  });

  test("while this client reconnects, others' dropout clocks pause", async () => {
    const statuses: string[] = [];
    const a = await join("p1", {
      dropoutTimeout: 5000,
      onStatusChange: (status) => statuses.push(status),
    });
    const b = await join("p2");

    b.connection.setOnline(false);
    jest.advanceTimersByTime(3000);
    a.connection.options.onStatus("reconnecting");
    expect(a.api.status).toBe("reconnecting");
    expect(a.api.presence().p1).toBe("away");

    jest.advanceTimersByTime(10000);
    expect(a.api.presence().p2).toBe("away");

    a.connection.options.onStatus("connected");
    expect(a.api.presence().p1).toBe("connected");
    jest.advanceTimersByTime(4999);
    expect(a.api.presence().p2).toBe("away");
    jest.advanceTimersByTime(1);
    expect(a.api.presence().p2).toBe("left");
    expect(statuses).toEqual(["reconnecting", "connected"]);
  });
});

describe("losing the connection", () => {
  test("a closed connection fails pending work and keeps the last snapshot readable", async () => {
    const statuses: string[] = [];
    const a = await join("p1", { onStatusChange: (status) => statuses.push(status) });
    const waiting = a.api.wait(() => false);
    const ack = deferred();
    a.connection.pushImpl = () => ack.promise;
    const writing = a.api.update({ x: 1 });

    a.connection.options.onStatus("closed");

    const closed = { name: "MultiplayerConnectionClosedError" };
    await expect(waiting).rejects.toMatchObject(closed);
    await expect(writing).rejects.toMatchObject(closed);
    await expect(a.api.update({ y: 1 })).rejects.toMatchObject(closed);
    await expect(a.api.wait(() => false)).rejects.toMatchObject(closed);
    expect(a.api.status).toBe("closed");
    expect(a.api.presence().p1).toBe("left");
    expect(a.api.get("p1")).toEqual({ x: 1 });
    expect(a.connection.disconnectCalls).toBe(1);
    expect(statuses).toEqual(["closed"]);
  });

  test("subscribers get one last call when the connection is lost", async () => {
    const a = await join("p1");
    const seen: string[] = [];
    a.api.subscribe((_data, presence) => seen.push(presence.p1));
    a.connection.options.onStatus("closed");
    a.connection.options.onChange();
    expect(seen).toEqual(["connected", "left"]);
  });

  test("subscribers get one last call on disconnect", async () => {
    const { api } = await join("p1");
    const seen: string[] = [];
    api.subscribe((_data, presence) => seen.push(presence.p1));
    await api.disconnect();
    expect(seen).toEqual(["connected", "left"]);
  });

  test("a subscriber that disconnects during the last call doesn't close twice", async () => {
    const { api, session, connection } = await join("p1");
    session.subscribe(() => {
      if (session.status === "closed") void session.disconnect();
    });
    await api.disconnect();
    expect(connection.disconnectCalls).toBe(1);
  });

  test("a session whose connection closed can be replaced without disconnect()", async () => {
    const a = await join("p1");
    a.connection.options.onStatus("closed");
    const session = await a.api.connect(a.adapter);
    expect(a.api.session).toBe(session);
    expect(a.api.status).toBe("connected");
  });
});

describe("jsPsych integration", () => {
  test("abortExperiment cancels subscriptions and pending waits", async () => {
    const jsPsych = initJsPsych();
    await jsPsych.multiplayer.connect(new MockAdapter(hub, "p1"));
    const other = await join("p2");

    const received: GroupSessionData[] = [];
    jsPsych.multiplayer.subscribe((data) => received.push(data));
    const waiting = jsPsych.multiplayer.wait(() => false);
    waiting.catch(() => {});

    const { expectFinished } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "trial 1",
          on_finish: () => jsPsych.abortExperiment("the end"),
        },
        { type: htmlKeyboardResponse, stimulus: "trial 2" },
      ],
      jsPsych
    );
    await pressKey("a");
    await expectFinished();

    await expect(waiting).rejects.toMatchObject({ name: "MultiplayerCancelledError" });
    const count = received.length;
    await other.api.push({ late: true });
    expect(received).toHaveLength(count);
  });

  test("subscriptions end before on_finish, which can still write", async () => {
    const jsPsych = initJsPsych({
      on_finish: async () => {
        const count = received.length;
        await other.api.push({ late: true });
        expect(received).toHaveLength(count);
        await jsPsych.multiplayer.update({ done: true });
      },
    });
    await jsPsych.multiplayer.connect(new MockAdapter(hub, "p1"));
    const other = await join("p2");
    const received: GroupSessionData[] = [];
    jsPsych.multiplayer.subscribe((data) => received.push(data));

    const { expectFinished } = await startTimeline(
      [{ type: htmlKeyboardResponse, stimulus: "trial 1" }],
      jsPsych
    );
    await pressKey("a");
    await expectFinished();
    expect(hub.data.p1).toEqual({ done: true });
  });
});
