import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";
import { GroupSessionData, MultiplayerAdapter, Unsubscribe } from "../../src/modules/multiplayer";
import { MultiplayerAPI } from "../../src/modules/multiplayer";

/** In-memory adapter that simulates two participants sharing a group session. */
class MockAdapter implements MultiplayerAdapter {
  readonly participantId: string;
  private store: GroupSessionData = {};
  private subscribers = new Set<(data: GroupSessionData) => void>();

  /** All MockAdapter instances that have called connect() — simulates the shared channel. */
  static channel: MockAdapter[] = [];

  constructor(participantId: string) {
    this.participantId = participantId;
  }

  connect(): Promise<void> {
    MockAdapter.channel.push(this);
    return Promise.resolve();
  }

  push(data: Record<string, unknown>): Promise<void> {
    // Write to every connected adapter's store and notify their subscribers
    for (const peer of MockAdapter.channel) {
      peer.store = { ...peer.store, [this.participantId]: data };
      // Iterate over a copy, as real adapters (e.g. Firebase) do
      for (const cb of [...peer.subscribers]) {
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
    MockAdapter.channel = MockAdapter.channel.filter((adapter) => adapter !== this);
    return Promise.resolve();
  }
}

beforeEach(() => {
  MockAdapter.channel = [];
});

// Restore in afterEach so a failing assertion can't leak fake timers or mocks into later tests
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("MultiplayerAPI mock run", () => {
  test("connect sets participantId", async () => {
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));
    expect(api.participantId).toBe("p1");
    await api.disconnect();
  });

  test("push and get round-trip", async () => {
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));
    await api.push({ score: 42 });
    expect(api.get("p1")).toEqual({ score: 42 });
    await api.disconnect();
  });

  test("two participants see each other's data", async () => {
    const api1 = new MultiplayerAPI();
    const api2 = new MultiplayerAPI();
    await api1.connect(new MockAdapter("p1"));
    await api2.connect(new MockAdapter("p2"));

    await api1.push({ choice: "left" });
    await api2.push({ choice: "right" });

    expect(api1.get("p2")).toEqual({ choice: "right" });
    expect(api2.get("p1")).toEqual({ choice: "left" });

    await api1.disconnect();
    await api2.disconnect();
  });

  test("wait resolves once condition is met", async () => {
    const api1 = new MultiplayerAPI();
    const api2 = new MultiplayerAPI();
    await api1.connect(new MockAdapter("p1"));
    await api2.connect(new MockAdapter("p2"));

    // api1 waits for p2 to push before resolving
    const waitPromise = api1.wait((data) => "p2" in data);

    await api2.push({ ready: true });

    const result = await waitPromise;
    expect(result["p2"]).toEqual({ ready: true });

    await api1.disconnect();
    await api2.disconnect();
  });

  test("cancelAllSubscriptions cleans up listeners", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter("p1");
    await api.connect(adapter);

    const received: GroupSessionData[] = [];
    api.subscribe((data) => received.push(data));
    // subscribe() replays current state once immediately
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({});

    api.cancelAllSubscriptions();

    // After cancellation, pushing should not trigger the subscriber
    await api.push({ value: 99 });
    expect(received).toHaveLength(1);

    await api.disconnect();
  });

  test("wait rejects when the condition throws on first evaluation", async () => {
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));

    const predicateError = new Error("boom");
    await expect(
      api.wait(() => {
        throw predicateError;
      })
    ).rejects.toBe(predicateError);

    await api.disconnect();
  });

  test("wait rejects (not hangs) when the condition throws on a later update", async () => {
    const api1 = new MultiplayerAPI();
    const api2 = new MultiplayerAPI();
    await api1.connect(new MockAdapter("p1"));
    await api2.connect(new MockAdapter("p2"));

    // Passes the initial replay (empty session), throws once p2's data arrives —
    // the classic buggy-predicate case (reading a key of a missing participant).
    const waitPromise = api1.wait((data) => {
      if ("p2" in data) {
        throw new Error("predicate bug");
      }
      return false;
    });

    await api2.push({ ready: true });

    await expect(waitPromise).rejects.toThrow("predicate bug");

    await api1.disconnect();
    await api2.disconnect();
  });

  test("wait timeout rejection is a MultiplayerTimeoutError", async () => {
    jest.useFakeTimers();
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));

    const waitPromise = api.wait(() => false, 100);
    waitPromise.catch(() => {});
    jest.advanceTimersByTime(101);

    await expect(waitPromise).rejects.toMatchObject({ name: "MultiplayerTimeoutError" });

    await api.disconnect();
  });

  test("wait rejects on timeout", async () => {
    jest.useFakeTimers();
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));

    const waitPromise = api.wait(() => false, 1000);
    jest.advanceTimersByTime(1001);

    await expect(waitPromise).rejects.toThrow("timed out after 1000ms");

    await api.disconnect();
  });

  test("update merges into own slot without clobbering existing keys", async () => {
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));

    await api.push({ score: 1, round: 1 });
    await api.update({ round: 2 });

    expect(api.get("p1")).toEqual({ score: 1, round: 2 });

    await api.disconnect();
  });

  test("update against an empty slot behaves like push", async () => {
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));

    await api.update({ ready: true });
    expect(api.get("p1")).toEqual({ ready: true });

    await api.disconnect();
  });

  test("update before connect rejects", async () => {
    const api = new MultiplayerAPI();
    await expect(api.update({ x: 1 })).rejects.toThrow("connect() must be called");
  });

  test("update merges into the caller's own slot, not another participant's", async () => {
    const api1 = new MultiplayerAPI();
    const api2 = new MultiplayerAPI();
    await api1.connect(new MockAdapter("p1"));
    await api2.connect(new MockAdapter("p2"));

    await api1.push({ score: 1 });
    await api2.push({ score: 100 });

    await api1.update({ round: 2 });

    expect(api1.get("p1")).toEqual({ score: 1, round: 2 });
    expect(api1.get("p2")).toEqual({ score: 100 });

    await api1.disconnect();
    await api2.disconnect();
  });

  test("a throwing subscriber does not prevent other subscribers from being notified", async () => {
    const api1 = new MultiplayerAPI();
    const api2 = new MultiplayerAPI();
    await api1.connect(new MockAdapter("p1"));
    await api2.connect(new MockAdapter("p2"));

    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    const goodUpdates: GroupSessionData[] = [];
    api1.subscribe(() => {
      throw new Error("boom");
    });
    api1.subscribe((data) => goodUpdates.push(data));

    await api2.push({ ready: true });

    // Both subscribers replay immediately on registration, plus one push.
    expect(goodUpdates).toHaveLength(2);
    expect(goodUpdates[1]["p2"]).toEqual({ ready: true });
    expect(consoleError).toHaveBeenCalled();

    await api1.disconnect();
    await api2.disconnect();
  });

  test("getAll returns all participants' data", async () => {
    const api1 = new MultiplayerAPI();
    const api2 = new MultiplayerAPI();
    await api1.connect(new MockAdapter("p1"));
    await api2.connect(new MockAdapter("p2"));

    await api1.push({ x: 1 });
    await api2.push({ x: 2 });

    const all = api1.getAll();
    expect(all).toEqual({ p1: { x: 1 }, p2: { x: 2 } });

    await api1.disconnect();
    await api2.disconnect();
  });

  test("wait resolves immediately when condition is already met", async () => {
    const api1 = new MultiplayerAPI();
    const api2 = new MultiplayerAPI();
    await api1.connect(new MockAdapter("p1"));
    await api2.connect(new MockAdapter("p2"));

    await api2.push({ ready: true });

    // Condition is already true — should resolve without waiting for a new push
    const result = await api1.wait((data) => "p2" in data);
    expect(result["p2"]).toEqual({ ready: true });

    await api1.disconnect();
    await api2.disconnect();
  });

  test("subscribe fires on every push", async () => {
    const api1 = new MultiplayerAPI();
    const api2 = new MultiplayerAPI();
    await api1.connect(new MockAdapter("p1"));
    await api2.connect(new MockAdapter("p2"));

    const updates: GroupSessionData[] = [];
    api1.subscribe((data) => updates.push(data));
    // subscribe() replays current state immediately (no pushes yet)
    expect(updates).toHaveLength(1);
    expect(updates[0]).toEqual({});

    await api2.push({ step: 1 });
    await api2.push({ step: 2 });

    expect(updates).toHaveLength(3);
    expect(updates[1]["p2"]).toEqual({ step: 1 });
    expect(updates[2]["p2"]).toEqual({ step: 2 });

    await api1.disconnect();
    await api2.disconnect();
  });

  test("disconnect clears participantId and adapter", async () => {
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));
    await api.disconnect();

    expect(api.participantId).toBeNull();
    await expect(api.push({ x: 1 })).rejects.toThrow("connect() must be called");
  });

  test("calling methods before connect throws or rejects", async () => {
    const api = new MultiplayerAPI();

    await expect(api.push({ x: 1 })).rejects.toThrow("connect() must be called");
    expect(() => api.getAll()).toThrow("connect() must be called");
    expect(() => api.get("p1")).toThrow("connect() must be called");
    expect(() => api.subscribe(() => {})).toThrow("connect() must be called");
    await expect(api.wait(() => true)).rejects.toThrow("connect() must be called");
    await expect(api.update({ x: 1 })).rejects.toThrow("connect() must be called");
  });

  test("calling connect() twice throws", async () => {
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));

    await expect(api.connect(new MockAdapter("p2"))).rejects.toThrow(
      "connect() has already been called"
    );

    await api.disconnect();
  });

  test("a failed connect() rolls back and allows a retry", async () => {
    const api = new MultiplayerAPI();

    // Adapter whose connect() rejects, simulating a failed network join
    const failing = new MockAdapter("p1");
    failing.connect = () => Promise.reject(new Error("join failed"));

    await expect(api.connect(failing)).rejects.toThrow("join failed");

    // State must be rolled back: not half-connected
    expect(api.participantId).toBeNull();
    await expect(api.push({ x: 1 })).rejects.toThrow("connect() must be called");

    // A retry with a working adapter must succeed (not throw "already been called")
    await api.connect(new MockAdapter("p2"));
    expect(api.participantId).toBe("p2");

    await api.disconnect();
  });
});

