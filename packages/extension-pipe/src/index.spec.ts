import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import PipeExtension from ".";

// The library is mocked throughout: what is under test here is the wiring into
// jsPsych -- which callbacks get taken, in what order, and what the session is
// told about the outcome. The staging protocol itself is the library's problem
// and has its own tests.
const session = {
  sessionId: "SESSION_ID",
  enabled: true,
  record: jest.fn(),
  flush: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
};
const createSession = jest.fn((..._args: any[]) => session);
const saveData = jest.fn((..._args: any[]) => Promise.resolve({ ok: true, status: 201, body: {} }));
const setBaseURL = jest.fn((..._args: any[]) => undefined);

// `virtual` because datapipe-client is published from the DataPipe repository
// and is not installed in this monorepo's node_modules during development.
jest.mock(
  "datapipe-client",
  () => ({
    createSession: (...args: any[]) => createSession(...args),
    saveData: (...args: any[]) => saveData(...args),
    setBaseURL: (...args: any[]) => setBaseURL(...args),
  }),
  { virtual: true }
);

const PARAMS = { experiment_id: "EXP123", filename: "subject-01.csv" };

/** A timeline of `n` trials, each advanced by pressing a key. */
const trials = (n: number) =>
  Array.from({ length: n }, () => ({ type: htmlKeyboardResponse, stimulus: "hello" }));

async function run(params: Record<string, any>, n = 2, initOptions = {}) {
  const jsPsych = initJsPsych({
    ...initOptions,
    extensions: [{ type: PipeExtension, params }],
  });
  const api = await startTimeline(trials(n), jsPsych);
  for (let i = 0; i < n; i++) await pressKey("a");
  await api.expectFinished();
  return { jsPsych, ...api };
}

beforeEach(() => {
  jest.clearAllMocks();
  saveData.mockResolvedValue({ ok: true, status: 201, body: {} });
});

describe("streaming", () => {
  test("starts a session and stages every trial", async () => {
    await run(PARAMS, 3);

    expect(createSession).toHaveBeenCalledWith({
      experimentID: "EXP123",
      filename: "subject-01.csv",
    });
    expect(session.record).toHaveBeenCalledTimes(3);
  });

  test("evaluates a function filename when the experiment starts", async () => {
    // The usual case: the participant ID comes from jsPsych.randomization,
    // which does not exist when initJsPsych is called.
    let subjectId = "";
    const jsPsych = initJsPsych({
      extensions: [
        {
          type: PipeExtension,
          params: { experiment_id: "EXP123", filename: () => `${subjectId}.csv` },
        },
      ],
    });
    subjectId = "assigned-after-init";

    const api = await startTimeline(trials(1), jsPsych);
    await pressKey("a");
    await api.expectFinished();

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({ filename: "assigned-after-init.csv" })
    );
    expect(saveData).toHaveBeenCalledWith(
      expect.objectContaining({ filename: "assigned-after-init.csv" })
    );
  });

  test("stream: false submits at the end without opening a session", async () => {
    await run({ ...PARAMS, stream: false });

    expect(createSession).not.toHaveBeenCalled();
    expect(saveData).toHaveBeenCalledWith(expect.objectContaining({ sessionId: undefined }));
  });

  test("a staging failure does not break the researcher's on_data_update", async () => {
    session.record.mockImplementationOnce(() => {
      throw new Error("staging is down");
    });
    const onDataUpdate = jest.fn();

    await run(PARAMS, 2, { on_data_update: onDataUpdate });

    expect(onDataUpdate).toHaveBeenCalledTimes(2);
    expect(saveData).toHaveBeenCalled();
  });
});

