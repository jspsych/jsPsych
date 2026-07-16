import { startTimeline } from "@jspsych/test-utils";
import { GroupSessionData, JsPsych, MultiplayerAdapter, Unsubscribe } from "jspsych";

import multiplayerSync from ".";

/** In-memory adapter that simulates participants sharing one group session over a channel. */
class MockAdapter implements MultiplayerAdapter {
  readonly participantId: string;
  private store: GroupSessionData = {};
  private subscribers = new Set<(data: GroupSessionData) => void>();

  /** Every connected adapter — simulates the shared network channel. */
  static channel: MockAdapter[] = [];

  constructor(participantId: string) {
    this.participantId = participantId;
  }

  connect(): Promise<void> {
    MockAdapter.channel.push(this);
    return Promise.resolve();
  }

  push(data: Record<string, unknown>): Promise<void> {
    for (const peer of MockAdapter.channel) {
      peer.store = { ...peer.store, [this.participantId]: data };
      for (const cb of peer.subscribers) cb(peer.store);
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
    MockAdapter.channel = MockAdapter.channel.filter((a) => a !== this);
    return Promise.resolve();
  }
}

/** Build a JsPsych instance with a connected mock adapter for the given participant. */
async function connectedJsPsych(participantId: string) {
  const jsPsych = new JsPsych({});
  await jsPsych.multiplayer.connect(new MockAdapter(participantId));
  return jsPsych;
}

beforeEach(() => {
  MockAdapter.channel = [];
});

describe("multiplayer-sync plugin", () => {
  test("pushes data and ends once the condition is met by its own push", async () => {
    const jsPsych = await connectedJsPsych("p1");
    const { getData, expectFinished } = await startTimeline(
      [
        {
          type: multiplayerSync,
          push_data: { ready: true },
          wait_for: (group) => Object.keys(group).length >= 1,
        },
      ],
      jsPsych
    );

    await expectFinished();
    const data = getData().values()[0];
    expect(data.group).toEqual({ p1: { ready: true } });
    expect(data.timed_out).toBe(false);
    expect(typeof data.wait_time).toBe("number");
  });

  test("keeps waiting until a second participant satisfies the condition", async () => {
    const jsPsych = await connectedJsPsych("p1");
    const { getData, getHTML, expectRunning, expectFinished } = await startTimeline(
      [
        {
          type: multiplayerSync,
          push_data: { role: "a" },
          wait_for: (group) => Object.keys(group).length >= 2,
          message: "<p>Waiting for another player…</p>",
        },
      ],
      jsPsych
    );

    // Only p1 has pushed so far — the barrier should still be holding.
    await expectRunning();
    expect(getHTML()).toContain("Waiting for another player");

    // A second participant joins and pushes, meeting the condition.
    const p2 = new MockAdapter("p2");
    await p2.connect();
    await p2.push({ role: "b" });

    await expectFinished();
    expect(getData().values()[0].group).toEqual({ p1: { role: "a" }, p2: { role: "b" } });
  });

  test("supports push_data supplied as a function (dynamic parameter)", async () => {
    const jsPsych = await connectedJsPsych("p1");
    const { getData, expectFinished } = await startTimeline(
      [
        {
          type: multiplayerSync,
          push_data: () => ({ n: 7 }),
          wait_for: (group) => group["p1"]?.n === 7,
        },
      ],
      jsPsych
    );

    await expectFinished();
    expect(getData().values()[0].group).toEqual({ p1: { n: 7 } });
  });

  test("a push failure rejects the trial instead of being recorded as a timeout", async () => {
    const jsPsych = await connectedJsPsych("p1");
    const on_timeout = jest.fn();
    const pushError = new Error("network failure");
    jest.spyOn(MockAdapter.channel[0], "push").mockRejectedValue(pushError);

    const plugin = new multiplayerSync(jsPsych);
    const display = document.createElement("div");

    await expect(
      plugin.trial(display, {
        push_data: { ready: true },
        wait_for: () => true,
        message: "",
        timeout: null,
        on_timeout,
        minimum_wait: 0,
      } as any)
    ).rejects.toBe(pushError);

    // A push failure is not a wait() timeout — on_timeout must not fire for it.
    expect(on_timeout).not.toHaveBeenCalled();
  });

  test("a throwing wait_for predicate rejects the trial instead of being recorded as a timeout", async () => {
    const jsPsych = await connectedJsPsych("p1");
    const on_timeout = jest.fn();
    const predicateError = new Error("predicate bug");

    const plugin = new multiplayerSync(jsPsych);
    const display = document.createElement("div");

    await expect(
      plugin.trial(display, {
        push_data: null,
        wait_for: () => {
          throw predicateError;
        },
        message: "",
        timeout: null,
        on_timeout,
        minimum_wait: 0,
      } as any)
    ).rejects.toBe(predicateError);

    expect(on_timeout).not.toHaveBeenCalled();
  });

  test("ends with timed_out and calls on_timeout when the timeout elapses", async () => {
    const jsPsych = await connectedJsPsych("p1");
    const on_timeout = jest.fn();
    const { getData, finished } = await startTimeline(
      [
        {
          type: multiplayerSync,
          wait_for: () => false,
          timeout: 50,
          on_timeout,
        },
      ],
      jsPsych
    );

    await finished;
    expect(on_timeout).toHaveBeenCalledTimes(1);
    expect(getData().values()[0].timed_out).toBe(true);
  });
});