/** Returns a promise plus its resolve/reject functions. */
function deferred() {
  let resolve: () => void;
  let reject: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("MultiplayerAPI lifecycle edge cases", () => {
  test("cancelAllSubscriptions rejects a pending wait with MultiplayerCancelledError", async () => {
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));

    const waitPromise = api.wait(() => false);
    api.cancelAllSubscriptions();

    await expect(waitPromise).rejects.toMatchObject({ name: "MultiplayerCancelledError" });
    await api.disconnect();
  });

  test("disconnect rejects a pending wait and its timeout never fires", async () => {
    jest.useFakeTimers();
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));

    const waitPromise = api.wait(() => false, 1000);
    waitPromise.catch(() => {});
    await api.disconnect();
    jest.advanceTimersByTime(2000);

    await expect(waitPromise).rejects.toMatchObject({ name: "MultiplayerCancelledError" });
    expect(jest.getTimerCount()).toBe(0);
  });

  test.each([null, Infinity, NaN, 2 ** 31])(
    "wait with timeout %p does not time out",
    async (timeout) => {
      jest.useFakeTimers();
      const api1 = new MultiplayerAPI();
      const api2 = new MultiplayerAPI();
      await api1.connect(new MockAdapter("p1"));
      await api2.connect(new MockAdapter("p2"));

      let rejected = false;
      const waitPromise = api1.wait((data) => "p2" in data, timeout);
      waitPromise.catch(() => {
        rejected = true;
      });
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
      expect(rejected).toBe(false);

      await api2.push({ ready: true });
      await expect(waitPromise).resolves.toHaveProperty("p2");

      await api1.disconnect();
      await api2.disconnect();
    }
  );

  test("a rejecting adapter disconnect still leaves the API disconnected", async () => {
    const api = new MultiplayerAPI();
    const failing = new MockAdapter("p1");
    failing.disconnect = () => Promise.reject(new Error("leave failed"));
    await api.connect(failing);

    await expect(api.disconnect()).rejects.toThrow("leave failed");

    expect(api.participantId).toBeNull();
    await expect(api.push({ x: 1 })).rejects.toThrow("connect() must be called");
    await api.connect(new MockAdapter("p2"));
    expect(api.participantId).toBe("p2");
    await api.disconnect();
  });

  test("overlapping disconnect calls only disconnect the adapter once", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter("p1");
    const spy = jest.spyOn(adapter, "disconnect");
    await api.connect(adapter);

    await Promise.all([api.disconnect(), api.disconnect()]);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("methods throw or reject while connect() is still pending", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter("p1");
    const joined = deferred();
    adapter.connect = () => joined.promise;

    const connectPromise = api.connect(adapter);

    expect(api.participantId).toBeNull();
    await expect(api.push({ x: 1 })).rejects.toThrow("connect() must be called");
    expect(() => api.subscribe(() => {})).toThrow("connect() must be called");
    await expect(api.connect(new MockAdapter("p2"))).rejects.toThrow(
      "connect() has already been called"
    );

    joined.resolve();
    await connectPromise;
    expect(api.participantId).toBe("p1");
    await api.disconnect();
  });

  test("disconnect during a pending connect abandons that connection", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter("p1");
    const joined = deferred();
    adapter.connect = () => joined.promise;
    const disconnectSpy = jest.spyOn(adapter, "disconnect");

    const connectPromise = api.connect(adapter);
    await api.disconnect();
    joined.resolve();

    await expect(connectPromise).rejects.toThrow("disconnect() was called");
    expect(api.participantId).toBeNull();
    await expect(api.push({ x: 1 })).rejects.toThrow("connect() must be called");
    expect(disconnectSpy).toHaveBeenCalled();
  });

  test("an abandoned connect that later fails does not tear down a newer connection", async () => {
    const api = new MultiplayerAPI();
    const first = new MockAdapter("p1");
    const joined = deferred();
    first.connect = () => joined.promise;

    const firstConnect = api.connect(first);
    firstConnect.catch(() => {});
    await api.disconnect();
    await api.connect(new MockAdapter("p2"));

    joined.reject(new Error("join failed"));
    await expect(firstConnect).rejects.toThrow();

    expect(api.participantId).toBe("p2");
    await expect(api.push({ x: 1 })).resolves.toBeUndefined();
    await api.disconnect();
  });

  test("a subscriber cancelled during a notification does not receive that update", async () => {
    const api1 = new MultiplayerAPI();
    const api2 = new MultiplayerAPI();
    await api1.connect(new MockAdapter("p1"));
    await api2.connect(new MockAdapter("p2"));

    const lateUpdates: GroupSessionData[] = [];
    api1.subscribe((data) => {
      if ("p2" in data) api1.cancelAllSubscriptions();
    });
    api1.subscribe((data) => lateUpdates.push(data));

    await api2.push({ done: true });

    // Only the replay on registration, not the update that triggered cancellation
    expect(lateUpdates).toHaveLength(1);

    await api1.disconnect();
    await api2.disconnect();
  });

  test("abortExperiment cancels subscriptions and pending waits", async () => {
    const jsPsych = initJsPsych();
    const other = new MultiplayerAPI();
    await jsPsych.multiplayer.connect(new MockAdapter("p1"));
    await other.connect(new MockAdapter("p2"));

    const received: GroupSessionData[] = [];
    jsPsych.multiplayer.subscribe((data) => received.push(data));
    const waitPromise = jsPsych.multiplayer.wait(() => false);
    waitPromise.catch(() => {});

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

    await expect(waitPromise).rejects.toMatchObject({ name: "MultiplayerCancelledError" });
    await other.push({ late: true });
    expect(received).toHaveLength(1);

    await jsPsych.multiplayer.disconnect();
    await other.disconnect();
  });

  test("subscriptions are cancelled when the experiment finishes", async () => {
    const jsPsych = initJsPsych();
    const other = new MultiplayerAPI();
    await jsPsych.multiplayer.connect(new MockAdapter("p1"));
    await other.connect(new MockAdapter("p2"));

    const received: GroupSessionData[] = [];
    jsPsych.multiplayer.subscribe((data) => received.push(data));

    const { expectFinished } = await startTimeline(
      [{ type: htmlKeyboardResponse, stimulus: "trial 1" }],
      jsPsych
    );
    await pressKey("a");
    await expectFinished();

    await other.push({ late: true });
    expect(received).toHaveLength(1);

    await jsPsych.multiplayer.disconnect();
    await other.disconnect();
  });
});

