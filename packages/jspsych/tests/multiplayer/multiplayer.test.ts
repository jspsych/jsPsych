import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";
import {
  AdapterConnectOptions,
  ConnectOptions,
  GroupSessionData,
  GroupState,
  MultiplayerAPI,
  MultiplayerAdapter,
  MultiplayerConnection,
  PROTOCOL_VERSION,
  timelineHooks,
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

/** A participant's pushed data, as the backend stores it. */
type WireSlot = {
  $mp: { v: number; instance: string; epoch: number; left?: string[] };
  session?: Record<string, unknown>;
  scopes: Record<string, Record<string, unknown>>;
};

/** Pushed data from an earlier page load, for seeding the backend. */
function wire(
  session?: Record<string, unknown>,
  { instance = "earlier-page", epoch = 1, scopes = {} } = {}
): WireSlot {
  return {
    $mp: { v: PROTOCOL_VERSION, instance, epoch },
    scopes,
    ...(session === undefined ? {} : { session }),
  };
}

/** A participant's session-scope data as stored on the backend. */
function stored(id: string) {
  return (hub.data[id] as WireSlot | undefined)?.session;
}

/** The session-scope data of each push that carried any. */
function userPushes(connection: MockConnection) {
  return connection.pushes
    .map((push) => (push as WireSlot).session)
    .filter((session) => session !== undefined);
}

/** A shared backend that every MockConnection on it reads and writes. */
class MockHub {
  sessionId = "session-1";
  data: Record<string, unknown> = {};
  connections = new Set<MockConnection>();

  /** Set to make the backend form groups. */
  groups: { size: number | null; sealed: boolean } | null = null;
  sealCalls = 0;

  /** Everyone who has joined, as a backend that forms groups tracks them. */
  members = new Set<string>();

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

  readonly sessionId: string;

  group?: () => GroupState;
  sealGroup?: () => Promise<void>;

  /** Replace to control when and how pushes settle. */
  pushImpl: (data: Record<string, unknown>) => Promise<void> = async (data) => this.write(data);

  constructor(
    readonly hub: MockHub,
    readonly participantId: string,
    readonly options: AdapterConnectOptions
  ) {
    this.sessionId = hub.sessionId;
    const { groups } = hub;
    if (groups) {
      this.group = () => ({ size: groups.size, members: [...hub.members], sealed: groups.sealed });
      this.sealGroup = async () => {
        hub.sealCalls++;
        groups.sealed = true;
        hub.broadcast();
      };
    }
  }

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

  /**
   * Simulate this participant's network dropping or recovering. Like a real adapter, the
   * connection reports its own drop and recovery.
   */
  setOnline(online: boolean) {
    this.online = online;
    this.options.onStatus(online ? "connected" : "reconnecting");
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
    this.hub.members.add(this.participantId);
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
  await api.connect(adapter, options);
  return { api, adapter, connection: adapter.connection };
}

const code = (code: string) => ({ name: "MultiplayerError", code });

describe("connecting and disconnecting", () => {
  test("connect sets participantId and status", async () => {
    const { api } = await join("p1");
    expect(api.participantId).toBe("p1");
    expect(api.status).toBe("connected");
    expect(api.restarted).toBe(false);
  });

  test("two participants see each other's data", async () => {
    const a = await join("p1");
    const b = await join("p2");
    await a.api.update({ choice: "left" });
    await b.api.update({ choice: "right" });
    expect(a.api.get("p2")).toEqual({ choice: "right" });
    expect(b.api.get("p1")).toEqual({ choice: "left" });
  });

  test("methods throw or reject with not_connected before connect", async () => {
    const api = new MultiplayerAPI();
    expect(api.participantId).toBeNull();
    expect(api.status).toBeNull();
    await expect(api.update({})).rejects.toMatchObject(code("not_connected"));
    await expect(api.replace({})).rejects.toMatchObject(code("not_connected"));
    await expect(api.wait(() => true)).rejects.toMatchObject(code("not_connected"));
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

    await expect(connecting).rejects.toMatchObject(code("cancelled"));
    expect(adapter.connections[0].disconnectCalls).toBe(1);
    expect(api.participantId).toBeNull();
  });

  test("an already-aborted signal rejects without calling the adapter", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter(hub, "p1");
    await expect(api.connect(adapter, { signal: AbortSignal.abort() })).rejects.toMatchObject(
      code("cancelled")
    );
    expect(adapter.signals).toHaveLength(0);
  });

  test("connect() gives up after connectTimeout", async () => {
    jest.useFakeTimers();
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter(hub, "p1");
    const gate = deferred();
    adapter.gate = gate.promise;

    const connecting = api.connect(adapter, { connectTimeout: 1000 });
    connecting.catch(() => {});
    jest.advanceTimersByTime(1000);
    expect(adapter.signals[0].aborted).toBe(true);
    gate.resolve();
    await expect(connecting).rejects.toMatchObject(code("timeout"));
    expect(adapter.connections[0].disconnectCalls).toBe(1);
  });

  test("the default connectTimeout is 20 seconds", async () => {
    jest.useFakeTimers();
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter(hub, "p1");
    adapter.gate = new Promise(() => {});
    api.connect(adapter).catch(() => {});
    jest.advanceTimersByTime(19999);
    expect(adapter.signals[0].aborted).toBe(false);
    jest.advanceTimersByTime(1);
    expect(adapter.signals[0].aborted).toBe(true);
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
    await expect(connecting).rejects.toMatchObject(code("cancelled"));
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
    await second;
    await expect(first).rejects.toMatchObject(code("cancelled"));

    const [stale, live] = adapter.connections;
    expect(stale.disconnectCalls).toBe(1);
    expect(live.disconnectCalls).toBe(0);
    await api.update({ ok: true });
    expect(stored("p1")).toEqual({ ok: true });
  });

  test("a rejecting adapter disconnect still leaves the API disconnected", async () => {
    const { api, adapter, connection } = await join("p1");
    connection.disconnect = async () => {
      throw new Error("boom");
    };
    await expect(api.disconnect()).rejects.toThrow("boom");
    expect(api.status).toBe("closed");
    await api.connect(adapter);
    expect(api.status).toBe("connected");
  });

  test("overlapping disconnect calls close the connection once", async () => {
    const { api, connection } = await join("p1");
    await Promise.all([api.disconnect(), api.disconnect()]);
    expect(connection.disconnectCalls).toBe(1);
  });

  test("after disconnect, reads return the last state and writes reject", async () => {
    const a = await join("p1");
    const b = await join("p2");
    await a.api.update({ mine: 1 });
    await b.api.update({ theirs: 2 });
    await a.api.disconnect();

    expect(a.api.status).toBe("closed");
    expect(a.api.participantId).toBe("p1");
    expect(a.api.sessionId).toBe("session-1");
    expect(a.api.getAll()).toEqual({ p1: { mine: 1 }, p2: { theirs: 2 } });
    expect(a.api.get("p2")).toEqual({ theirs: 2 });
    expect(a.api.presence().p1).toBe("left");
    expect(a.api.group().members).toEqual(["p1", "p2"]);
    await expect(a.api.update({ more: 1 })).rejects.toMatchObject(code("not_connected"));
  });

  test("connecting again after disconnect starts a fresh session", async () => {
    const { api, adapter } = await join("p1");
    await api.update({ first: true });
    await api.disconnect();
    await api.connect(adapter);
    await api.update({ second: true });
    expect(stored("p1")).toEqual({ first: true, second: true });
  });

  test("recordIds adds the IDs to jsPsych's data by default", async () => {
    const properties: Record<string, unknown>[] = [];
    const api = new MultiplayerAPI({ addDataProperties: (p) => properties.push(p) });
    await api.connect(new MockAdapter(hub, "p1"));
    expect(properties).toEqual([
      { multiplayer_participant_id: "p1", multiplayer_session_id: "session-1" },
    ]);

    const quiet = new MultiplayerAPI({ addDataProperties: (p) => properties.push(p) });
    await quiet.connect(new MockAdapter(hub, "p2"), { recordIds: false });
    expect(properties).toHaveLength(1);
  });
});

describe("writing", () => {
  test("update merges, replace replaces", async () => {
    const { api } = await join("p1");
    await api.update({ a: 1, b: 2 });
    await api.update({ b: 3, c: 4 });
    expect(stored("p1")).toEqual({ a: 1, b: 3, c: 4 });
    await api.replace({ z: 0 });
    expect(stored("p1")).toEqual({ z: 0 });
  });

  test("update with an undefined value removes the key", async () => {
    const { api } = await join("p1");
    await api.update({ a: 1, b: 2 });
    await api.update({ a: undefined });
    expect(api.get("p1")).toEqual({ b: 2 });
    expect(stored("p1")).toEqual({ b: 2 });
  });

  test("update merges onto data already on the backend when connecting", async () => {
    hub.data = { p1: wire({ score: 5 }) };
    const { api } = await join("p1");
    await api.update({ round: 2 });
    expect(stored("p1")).toEqual({ score: 5, round: 2 });
  });

  test("the adapter never receives the caller's object", async () => {
    const { api, connection } = await join("p1");
    const peer = await join("p2");
    const data = { round: 1, nested: { x: 1 } };

    await api.update(data);
    data.round = 2;
    data.nested.x = 2;

    expect(userPushes(connection)[0]).not.toBe(data);
    expect(stored("p1")).toEqual({ round: 1, nested: { x: 1 } });
    expect(peer.api.get("p1")).toEqual({ round: 1, nested: { x: 1 } });
  });

  test("each push carries the protocol version", async () => {
    const { api, connection } = await join("p1");
    await api.update({ a: 1 });
    for (const push of connection.pushes) {
      expect((push as WireSlot).$mp.v).toBe(PROTOCOL_VERSION);
    }
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
    await flushPromises();
    const ack = deferred();
    const send = connection.pushImpl;
    connection.pushImpl = () => ack.promise;

    const first = api.update({ a: 1 });
    connection.pushImpl = send;
    const second = api.update({ b: 1 });
    const third = api.update({ b: 2, c: 3 });

    expect(userPushes(connection)).toEqual([{ a: 1 }]);
    ack.resolve();
    await Promise.all([first, second, third]);

    expect(userPushes(connection)).toEqual([{ a: 1 }, { a: 1, b: 2, c: 3 }]);
    expect(stored("p1")).toEqual({ a: 1, b: 2, c: 3 });
  });

  test("writes reach the backend in call order", async () => {
    const { api, connection } = await join("p1");
    await flushPromises();
    const acks: Array<() => void> = [];
    connection.pushImpl = (data) =>
      new Promise((resolve) =>
        acks.push(() => {
          connection.write(data);
          resolve();
        })
      );

    const a = api.replace({ phase: "a" });
    const b = api.replace({ phase: "b" });
    // Only one push is in flight, so "b" can't overtake "a"
    expect(acks).toHaveLength(1);
    acks[0]();
    await a;
    acks[1]();
    await b;

    connection.pushImpl = async (data) => connection.write(data);
    await api.update({ x: 1 });
    expect(stored("p1")).toEqual({ phase: "b", x: 1 });
  });

  test("a merged update keeps nested values as they were when update() was called", async () => {
    const { api, connection } = await join("p1");
    await flushPromises();
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
    expect(stored("p1")).toEqual({ a: 0, strokes: [1] });
  });

  test("a write that doesn't change the data sends nothing", async () => {
    const { api, connection } = await join("p1");
    await api.update({ a: 1 });
    await api.update({ a: 1 });
    await api.replace({ a: 1 });
    expect(userPushes(connection)).toHaveLength(1);
  });

  test("a failed push is retried until it succeeds, and its write resolves then", async () => {
    jest.useFakeTimers();
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { api, connection } = await join("p1");
    await flushPromises();
    const send = connection.pushImpl;
    let failures = 0;
    connection.pushImpl = async (data) => {
      if (failures < 3) {
        failures++;
        throw new Error("conflict");
      }
      return send(data);
    };

    let settled = false;
    const writing = api.update({ a: 1 }).finally(() => (settled = true));
    await flushPromises();
    expect(settled).toBe(false);
    expect(api.get("p1")).toEqual({ a: 1 });

    // Backs off: 250, 500, 1000 ms
    for (const delay of [250, 500, 1000]) {
      jest.advanceTimersByTime(delay);
      await flushPromises();
    }
    await writing;
    expect(stored("p1")).toEqual({ a: 1 });
    // Warned once for the whole run of failures
    expect(warn).toHaveBeenCalledTimes(1);
  });

  test("writes that keep failing are reported as an error once", async () => {
    jest.useFakeTimers();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const { api, connection } = await join("p1");
    await flushPromises();
    connection.pushImpl = async () => {
      throw new Error("too large");
    };
    api.update({ a: 1 }).catch(() => {});
    for (let i = 0; i < 12; i++) {
      jest.advanceTimersByTime(10000);
      await flushPromises();
    }
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toContain("failing for a while");
    await api.disconnect();
  });

  test("a new write during the retry delay goes out at once with the failed data", async () => {
    jest.useFakeTimers();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    const { api, connection } = await join("p1");
    await flushPromises();
    const send = connection.pushImpl;
    connection.pushImpl = async () => {
      throw new Error("conflict");
    };
    const first = api.update({ a: 1 });
    await flushPromises();

    connection.pushImpl = send;
    const second = api.update({ b: 2 });
    await Promise.all([first, second]);
    expect(stored("p1")).toEqual({ a: 1, b: 2 });
  });

  test("a push that resolves after a reconnect doesn't affect the new session", async () => {
    const { api, adapter, connection } = await join("p1");
    await flushPromises();
    const ack = deferred();
    connection.pushImpl = () => ack.promise;
    const stale = api.update({ old: true });
    stale.catch(() => {});

    await api.disconnect();
    await expect(stale).rejects.toMatchObject(code("cancelled"));
    await api.connect(adapter);

    ack.resolve();
    await flushPromises();
    await api.replace({ fresh: true });
    expect(stored("p1")).toEqual({ fresh: true });
  });

  test("data must be a plain object of JSON values", async () => {
    const { api } = await join("p1");
    await expect(api.replace(null)).rejects.toThrow("plain object");
    await expect(api.update([1] as any)).rejects.toThrow("plain object");
    await expect(api.replace({ n: BigInt(1) })).rejects.toThrow(TypeError);
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    await expect(api.replace(circular)).rejects.toThrow(TypeError);

    await api.replace({ when: new Date(0), gone: undefined });
    expect(api.get("p1")).toEqual({ when: "1970-01-01T00:00:00.000Z" });
  });

  test("any key can be written, including $mp", async () => {
    const a = await join("p1");
    const b = await join("p2");
    await a.api.update({ $mp: "mine" });
    expect(b.api.get("p1")).toEqual({ $mp: "mine" });
  });

  test("disconnect rejects unsent writes with cancelled", async () => {
    const { api, connection } = await join("p1");
    await flushPromises();
    const ack = deferred();
    connection.pushImpl = () => ack.promise;
    const inFlight = api.update({ a: 1 });
    const queued = api.update({ b: 1 });

    await api.disconnect();
    await expect(inFlight).rejects.toMatchObject(code("cancelled"));
    await expect(queued).rejects.toMatchObject(code("cancelled"));
  });
});

describe("reading and subscribing", () => {
  test("every reader shares one frozen snapshot", async () => {
    const a = await join("p1");
    const b = await join("p2");
    const received: GroupSessionData[][] = [[], []];
    a.api.subscribe((data) => received[0].push(data));
    a.api.subscribe((data) => received[1].push(data));

    await b.api.update({ nested: { x: 1 } });
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
    await b.api.update({ n: 1 });

    const seen: unknown[] = [];
    const stop = a.api.subscribe((data) => seen.push(data.p2?.n));
    await b.api.update({ n: 2 });
    stop();
    await b.api.update({ n: 3 });
    expect(seen).toEqual([1, 2]);
  });

  test("subscribers receive presence too", async () => {
    const a = await join("p1");
    let presence;
    a.api.subscribe((_data, p) => (presence = p));
    await join("p2");
    expect(presence).toEqual({ p1: "connected", p2: "connected" });
  });

  test("a participant who has written nothing has no entry", async () => {
    const a = await join("p1");
    await join("p2");
    expect(a.api.getAll()).toEqual({});
    expect(a.api.get("p2")).toBeUndefined();
  });

  test("an empty object someone wrote still shows up", async () => {
    const a = await join("p1");
    const b = await join("p2");
    await b.api.replace({});
    expect(a.api.get("p2")).toEqual({});
  });

  test("data in a format this client doesn't know is ignored", async () => {
    hub.data = { stray: { hello: "world" }, junk: 7 };
    const a = await join("p1");
    expect(a.api.getAll()).toEqual({});
  });

  test("aborting a subscription's signal removes it", async () => {
    const a = await join("p1");
    const b = await join("p2");
    const controller = new AbortController();
    const seen: unknown[] = [];
    a.api.subscribe((data) => seen.push(data.p2?.n), { signal: controller.signal });
    controller.abort();
    await b.api.update({ n: 1 });
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
    await b.api.update({ n: 1 });
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

    await b.api.update({ hello: true });
    await flushPromises();
    expect(seen[0]).toBeUndefined();
    expect(seen.slice(seen.indexOf(true))).not.toContain(undefined);
  });

  test("a subscriber that writes the same value every time doesn't loop", async () => {
    const a = await join("p1");
    const b = await join("p2");
    a.api.subscribe(() => void a.api.update({ seen: true }));
    await b.api.update({ n: 1 });
    await b.api.update({ n: 2 });
    await flushPromises();
    expect(userPushes(a.connection)).toEqual([{ seen: true }]);
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
    a.api[timelineHooks].experimentEnded();
  });

  test("the experiment ending removes subscribers and keeps the connection open", async () => {
    const a = await join("p1");
    const b = await join("p2");
    const seen: unknown[] = [];
    a.api.subscribe((data) => seen.push(data.p2?.n));
    a.api[timelineHooks].experimentEnded();
    await b.api.update({ n: 1 });
    expect(seen).toEqual([undefined]);
    await a.api.update({ still: "open" });
    expect(stored("p1")).toEqual({ still: "open" });
  });

  test("cancelAllSubscriptions and push are gone from the public API", async () => {
    const { api } = await join("p1");
    expect((api as any).cancelAllSubscriptions).toBeUndefined();
    expect((api as any).push).toBeUndefined();
    expect((api as any).previousInstance).toBeUndefined();
  });
});

describe("wait", () => {
  test("resolves at once when the condition already holds", async () => {
    const { api } = await join("p1");
    await api.update({ ready: true });
    await expect(api.wait((data) => data.p1?.ready === true)).resolves.toEqual({
      p1: { ready: true },
    });
  });

  test("resolves once another participant meets the condition", async () => {
    const a = await join("p1");
    const b = await join("p2");
    const waiting = a.api.wait((data) => data.p2?.ready === true);
    await b.api.update({ ready: true });
    expect((await waiting).p2).toEqual({ ready: true });
  });

  test("the condition receives presence", async () => {
    const a = await join("p1");
    const waiting = a.api.wait((_data, presence) => presence.p2 === "connected");
    await join("p2");
    await waiting;
  });

  test("rejects with a timeout error when the timeout elapses", async () => {
    jest.useFakeTimers();
    const { api } = await join("p1");
    const waiting = api.wait(() => false, { timeout: 1000 });
    jest.advanceTimersByTime(1000);
    await expect(waiting).rejects.toMatchObject(code("timeout"));
  });

  test.each([null, undefined, Infinity, 2 ** 31])(
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
      api[timelineHooks].experimentEnded();
    }
  );

  test.each([0, -1, NaN, "5000", true])("timeout %p is rejected as a mistake", async (timeout) => {
    const { api } = await join("p1");
    await expect(api.wait(() => false, { timeout: timeout as number })).rejects.toThrow(
      "positive number"
    );
  });

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
    await b.api.update({ n: 1 });
    await expect(waiting).rejects.toThrow("bad condition");
  });

  test("aborting the wait's signal rejects it with cancelled", async () => {
    const { api } = await join("p1");
    const controller = new AbortController();
    const waiting = api.wait(() => false, { signal: controller.signal });
    controller.abort();
    await expect(waiting).rejects.toMatchObject(code("cancelled"));
  });

  test("the experiment ending and disconnect reject pending waits", async () => {
    jest.useFakeTimers();
    const { api } = await join("p1");
    const first = api.wait(() => false);
    api[timelineHooks].experimentEnded();
    await expect(first).rejects.toMatchObject(code("cancelled"));

    const second = api.wait(() => false, { timeout: 1000 });
    await api.disconnect();
    jest.advanceTimersByTime(1000);
    await expect(second).rejects.toMatchObject(code("cancelled"));
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

  test("presence alone doesn't count as coming back", async () => {
    const a = await join("p1", { dropoutTimeout: 5000 });
    const b = await join("p2");
    b.connection.setOnline(false);
    // Back in the connected list, but no write from this page since the drop
    b.connection.online = true;
    hub.broadcast();
    expect(a.api.presence().p2).toBe("away");
  });

  test("a participant away longer than the dropout timeout has left, for good", async () => {
    const left = jest.fn();
    const a = await join("p1", { dropoutTimeout: 5000, onParticipantLeft: left });
    const b = await join("p2");
    await b.api.update({ score: 3 });

    b.connection.setOnline(false);
    expect(a.api.presence().p2).toBe("away");
    jest.advanceTimersByTime(5000);
    expect(a.api.presence().p2).toBe("left");
    expect(left).toHaveBeenCalledTimes(1);
    expect(left).toHaveBeenCalledWith("p2");

    // Coming back from the same page doesn't undo it
    b.connection.setOnline(true);
    expect(a.api.presence().p2).toBe("left");
    expect(a.api.get("p2")).toEqual({ score: 3 });
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

  test("an invalid dropout timeout rejects connect()", async () => {
    await expect(join("p1", { dropoutTimeout: 0 })).rejects.toThrow("dropoutTimeout");
  });

  test("a participant with data who isn't connected at join starts out away", async () => {
    hub.data = { ghost: wire({ x: 1 }) };
    const a = await join("p1", { dropoutTimeout: 5000 });
    expect(a.api.presence().ghost).toBe("away");
    jest.advanceTimersByTime(5000);
    expect(a.api.presence().ghost).toBe("left");
  });

  test("a wait on a participant who leaves rejects with participant_left", async () => {
    const a = await join("p1", { dropoutTimeout: 5000 });
    const b = await join("p2");
    const waiting = a.api.wait((data) => data.p2?.ready === true, { participants: ["p2"] });

    await b.api.disconnect();
    jest.advanceTimersByTime(5000);
    await expect(waiting).rejects.toMatchObject({
      ...code("participant_left"),
      participantId: "p2",
    });
  });

  test("a wait whose condition holds resolves even if the participant has left", async () => {
    const a = await join("p1", { dropoutTimeout: 1 });
    const b = await join("p2");
    await b.api.update({ answer: 42 });
    await b.api.disconnect();
    jest.advanceTimersByTime(1);
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

  test("onResumed tells the group this participant is still on the same page", async () => {
    const a = await join("p1", { dropoutTimeout: 5000 });
    const b = await join("p2");
    // Others lose sight of p2 without p2's own channel noticing
    b.connection.online = false;
    hub.broadcast();
    expect(a.api.presence().p2).toBe("away");

    b.connection.online = true;
    b.connection.options.onResumed();
    await flushPromises();
    expect(a.api.presence().p2).toBe("connected");
  });
});

describe("agreeing on who left", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test("a participant who sees someone leave tells the group", async () => {
    const a = await join("p1", { dropoutTimeout: 5000 });
    const b = await join("p2");
    b.connection.setOnline(false);
    jest.advanceTimersByTime(5000);
    await flushPromises();
    expect((hub.data.p1 as WireSlot).$mp.left).toEqual(["p2"]);
    expect(a.api.presence().p2).toBe("left");
  });

  test("others who have also lost sight of them agree at once", async () => {
    const left = jest.fn();
    const a = await join("p1", { dropoutTimeout: 5000 });
    const c = await join("p3", { dropoutTimeout: 60000, onParticipantLeft: left });
    const b = await join("p2");

    b.connection.setOnline(false);
    expect(c.api.presence().p2).toBe("away");
    jest.advanceTimersByTime(5000);
    await flushPromises();
    // p3's own clock has a long way to go, but p1 has told the group
    expect(a.api.presence().p2).toBe("left");
    expect(c.api.presence().p2).toBe("left");
    expect(left).toHaveBeenCalledWith("p2");
  });

  test("a participant who can still see them doesn't believe it", async () => {
    const a = await join("p1", { dropoutTimeout: 5000 });
    const c = await join("p3");
    await join("p2");
    // Only p1 thinks p2 is gone, e.g. a buggy or malicious client
    a.connection.write({
      ...(hub.data.p1 as WireSlot),
      $mp: { ...(hub.data.p1 as WireSlot).$mp, left: ["p2"] },
    });
    expect(c.api.presence().p2).toBe("connected");
  });

  test("a participant the group gave up on is told their connection was lost", async () => {
    const statuses: string[] = [];
    await join("p1", { dropoutTimeout: 5000 });
    const b = await join("p2", { onStatusChange: (s) => statuses.push(s) });
    const waiting = b.api.wait(() => false);

    b.connection.setOnline(false);
    jest.advanceTimersByTime(5000);
    await flushPromises();
    b.connection.setOnline(true);
    await flushPromises();

    await expect(waiting).rejects.toMatchObject(code("connection_lost"));
    expect(b.api.status).toBe("closed");
    expect(statuses[statuses.length - 1]).toBe("closed");
  });

  test("a participant who was never away can't be evicted", async () => {
    await join("p1");
    const b = await join("p2");
    hub.data = {
      ...hub.data,
      p1: { ...(hub.data.p1 as WireSlot), $mp: { v: 1, instance: "x", epoch: 9, left: ["p2"] } },
    };
    hub.broadcast();
    expect(b.api.status).toBe("connected");
  });
});

describe("reloading", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test("a participant who reloads has restarted, counts as left, and is told so", async () => {
    const left = jest.fn();
    const a = await join("p1", { dropoutTimeout: 5000, onParticipantLeft: left });
    const b = await join("p2");
    await b.api.update({ round: 4 });
    const waiting = a.api.wait(() => false, { participants: ["p2"] });

    // A reload: a new page (new jsPsych.multiplayer) connects under the same ID
    await b.api.disconnect();
    expect(a.api.presence().p2).toBe("away");
    const reloaded = new MultiplayerAPI();
    await reloaded.connect(b.adapter);
    await flushPromises();

    expect(a.api.presence().p2).toBe("left");
    expect(left).toHaveBeenCalledTimes(1);
    await expect(waiting).rejects.toMatchObject(code("participant_left"));
    // The reloaded page can tell that the group is ahead of it
    expect(reloaded.restarted).toBe(true);
    expect(reloaded.status).toBe("closed");
    expect(reloaded.get("p2")).toEqual({ round: 4 });
    // No dropout clock is left running for them
    jest.advanceTimersByTime(5000);
    expect(left).toHaveBeenCalledTimes(1);
  });

  test("reconnecting with connect() after the group counted you as left is refused", async () => {
    await join("p1", { dropoutTimeout: 5000 });
    const b = await join("p2");
    await b.api.disconnect();
    jest.advanceTimersByTime(5000);
    await flushPromises();

    await b.api.connect(b.adapter);
    await flushPromises();
    expect(b.api.restarted).toBe(false);
    expect(b.api.status).toBe("closed");
  });

  test("reconnecting on the same page with connect() is not a restart", async () => {
    const a = await join("p1", { dropoutTimeout: 5000 });
    const b = await join("p2");

    await b.api.disconnect();
    jest.advanceTimersByTime(4000);
    await b.api.connect(b.adapter);

    expect(b.api.restarted).toBe(false);
    expect(a.api.presence().p2).toBe("connected");
  });
});

describe("losing the connection", () => {
  test("a closed connection fails pending work and keeps the last snapshot readable", async () => {
    const statuses: string[] = [];
    const a = await join("p1", { onStatusChange: (status) => statuses.push(status) });
    await flushPromises();
    const waiting = a.api.wait(() => false);
    const ack = deferred();
    a.connection.pushImpl = () => ack.promise;
    const writing = a.api.update({ x: 1 });

    a.connection.options.onStatus("closed");

    const lost = code("connection_lost");
    await expect(waiting).rejects.toMatchObject(lost);
    await expect(writing).rejects.toMatchObject(lost);
    await expect(a.api.update({ y: 1 })).rejects.toMatchObject(lost);
    await expect(a.api.wait(() => false)).rejects.toMatchObject(lost);
    expect(a.api.status).toBe("closed");
    expect(a.api.presence().p1).toBe("left");
    expect(a.api.get("p1")).toEqual({ x: 1 });
    expect(a.connection.disconnectCalls).toBe(1);
    expect(statuses).toEqual(["closed"]);
  });

  test("reconnectTimeout gives up on a connection that stays down", async () => {
    jest.useFakeTimers();
    const a = await join("p1", { reconnectTimeout: 3000 });
    const waiting = a.api.wait(() => false);
    a.connection.options.onStatus("reconnecting");
    jest.advanceTimersByTime(2999);
    expect(a.api.status).toBe("reconnecting");
    jest.advanceTimersByTime(1);
    await expect(waiting).rejects.toMatchObject(code("connection_lost"));
    expect(a.api.status).toBe("closed");
  });

  test("recovering before reconnectTimeout keeps the connection", async () => {
    jest.useFakeTimers();
    const a = await join("p1", { reconnectTimeout: 3000 });
    a.connection.options.onStatus("reconnecting");
    jest.advanceTimersByTime(2000);
    a.connection.options.onStatus("connected");
    jest.advanceTimersByTime(5000);
    expect(a.api.status).toBe("connected");
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
    const { api, connection } = await join("p1");
    api.subscribe(() => {
      if (api.status === "closed") void api.disconnect();
    });
    await api.disconnect();
    expect(connection.disconnectCalls).toBe(1);
  });

  test("a session whose connection closed can be replaced without disconnect()", async () => {
    const a = await join("p1");
    a.connection.options.onStatus("closed");
    await a.api.connect(a.adapter);
    expect(a.api.status).toBe("connected");
  });
});

/** Shared randomness from the seed "golden" and the key "x"; see the test that uses it. */
const GOLDEN = {
  random: 0.9987728749401867,
  randomInt: 63,
  shuffle: ["c", "g", "b", "h", "f", "e", "a", "d"],
  sample: ["g", "d", "b"],
};

describe("session ID", () => {
  test("sessionId comes from the connection and is null before connecting", async () => {
    const api = new MultiplayerAPI();
    expect(api.sessionId).toBeNull();
    await api.connect(new MockAdapter(hub, "p1"));
    expect(api.sessionId).toBe("session-1");
  });

  test.each([undefined, "", 42])(
    "connect() rejects and disconnects when the connection's sessionId is %p",
    async (sessionId) => {
      hub.sessionId = sessionId as string;
      const api = new MultiplayerAPI();
      const adapter = new MockAdapter(hub, "p1");
      await expect(api.connect(adapter)).rejects.toThrow("sessionId");
      expect(adapter.connection.disconnectCalls).toBe(1);
      expect(api.sessionId).toBeNull();
    }
  );

  test("connect() rejects a randomSeed that isn't a string", async () => {
    await expect(join("p1", { randomSeed: 7 as unknown as string })).rejects.toThrow("randomSeed");
  });
});

describe("shared randomness", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g", "h"];

  test("every participant gets the same values for the same key", async () => {
    const a = await join("p1");
    const b = await join("p2");
    expect(a.api.random("x")).toBe(b.api.random("x"));
    expect(a.api.randomInt("x", 1, 1000)).toBe(b.api.randomInt("x", 1, 1000));
    expect(a.api.shuffle("x", items)).toEqual(b.api.shuffle("x", items));
    expect(a.api.sample("x", items, 3)).toEqual(b.api.sample("x", items, 3));
  });

  test("values don't depend on call order or on earlier calls", async () => {
    const a = await join("p1");
    const b = await join("p2");
    const first = [a.api.random("one"), a.api.random("two")];
    b.api.random("unrelated");
    b.api.shuffle("unrelated", items);
    expect([b.api.random("one"), b.api.random("two")]).toEqual(first);
    // Asking again returns the same value
    expect(a.api.random("one")).toBe(first[0]);
  });

  test("a new page load in the same session gets the same values", async () => {
    const before = await join("p1");
    const value = before.api.random("x");
    const order = before.api.shuffle("x", items);
    await before.api.disconnect();
    const after = await join("p1");
    expect(after.api.random("x")).toBe(value);
    expect(after.api.shuffle("x", items)).toEqual(order);
  });

  test("different sessions get different values", async () => {
    const a = await join("p1");
    hub = new MockHub();
    hub.sessionId = "session-2";
    const b = await join("p1");
    expect(a.api.random("x")).not.toBe(b.api.random("x"));
  });

  test("randomSeed replaces the session ID as the seed", async () => {
    const a = await join("p1", { randomSeed: "fixed" });
    hub = new MockHub();
    hub.sessionId = "session-2";
    const b = await join("p1", { randomSeed: "fixed" });
    const c = await join("p2");
    expect(a.api.random("x")).toBe(b.api.random("x"));
    expect(c.api.random("x")).not.toBe(b.api.random("x"));
  });

  test("different keys and different methods give unrelated values", async () => {
    const { api } = await join("p1");
    expect(api.random("x")).not.toBe(api.random("y"));
    // shuffle("x") isn't just the sample("x") order extended
    const shuffles = ["k1", "k2", "k3", "k4", "k5"].map((key) => api.shuffle(key, items));
    const samples = ["k1", "k2", "k3", "k4", "k5"].map((key) => api.sample(key, items, 8));
    expect(shuffles).not.toEqual(samples);
  });

  test("results have the right shape", async () => {
    const { api } = await join("p1");
    for (let i = 0; i < 200; i++) {
      const value = api.random(`r${i}`);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      const int = api.randomInt(`r${i}`, -2, 2);
      expect(Number.isInteger(int) && int >= -2 && int <= 2).toBe(true);
    }
    expect(api.randomInt("x", 5, 5)).toBe(5);
    expect([...api.shuffle("x", items)].sort()).toEqual(items);
    const sample = api.sample("x", items, 3);
    expect(new Set(sample).size).toBe(3);
    expect(sample.every((item) => items.includes(item))).toBe(true);
    expect(api.sample("x", items, 0)).toEqual([]);
    expect([...api.sample("x", items, items.length)].sort()).toEqual(items);
    expect(api.shuffle("x", [])).toEqual([]);
  });

  test("randomInt reaches every value in its range", async () => {
    const { api } = await join("p1");
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) seen.add(api.randomInt(`r${i}`, 1, 6));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("shuffle and sample copy the array, and accept frozen arrays", async () => {
    const { api } = await join("p1");
    const frozen = Object.freeze([...items]);
    expect(api.shuffle("x", frozen)).not.toBe(frozen);
    expect(api.sample("x", frozen, 2)).toHaveLength(2);
    expect(frozen).toEqual(items);
  });

  test("bad arguments throw", async () => {
    const { api } = await join("p1");
    expect(() => api.random("")).toThrow("key");
    expect(() => api.random(3 as unknown as string)).toThrow("key");
    expect(() => api.randomInt("x", 1.5, 3)).toThrow("integers");
    expect(() => api.randomInt("x", 3, 1)).toThrow("upper bound");
    expect(() => api.shuffle("x", "abc" as unknown as string[])).toThrow("array");
    expect(() => api.sample("x", items, 9)).toThrow("size");
    expect(() => api.sample("x", items, -1)).toThrow("size");
    expect(() => api.sample("x", items, 1.5)).toThrow("size");
  });

  test("methods throw before connect", () => {
    const api = new MultiplayerAPI();
    expect(() => api.random("x")).toThrow("connect()");
    expect(() => api.randomInt("x", 1, 2)).toThrow("connect()");
    expect(() => api.shuffle("x", items)).toThrow("connect()");
    expect(() => api.sample("x", items, 1)).toThrow("connect()");
  });

  test("values still work after the session closes", async () => {
    const { api } = await join("p1");
    const value = api.random("x");
    await api.disconnect();
    expect(api.random("x")).toBe(value);
  });

  // Every participant must compute identical values, including participants on
  // different versions of jsPsych. If this test fails, the algorithm changed:
  // that is a breaking change, not a snapshot to update.
  test("values match the published algorithm", async () => {
    const { api } = await join("p1", { randomSeed: "golden" });
    expect(api.random("x")).toBe(GOLDEN.random);
    expect(api.randomInt("x", 1, 100)).toBe(GOLDEN.randomInt);
    expect(api.shuffle("x", items)).toEqual(GOLDEN.shuffle);
    expect(api.sample("x", items, 3)).toEqual(GOLDEN.sample);
  });
});

describe("group formation", () => {
  test("without group support, the group is whoever has shown up and can't be sealed", async () => {
    const a = await join("p1");
    await join("p2");
    expect(a.api.group()).toEqual({ size: null, members: ["p1", "p2"], sealed: false });
    await expect(a.api.sealGroup()).rejects.toMatchObject(code("unsupported"));
    await expect(a.api.waitForGroup()).rejects.toMatchObject(code("unsupported"));
  });

  test("group methods throw or reject before connect", async () => {
    const api = new MultiplayerAPI();
    expect(() => api.group()).toThrow("connect()");
    await expect(api.sealGroup()).rejects.toThrow("connect()");
    await expect(api.waitForGroup()).rejects.toThrow("connect()");
  });

  test("the group's size and members come from the adapter", async () => {
    hub.groups = { size: 3, sealed: false };
    const a = await join("p1");
    await join("p2");
    expect(a.api.group()).toEqual({ size: 3, members: ["p1", "p2"], sealed: false });
    expect(Object.isFrozen(a.api.group())).toBe(true);
  });

  test("only members' data shows when the adapter forms groups", async () => {
    hub.groups = { size: 2, sealed: false };
    hub.data = { outsider: wire({ x: 1 }) };
    const a = await join("p1");
    const b = await join("p2");
    await b.api.update({ y: 2 });
    expect(a.api.getAll()).toEqual({ p2: { y: 2 } });
    expect(a.api.presence().outsider).toBeUndefined();
  });

  test("a member who leaves before the seal keeps the data they shared", async () => {
    hub.groups = { size: 3, sealed: false };
    const a = await join("p1");
    const b = await join("p2");
    await b.api.update({ said: "hi" });
    // The backend frees their place
    await b.api.disconnect();
    hub.members.delete("p2");
    hub.broadcast();
    expect(a.api.group().members).toEqual(["p1"]);
    expect(a.api.get("p2")).toEqual({ said: "hi" });
  });

  test("waitForGroup resolves once the backend seals the group", async () => {
    hub.groups = { size: 2, sealed: false };
    const a = await join("p1");
    let group: GroupState | undefined;
    const waiting = a.api.waitForGroup().then((g) => (group = g));
    await join("p2");
    await flushPromises();
    expect(group).toBeUndefined();

    hub.groups.sealed = true;
    hub.broadcast();
    await waiting;
    expect(group).toEqual({ size: 2, members: ["p1", "p2"], sealed: true });
  });

  test("waitForGroup rejects on timeout", async () => {
    jest.useFakeTimers();
    hub.groups = { size: 2, sealed: false };
    const a = await join("p1");
    const waiting = a.api.waitForGroup({ timeout: 1000 });
    jest.advanceTimersByTime(1000);
    await expect(waiting).rejects.toMatchObject(code("timeout"));
  });

  test("subscribers and wait conditions get the group", async () => {
    hub.groups = { size: 2, sealed: false };
    const a = await join("p1");
    const seen: GroupState[] = [];
    a.api.subscribe((_data, _presence, group) => seen.push(group));
    await join("p2");
    expect(seen[seen.length - 1].members).toEqual(["p1", "p2"]);
    await a.api.wait((_data, _presence, group) => group.members.length === 2);
  });

  test("sealGroup seals the group and everyone sees it", async () => {
    hub.groups = { size: 3, sealed: false };
    const a = await join("p1");
    const b = await join("p2");
    const waiting = b.api.waitForGroup();

    await a.api.sealGroup();
    expect(a.api.group().sealed).toBe(true);
    await expect(waiting).resolves.toEqual({ size: 3, members: ["p1", "p2"], sealed: true });
  });

  test("sealGroup asks the backend once and resolves at once when already sealed", async () => {
    hub.groups = { size: 3, sealed: false };
    const a = await join("p1");
    await Promise.all([a.api.sealGroup(), a.api.sealGroup()]);
    expect(hub.sealCalls).toBe(1);
    await a.api.sealGroup();
    expect(hub.sealCalls).toBe(1);
  });

  test("peers can't seal the group through their data", async () => {
    hub.groups = { size: 3, sealed: false };
    const a = await join("p1");
    await join("p2");
    // What an earlier version relayed, or a malicious client might write
    hub.data = {
      ...hub.data,
      p2: {
        ...(hub.data.p2 as WireSlot),
        $mp: { v: 1, instance: "x", epoch: 5, sealed: ["p2", "fake"] },
      },
    };
    hub.broadcast();
    expect(a.api.group()).toEqual({ size: 3, members: ["p1", "p2"], sealed: false });
  });

  test("the roster is fixed once sealed", async () => {
    hub.groups = { size: 2, sealed: true };
    const a = await join("p1");
    const b = await join("p2");
    expect(a.api.group().members).toEqual(["p1", "p2"]);

    // A member who drops out stays on the roster, and the group stays sealed, even if the
    // backend stops saying so
    await b.api.disconnect();
    hub.members.delete("p2");
    hub.groups.sealed = false;
    hub.broadcast();
    expect(a.api.group()).toEqual({ size: 2, members: ["p1", "p2"], sealed: true });
  });

  test("a roster member who never shows up becomes away, then left", async () => {
    jest.useFakeTimers();
    const left = jest.fn();
    hub.groups = { size: 2, sealed: true };
    // The backend assigned p2 a place, but p2 never connected
    hub.members.add("p2");
    const a = await join("p1", { dropoutTimeout: 5000, onParticipantLeft: left });
    expect(a.api.group().members).toEqual(["p1", "p2"]);
    expect(a.api.presence().p2).toBe("away");
    jest.advanceTimersByTime(5000);
    expect(a.api.presence().p2).toBe("left");
    expect(left).toHaveBeenCalledWith("p2");
  });

  test("a malformed group() report is ignored", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    hub.groups = { size: 2, sealed: false };
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter(hub, "p1");
    await api.connect(adapter);
    adapter.connection.group = () => null as unknown as GroupState;
    hub.broadcast();
    expect(api.group().sealed).toBe(false);
    expect(error).toHaveBeenCalled();
  });
});

describe("scopes", () => {
  test("a trial's writes and reads use its own scope", async () => {
    const a = await join("p1");
    const b = await join("p2");
    await a.api.update({ name: "Sam" });

    a.api[timelineHooks].trialStarted("round-1");
    b.api[timelineHooks].trialStarted("round-1");
    await a.api.update({ choice: "left" });
    expect(b.api.getAll()).toEqual({ p1: { choice: "left" } });
    // The session scope is still there when asked for
    expect(b.api.get("p1", { scope: "session" })).toEqual({ name: "Sam" });
    expect((hub.data.p1 as WireSlot).scopes).toEqual({ "round-1": { choice: "left" } });

    // The next trial starts empty, so an old answer can't satisfy a new wait
    a.api[timelineHooks].trialFinished();
    b.api[timelineHooks].trialFinished();
    b.api[timelineHooks].trialStarted("round-2");
    expect(b.api.getAll()).toEqual({});
    expect(b.api.getAll({ scope: "session" })).toEqual({ p1: { name: "Sam" } });
  });

  test("participants in different trials each read their own trial's scope", async () => {
    const a = await join("p1");
    const b = await join("p2");
    a.api[timelineHooks].trialStarted("round-1");
    await a.api.update({ choice: "left" });
    a.api[timelineHooks].trialFinished();
    a.api[timelineHooks].trialStarted("round-2");
    await a.api.update({ choice: "right" });

    // p2 is still in round 1 and sees p1's round-1 answer
    b.api[timelineHooks].trialStarted("round-1");
    expect(b.api.get("p1")).toEqual({ choice: "left" });
  });

  test("outside a trial, calls use the session scope", async () => {
    const { api } = await join("p1");
    await api.update({ a: 1 });
    expect(api.getAll({ scope: "session" })).toEqual({ p1: { a: 1 } });
    expect(() => api.getAll({ scope: "trial" })).toThrow("during a trial");
    expect(() => api.getAll({ scope: "round" as any })).toThrow('"trial" or "session"');
  });

  test("subscriptions and waits made during a trial end with it", async () => {
    const a = await join("p1");
    const b = await join("p2");
    a.api[timelineHooks].trialStarted("t");
    b.api[timelineHooks].trialStarted("t");
    const seen: unknown[] = [];
    a.api.subscribe((data) => seen.push(data.p2?.n));
    const waiting = a.api.wait(() => false);

    a.api[timelineHooks].trialEnded();
    await expect(waiting).rejects.toMatchObject(code("cancelled"));
    await b.api.update({ n: 1 });
    expect(seen).toEqual([undefined]);
  });

  test("a session-scope subscription made during a trial outlives it", async () => {
    const a = await join("p1");
    const b = await join("p2");
    a.api[timelineHooks].trialStarted("t");
    const seen: unknown[] = [];
    a.api.subscribe((data) => seen.push(data.p2?.name), { scope: "session" });
    a.api[timelineHooks].trialEnded();
    a.api[timelineHooks].trialFinished();

    await b.api.update({ name: "Alex" });
    expect(seen).toEqual([undefined, "Alex"]);
    a.api[timelineHooks].experimentEnded();
    await b.api.update({ name: "Sam" });
    expect(seen).toEqual([undefined, "Alex"]);
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

    await expect(waiting).rejects.toMatchObject(code("cancelled"));
    const count = received.length;
    await other.api.update({ late: true });
    expect(received).toHaveLength(count);
  });

  test("subscriptions end before on_finish, which can still write", async () => {
    const jsPsych = initJsPsych({
      on_finish: async () => {
        const count = received.length;
        await other.api.update({ late: true });
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
    expect(stored("p1")).toEqual({ done: true });
  });

  test("each trial gets a scope named by its position in the timeline", async () => {
    const jsPsych = initJsPsych();
    await jsPsych.multiplayer.connect(new MockAdapter(hub, "p1"));
    const write = (value: string) => () => void jsPsych.multiplayer.update({ value });

    const { expectFinished } = await startTimeline(
      [
        { type: htmlKeyboardResponse, stimulus: "a", on_start: write("a") },
        {
          timeline: [{ type: htmlKeyboardResponse, stimulus: "b", on_start: write("b") }],
          repetitions: 2,
        },
        {
          timeline: [{ type: htmlKeyboardResponse, stimulus: "skipped" }],
          conditional_function: () => false,
        },
        {
          type: htmlKeyboardResponse,
          stimulus: "c",
          multiplayer_scope: "named",
          on_start: write("c"),
        },
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "d",
              multiplayer_scope: jsPsych.timelineVariable("round"),
              on_start: write("d"),
            },
          ],
          timeline_variables: [{ round: 7 }],
        },
      ],
      jsPsych
    );
    for (let i = 0; i < 5; i++) await pressKey("a");
    await expectFinished();
    await jsPsych.multiplayer.update({ done: true });

    expect((hub.data.p1 as WireSlot).scopes).toEqual({
      "#0": { value: "a" },
      "#1.0": { value: "b" },
      "#1.1": { value: "b" },
      named: { value: "c" },
      "7": { value: "d" },
    });
    expect(stored("p1")).toEqual({ done: true });
  });

  test("the IDs are recorded in every row of data", async () => {
    const jsPsych = initJsPsych();
    await jsPsych.multiplayer.connect(new MockAdapter(hub, "p1"));
    const { expectFinished, getData } = await startTimeline(
      [{ type: htmlKeyboardResponse, stimulus: "a" }],
      jsPsych
    );
    await pressKey("a");
    await expectFinished();
    expect(getData().values()[0]).toMatchObject({
      multiplayer_participant_id: "p1",
      multiplayer_session_id: "session-1",
    });
  });
});
