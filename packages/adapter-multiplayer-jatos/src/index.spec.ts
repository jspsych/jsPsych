import type { GroupSessionData } from "jspsych";

import JatosAdapter from ".";

/**
 * These tests drive the adapter against a mock of the `jatos` global injected by
 * jatos.js. The mock keeps a stateful group-session store and lets each test fire
 * the joinGroup lifecycle callbacks (onOpen / onError / onGroupSession) by hand.
 *
 * Note on subscribe(): the adapter's subscribe() is intentionally *future-only* —
 * it fans out on every onGroupSession event and does not replay the current
 * snapshot on registration. Whether the core MultiplayerAPI should replay current
 * state on subscribe is a separate, open API-contract question (deferred pending
 * jsPsych maintainer input); if replay is ever adopted it belongs in core, so the
 * adapter contract asserted here holds regardless of that decision.
 */

/** Build a controllable mock of the jatos global plus helpers to drive its callbacks. */
function makeMockJatos(workerId: string | number = "w1") {
  const store: Record<string, unknown> = {};
  let callbacks: Record<string, ((arg?: unknown) => void) | undefined> = {};

  const jatos = {
    workerId,
    joinGroup: jest.fn((cbs: Record<string, (arg?: unknown) => void>) => {
      callbacks = cbs;
    }),
    groupSession: {
      get: jest.fn((key: string) => store[key]),
      set: jest.fn(async (key: string, value: unknown) => {
        store[key] = value;
      }),
      getAll: jest.fn(() => ({ ...store })),
    },
    sendGroupMsg: jest.fn(),
    onError: jest.fn(),
  };

  return {
    jatos,
    store,
    fireOpen: () => callbacks.onOpen?.(),
    fireGroupSession: () => callbacks.onGroupSession?.(),
    fireError: (msg?: string) => callbacks.onError?.(msg),
  };
}

let mock: ReturnType<typeof makeMockJatos>;

beforeEach(() => {
  mock = makeMockJatos();
  (globalThis as Record<string, unknown>).jatos = mock.jatos;
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).jatos;
  jest.useRealTimers();
});

/** Construct an adapter and complete the connect handshake. */
async function connectedAdapter() {
  const adapter = new JatosAdapter();
  const promise = adapter.connect();
  mock.fireOpen();
  await promise;
  return adapter;
}

describe("construction", () => {
  test("throws a helpful error when the jatos global is missing", () => {
    delete (globalThis as Record<string, unknown>).jatos;
    expect(() => new JatosAdapter()).toThrow(/jatos global is not defined/);
  });

  test("derives participantId from the worker id as a string", () => {
    (globalThis as Record<string, unknown>).jatos = makeMockJatos(12345).jatos;
    expect(new JatosAdapter().participantId).toBe("12345");
  });
});

describe("connect", () => {
  test("resolves once the group channel opens", async () => {
    const adapter = new JatosAdapter();
    const promise = adapter.connect();
    mock.fireOpen();
    await expect(promise).resolves.toBeUndefined();
    expect(mock.jatos.joinGroup).toHaveBeenCalledTimes(1);
  });

  test("rejects, surfacing the error message, if joining the group fails", async () => {
    const adapter = new JatosAdapter();
    const promise = adapter.connect();
    mock.fireError("boom");
    await expect(promise).rejects.toThrow(/boom/);
  });
});

describe("reads", () => {
  test("getAll() returns the full store", async () => {
    const adapter = await connectedAdapter();
    mock.store.w1 = { a: 1 };
    mock.store.w2 = { b: 2 };
    expect(adapter.getAll()).toEqual({ w1: { a: 1 }, w2: { b: 2 } });
  });

  test("getAll() returns {} when JATOS reports a null session", async () => {
    const adapter = await connectedAdapter();
    mock.jatos.groupSession.getAll.mockReturnValueOnce(null);
    expect(adapter.getAll()).toEqual({});
  });

  test("get() reads a single participant's entry, or undefined", async () => {
    const adapter = await connectedAdapter();
    mock.store.w2 = { name: "Bob" };
    expect(adapter.get("w2")).toEqual({ name: "Bob" });
    expect(adapter.get("nobody")).toBeUndefined();
  });
});

describe("subscribe", () => {
  test("fans out every group-session update to all subscribers", async () => {
    const adapter = await connectedAdapter();
    const a: GroupSessionData[] = [];
    const b: GroupSessionData[] = [];
    adapter.subscribe((data) => a.push(data));
    adapter.subscribe((data) => b.push(data));

    mock.store.w1 = { hi: 1 };
    mock.fireGroupSession();

    expect(a).toEqual([{ w1: { hi: 1 } }]);
    expect(b).toEqual([{ w1: { hi: 1 } }]);
  });

  test("does not replay current state on registration (future-only)", async () => {
    const adapter = await connectedAdapter();
    mock.store.w1 = { already: "here" };
    const received: GroupSessionData[] = [];
    adapter.subscribe((data) => received.push(data));
    // No callback until the next group-session event.
    expect(received).toHaveLength(0);
    mock.fireGroupSession();
    expect(received).toHaveLength(1);
  });

  test("unsubscribe stops further updates without affecting other subscribers", async () => {
    const adapter = await connectedAdapter();
    const kept: GroupSessionData[] = [];
    const dropped: GroupSessionData[] = [];
    adapter.subscribe((data) => kept.push(data));
    const unsub = adapter.subscribe((data) => dropped.push(data));

    mock.fireGroupSession();
    unsub();
    mock.fireGroupSession();

    expect(kept).toHaveLength(2);
    expect(dropped).toHaveLength(1);
  });
});

describe("push", () => {
  test("writes data keyed by participantId", async () => {
    const adapter = await connectedAdapter();
    await adapter.push({ score: 5 });
    expect(mock.jatos.groupSession.set).toHaveBeenCalledWith("w1", { score: 5 });
  });

  test("retries on a version conflict and eventually succeeds", async () => {
    jest.useFakeTimers();
    let calls = 0;
    mock.jatos.groupSession.set.mockImplementation(async () => {
      calls += 1;
      if (calls < 3) throw new Error("version conflict");
    });

    const adapter = new JatosAdapter();
    const promise = adapter.push({ x: 1 });
    await jest.runAllTimersAsync();

    await expect(promise).resolves.toBeUndefined();
    expect(calls).toBe(3);
  });

  test("throws after exhausting all retry attempts", async () => {
    jest.useFakeTimers();
    mock.jatos.groupSession.set.mockRejectedValue(new Error("version conflict"));

    const adapter = new JatosAdapter();
    const promise = adapter.push({ x: 1 });
    // Attach the rejection expectation before advancing timers so the eventual
    // rejection is never momentarily unhandled.
    const assertion = expect(promise).rejects.toThrow(/version conflict/);
    await jest.runAllTimersAsync();
    await assertion;

    expect(mock.jatos.groupSession.set).toHaveBeenCalledTimes(8);
  });
});

describe("disconnect", () => {
  test("clears subscribers so later updates are ignored", async () => {
    const adapter = await connectedAdapter();
    const received: GroupSessionData[] = [];
    adapter.subscribe((data) => received.push(data));

    await adapter.disconnect();
    mock.fireGroupSession();

    expect(received).toHaveLength(0);
  });
});