/**
 * Adapter that keeps one store object and updates it in place, and whose push()
 * resolves on "server acknowledgement" before the local store reflects the write.
 * Call deliver() to simulate the broadcast arriving.
 */
class InPlaceAdapter implements MultiplayerAdapter {
  readonly participantId: string;
  store: GroupSessionData = {};
  pushes: Record<string, unknown>[] = [];
  private pending: Array<[string, Record<string, unknown>]> = [];
  private subscribers = new Set<(data: GroupSessionData) => void>();

  constructor(participantId: string, private echoImmediately = true) {
    this.participantId = participantId;
  }

  connect() {
    return Promise.resolve();
  }

  async push(data: Record<string, unknown>) {
    await Promise.resolve();
    this.pushes.push(data);
    this.pending.push([this.participantId, data]);
    if (this.echoImmediately) this.deliver();
  }

  /** Simulate a write (own echo or another participant's) reaching the local store. */
  receive(participantId: string, data: Record<string, unknown>) {
    this.pending.push([participantId, data]);
    this.deliver();
  }

  deliver() {
    for (const [participantId, data] of this.pending.splice(0)) {
      this.store[participantId] = data;
    }
    for (const cb of [...this.subscribers]) cb(this.store);
  }

  getAll() {
    return this.store;
  }

