import {
  GroupSessionData,
  MultiplayerAdapter,
  Unsubscribe,
} from "../../src/modules/plugin-api/MultiplayerAPI";
import { MultiplayerAPI } from "../../src/modules/plugin-api/MultiplayerAPI";

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
    MockAdapter.channel = MockAdapter.channel.filter((adapter) => adapter !== this);
    return Promise.resolve();
  }
}

beforeEach(() => {
  MockAdapter.channel = [];
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

  test("communicate: push then wait in one call", async () => {
    const api1 = new MultiplayerAPI();
    const api2 = new MultiplayerAPI();
    await api1.connect(new MockAdapter("p1"));
    await api2.connect(new MockAdapter("p2"));

    // Both participants communicate simultaneously
    const [result1, result2] = await Promise.all([
      api1.communicate({ answer: 1 }, (data) => "p1" in data && "p2" in data),
      api2.communicate({ answer: 2 }, (data) => "p1" in data && "p2" in data),
    ]);

    expect(result1["p1"]).toEqual({ answer: 1 });
    expect(result1["p2"]).toEqual({ answer: 2 });
    expect(result2).toEqual(result1);

    await api1.disconnect();
    await api2.disconnect();
  });

  test("cancelAllSubscriptions cleans up listeners", async () => {
    const api = new MultiplayerAPI();
    const adapter = new MockAdapter("p1");
    await api.connect(adapter);

    const received: GroupSessionData[] = [];
    api.subscribe((data) => received.push(data));
    api.cancelAllSubscriptions();

    // After cancellation, pushing should not trigger the subscriber
    await api.push({ value: 99 });
    expect(received).toHaveLength(0);

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
    jest.useRealTimers();
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

    await api2.push({ step: 1 });
    await api2.push({ step: 2 });

    expect(updates).toHaveLength(2);
    expect(updates[0]["p2"]).toEqual({ step: 1 });
    expect(updates[1]["p2"]).toEqual({ step: 2 });

    await api1.disconnect();
    await api2.disconnect();
  });

  test("disconnect clears participantId and adapter", async () => {
    const api = new MultiplayerAPI();
    await api.connect(new MockAdapter("p1"));
    await api.disconnect();

    expect(api.participantId).toBeNull();
    expect(() => api.push({ x: 1 })).toThrow("connect() must be called");
  });

  test("calling methods before connect throws", async () => {
    const api = new MultiplayerAPI();

    expect(() => api.push({ x: 1 })).toThrow("connect() must be called");
    expect(() => api.getAll()).toThrow("connect() must be called");
    expect(() => api.get("p1")).toThrow("connect() must be called");
    expect(() => api.subscribe(() => {})).toThrow("connect() must be called");
    expect(() => api.wait(() => true)).toThrow("connect() must be called");
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
    expect(() => api.push({ x: 1 })).toThrow("connect() must be called");

    // A retry with a working adapter must succeed (not throw "already been called")
    await api.connect(new MockAdapter("p2"));
    expect(api.participantId).toBe("p2");

    await api.disconnect();
  });
});