describe("the final save", () => {
  test("submits the complete dataset with the session id", async () => {
    const { jsPsych } = await run(PARAMS, 2);

    expect(saveData).toHaveBeenCalledWith({
      experimentID: "EXP123",
      filename: "subject-01.csv",
      data: jsPsych.data.get().csv(),
      sessionId: "SESSION_ID",
    });
  });

  test("waits for the session to start before reading its id", async () => {
    // createSession() returns synchronously and the /api/session round trip
    // finishes later, so sessionId is empty until it does. A short experiment
    // can reach the end inside that window. Submitting without the id would
    // leave the staged copy unmatched, and DataPipe would recover it a second
    // time as a spurious .partial.json.
    let sessionId = "";
    const pending = {
      ...session,
      get sessionId() {
        return sessionId;
      },
      flush: jest.fn().mockImplementation(async () => {
        sessionId = "ARRIVED_LATE";
      }),
    };
    createSession.mockReturnValueOnce(pending as any);

    await run(PARAMS, 1);

    expect(pending.flush).toHaveBeenCalled();
    expect(saveData).toHaveBeenCalledWith(expect.objectContaining({ sessionId: "ARRIVED_LATE" }));
  });

  test("a failing flush does not stop the submission", async () => {
    const broken = { ...session, flush: jest.fn().mockRejectedValue(new Error("offline")) };
    createSession.mockReturnValueOnce(broken as any);

    await run(PARAMS, 1);

    expect(saveData).toHaveBeenCalledTimes(1);
  });

  test("format: json submits JSON", async () => {
    const { jsPsych } = await run({ ...PARAMS, format: "json" });
    expect(saveData).toHaveBeenCalledWith(
      expect.objectContaining({ data: jsPsych.data.get().json() })
    );
  });

  test("data_string overrides format", async () => {
    await run({ ...PARAMS, format: "json", data_string: () => "custom" });
    expect(saveData).toHaveBeenCalledWith(expect.objectContaining({ data: "custom" }));
  });

  test("closes the session as submitted when the save succeeds", async () => {
    await run(PARAMS);
    expect(session.close).toHaveBeenCalledWith({ submitted: true });
  });

  test("closes the session as unsubmitted when the save is refused", async () => {
    saveData.mockResolvedValue({ ok: false, status: 400, body: { error: "nope" } });
    await run(PARAMS);
    // The staged trials must survive so the sweep recovers them as a partial,
    // rather than waiting out the 24-hour expiry.
    expect(session.close).toHaveBeenCalledWith({ submitted: false });
  });

  test("closes the session as unsubmitted when saveData throws", async () => {
    saveData.mockRejectedValue(new Error("network gone"));
    await run(PARAMS);
    expect(session.close).toHaveBeenCalledWith({ submitted: false });
  });

  test("reports the result through on_save", async () => {
    const onSave = jest.fn();
    saveData.mockResolvedValue({ ok: false, status: 413, body: null });
    await run({ ...PARAMS, on_save: onSave });
    expect(onSave).toHaveBeenCalledWith({ ok: false, status: 413, body: null });
  });

  test("shows a wait message while the upload is in progress", async () => {
    let displayDuringSave = "";
    const jsPsych = initJsPsych({
      extensions: [{ type: PipeExtension, params: { ...PARAMS, wait_message: "<p>Hang on</p>" } }],
    });
    saveData.mockImplementation(async () => {
      displayDuringSave = jsPsych.getDisplayElement().innerHTML;
      return { ok: true, status: 201, body: {} };
    });

    const api = await startTimeline(trials(1), jsPsych);
    await pressKey("a");
    await api.expectFinished();

    expect(displayDuringSave).toBe("<p>Hang on</p>");
  });
});

describe("hook ordering", () => {
  test("saves before the researcher's on_finish, which is where redirects live", async () => {
    const order: string[] = [];
    saveData.mockImplementation(async () => {
      order.push("save");
      return { ok: true, status: 201, body: {} };
    });

    await run(PARAMS, 1, {
      on_finish: () => {
        order.push("researcher on_finish");
      },
    });

    expect(order).toEqual(["save", "researcher on_finish"]);
  });

  test("the researcher's on_data_update still receives every trial", async () => {
    const seen: any[] = [];
    await run(PARAMS, 3, { on_data_update: (d: any) => seen.push(d) });
    expect(seen).toHaveLength(3);
  });

  test("works without any researcher callbacks at all", async () => {
    await expect(run(PARAMS, 1)).resolves.toBeDefined();
    expect(saveData).toHaveBeenCalledTimes(1);
  });
});

describe("abandonment", () => {
  test("submits when the experiment is aborted part-way", async () => {
    // abortExperiment() unwinds the timeline and falls through to on_finish, so
    // an extension-owned save still runs. A save *trial* would never be
    // reached, which is why an attention-check failure used to lose everything.
    const jsPsych = initJsPsych({ extensions: [{ type: PipeExtension, params: PARAMS }] });
    const api = await startTimeline(trials(5), jsPsych);

    await pressKey("a");
    jsPsych.abortExperiment("Thanks anyway.");
    await api.expectFinished();

    expect(saveData).toHaveBeenCalledTimes(1);
    expect(session.close).toHaveBeenCalledWith({ submitted: true });
  });
});

describe("save_at_end: false", () => {
  test("does not submit, and closes on the save trial's result", async () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: PipeExtension, params: { ...PARAMS, save_at_end: false } }],
    });
    const api = await startTimeline(trials(2), jsPsych);
    await pressKey("a");

    // Stand in for a jsPsychPipe save trial finishing successfully part-way
    // through the timeline, which is where a researcher would place it.
    jsPsych.getInitSettings().on_data_update({ trial_type: "pipe", success: true });

    await pressKey("a");
    await api.expectFinished();

    expect(saveData).not.toHaveBeenCalled();
    expect(session.close).toHaveBeenCalledTimes(1);
    expect(session.close).toHaveBeenCalledWith({ submitted: true });
  });

  test("recovers the staged trials when no save trial ran", async () => {
    await run({ ...PARAMS, save_at_end: false }, 1);
    expect(saveData).not.toHaveBeenCalled();
    expect(session.close).toHaveBeenCalledWith({ submitted: false });
  });
});

describe("misconfiguration", () => {
  test("warns and does nothing without an experiment_id", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await run({ filename: "x.csv" } as any, 1);

    expect(createSession).not.toHaveBeenCalled();
    expect(saveData).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no experiment_id"));
    warn.mockRestore();
  });

  test("base_url is applied to the client", async () => {
    await run({ ...PARAMS, base_url: "https://datapipe-test.web.app" }, 1);
    expect(setBaseURL).toHaveBeenCalledWith("https://datapipe-test.web.app");
  });
});