  get(participantId: string) {
    return this.store[participantId];
  }

  subscribe(callback: (data: GroupSessionData) => void): Unsubscribe {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  disconnect() {
    this.subscribers.clear();
    return Promise.resolve();
  }
}

describe("MultiplayerAPI contract", () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  test("promise-returning methods reject rather than throw, so .catch() handles the error", async () => {
    const api = new MultiplayerAPI();
    const handled: string[] = [];

    // None of these calls may throw synchronously
    const calls = [
      api.push({ x: 1 }).catch(() => handled.push("push")),
      api.update({ x: 1 }).catch(() => handled.push("update")),
      api.wait(() => true).catch(() => handled.push("wait")),
    ];
    await Promise.all(calls);

    expect(handled.sort()).toEqual(["push", "update", "wait"]);
  });

  test("subscribe does not leak a registration when the adapter's getAll() throws", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1");
    await api.connect(adapter);

    const getAll = adapter.getAll;
    adapter.getAll = () => {
      throw new Error("not ready");
    };
    const callback = jest.fn();
    expect(() => api.subscribe(callback)).toThrow("not ready");
    const condition = jest.fn(() => false);
    await expect(api.wait(condition)).rejects.toThrow("not ready");
    adapter.getAll = getAll;

    adapter.receive("p2", { ready: true });

    expect(callback).not.toHaveBeenCalled();
    expect(condition).not.toHaveBeenCalled();
    await api.disconnect();
  });

  test("wait resolves with a snapshot that later updates do not change", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1");
    await api.connect(adapter);

    const waitPromise = api.wait((data) => "p2" in data);
    adapter.receive("p2", { round: 1 });
    const snapshot = await waitPromise;
    adapter.receive("p2", { round: 2 });

    expect(snapshot).toEqual({ p2: { round: 1 } });
    await api.disconnect();
  });

  test("a subscriber mutating its data does not corrupt the adapter's state or other subscribers", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1");
    await api.connect(adapter);
    await api.push({ score: 1 });

    api.subscribe((data) => {
      delete data["p1"];
    });
    const seen: GroupSessionData[] = [];
    api.subscribe((data) => seen.push(data));

    expect(api.get("p1")).toEqual({ score: 1 });
    expect(seen[0]).toEqual({ p1: { score: 1 } });
    await api.disconnect();
  });

  test("getAll and get return copies", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1");
    await api.connect(adapter);
    await api.push({ score: 1, items: ["a"] });

    const all = api.getAll();
    delete all["p1"];
    const own = api.get("p1");
    (own.items as string[]).push("b");

    expect(adapter.store).toEqual({ p1: { score: 1, items: ["a"] } });
    await api.disconnect();
  });

  test("sequential updates keep earlier keys when the adapter echoes writes late", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1", false);
    await api.connect(adapter);

    await api.update({ choice: "left" });
    await api.update({ rt: 512 });
    adapter.deliver();

    expect(adapter.pushes.at(-1)).toEqual({ choice: "left", rt: 512 });
    await api.disconnect();
  });

  test("overlapping updates are applied in order without losing keys", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1");
    await api.connect(adapter);

    await Promise.all([api.update({ a: 1 }), api.update({ b: 2 })]);

    expect(api.get("p1")).toEqual({ a: 1, b: 2 });
    await api.disconnect();
  });

  test("update merges onto existing slot data before this client's first push", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1");
    adapter.store = { p1: { score: 5 } };
    await api.connect(adapter);

    await api.update({ round: 2 });

    expect(api.get("p1")).toEqual({ score: 5, round: 2 });
    await api.disconnect();
  });

  test("a failed update does not block later updates", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1");
    await api.connect(adapter);

    const push = adapter.push.bind(adapter);
    adapter.push = () => Promise.reject(new Error("write failed"));
    await expect(api.update({ a: 1 })).rejects.toThrow("write failed");
    adapter.push = push;

    await api.update({ b: 2 });
    expect(api.get("p1")).toEqual({ b: 2 });
    await api.disconnect();
  });

  /** Makes the adapter's first-issued unsubscribe handle throw without removing the listener. */
  function breakFirstUnsubscribe(adapter: MultiplayerAdapter) {
    const subscribe = adapter.subscribe.bind(adapter);
    let first = true;
    adapter.subscribe = (callback) => {
      const unsubscribe = subscribe(callback);
      if (first) {
        first = false;
        return () => {
          throw new Error("listener already gone");
        };
      }
      return unsubscribe;
    };
  }

  test("cancelAllSubscriptions continues past a throwing adapter unsubscribe", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1");
    breakFirstUnsubscribe(adapter);
    await api.connect(adapter);

    const first = jest.fn();
    const second = jest.fn();
    api.subscribe(first);
    api.subscribe(second);

    expect(() => api.cancelAllSubscriptions()).not.toThrow();
    adapter.receive("p2", { late: true });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalled();
    await api.disconnect();
  });

  test("disconnect still closes the adapter when an unsubscribe throws", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1");
    breakFirstUnsubscribe(adapter);
    const disconnectSpy = jest.spyOn(adapter, "disconnect");
    await api.connect(adapter);
    api.subscribe(() => {});

    await api.disconnect();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  test("wait still settles when its adapter unsubscribe throws", async () => {
    const api = new MultiplayerAPI();
    const adapter = new InPlaceAdapter("p1");
    breakFirstUnsubscribe(adapter);
    await api.connect(adapter);

    const waitPromise = api.wait((data) => "p2" in data);
    adapter.receive("p2", { ready: true });

    await expect(waitPromise).resolves.toHaveProperty("p2");
    await api.disconnect();
  });
});

/** Adapter whose push() resolves only when the test releases it. */
class GatedAdapter implements MultiplayerAdapter {
  readonly participantId = "p1";
  store: GroupSessionData = {};
  pushes: Record<string, unknown>[] = [];
  private gates: Array<(error?: Error) => void> = [];

  connect() {
    return Promise.resolve();
  }

  push(data: Record<string, unknown>): Promise<void> {
    this.pushes.push(data);
    return new Promise<void>((resolve, reject) => {
      this.gates.push((error) => {
        if (error) {
          reject(error);
        } else {
          this.store[this.participantId] = data;
          resolve();
        }
      });
    });
  }

  /** Settle the oldest in-flight push. */
  releaseNextPush(error?: Error) {
    const gate = this.gates.shift();
    if (!gate) throw new Error("no push in flight");
    gate(error);
  }

  getAll() {
    return this.store;
  }

  get(participantId: string) {
    return this.store[participantId];
  }

  subscribe(): Unsubscribe {
    return () => {};
  }

  disconnect() {
    return Promise.resolve();
  }
}

describe("MultiplayerAPI update coalescing", () => {
  test("updates made while a push is in flight are merged into one push", async () => {
    const api = new MultiplayerAPI();
    const adapter = new GatedAdapter();
    await api.connect(adapter);

    const first = api.update({ a: 1 });
    await Promise.resolve();
    expect(adapter.pushes).toHaveLength(1);

    const second = api.update({ b: 2 });
    const third = api.update({ c: 3 });
    adapter.releaseNextPush();
    await first;
    await Promise.resolve();

    // One merged push for the two queued updates, not one each
    expect(adapter.pushes).toHaveLength(2);
    adapter.releaseNextPush();
    await Promise.all([second, third]);

    expect(adapter.pushes[1]).toEqual({ a: 1, b: 2, c: 3 });
    expect(api.get("p1")).toEqual({ a: 1, b: 2, c: 3 });
    await api.disconnect();
  });

  test("a burst of updates during a slow push does not queue up behind each other", async () => {
    const api = new MultiplayerAPI();
    const adapter = new GatedAdapter();
    await api.connect(adapter);

    const first = api.update({ tick: 0 });
    await Promise.resolve();

    const burst = [1, 2, 3, 4, 5].map((tick) => api.update({ tick, [`k${tick}`]: true }));
    adapter.releaseNextPush();
    await first;
    await Promise.resolve();
    adapter.releaseNextPush();
    await Promise.all(burst);

    expect(adapter.pushes).toHaveLength(2);
    // The last write wins for a repeated key; every key still arrives
    expect(adapter.pushes[1]).toMatchObject({ tick: 5, k1: true, k5: true });
    await api.disconnect();
  });

  test("every caller in a merged batch sees the same failure", async () => {
    const api = new MultiplayerAPI();
    const adapter = new GatedAdapter();
    await api.connect(adapter);

    const first = api.update({ a: 1 });
    await Promise.resolve();
    const second = api.update({ b: 2 });
    const third = api.update({ c: 3 });
    second.catch(() => {});
    third.catch(() => {});

    adapter.releaseNextPush();
    await first;
    await Promise.resolve();
    adapter.releaseNextPush(new Error("write failed"));

    await expect(second).rejects.toThrow("write failed");
    await expect(third).rejects.toThrow("write failed");

    // A failed batch must not block later updates
    const fourth = api.update({ d: 4 });
    await Promise.resolve();
    adapter.releaseNextPush();
    await fourth;
    expect(adapter.pushes.at(-1)).toMatchObject({ a: 1, d: 4 });
    await api.disconnect();
  });

  test("disconnecting while an update is pending rejects it", async () => {
    const api = new MultiplayerAPI();
    const adapter = new GatedAdapter();
    await api.connect(adapter);

    const first = api.update({ a: 1 });
    await Promise.resolve();
    const pending = api.update({ b: 2 });
    pending.catch(() => {});

    adapter.releaseNextPush();
    await first;
    await api.disconnect();

    await expect(pending).rejects.toThrow("MultiplayerAPI");

    // Reconnecting must not be stuck behind the abandoned push
    const next = new GatedAdapter();
    await api.connect(next);
    const after = api.update({ c: 3 });
    next.releaseNextPush();
    await after;
    expect(next.pushes).toEqual([{ c: 3 }]);
    await api.disconnect();
  });
});
