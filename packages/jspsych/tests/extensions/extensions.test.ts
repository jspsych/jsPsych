import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { JsPsych, initJsPsych } from "../../src";
import { TestExtension } from "./test-extension";

jest.useFakeTimers();

describe("jsPsych.extensions", () => {
  let jsPsych: JsPsych;
  let extension: TestExtension;

  beforeEach(() => {
    jsPsych = initJsPsych({ extensions: [{ type: TestExtension }] });
    extension = jsPsych.extensions.test as TestExtension;
  });

  test("initialize is called at start of experiment", async () => {
    expect.assertions(2);

    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          on_start: () => {
            expect(extension.initialize).toHaveBeenCalled();
          },
        },
      ],
      jsPsych
    );

    expect(typeof extension.initialize).toBe("function");
    await pressKey("a");
  });

  test("initialize gets params", async () => {
    expect.assertions(2);

    jsPsych = initJsPsych({
      extensions: [{ type: TestExtension, params: { foo: 1 } }],
    });
    extension = jsPsych.extensions.test as TestExtension;

    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          on_start: () => {
            expect(extension.initialize).toHaveBeenCalledWith({ foo: 1 });
          },
        },
      ],
      jsPsych
    );

    expect(typeof extension.initialize).toBe("function");

    await pressKey("a");
  });

  test("on_start is called before trial", async () => {
    expect.assertions(1);

    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          extensions: [{ type: TestExtension }],
          on_load: () => {
            expect(extension.on_start).toHaveBeenCalled();
          },
        },
      ],
      jsPsych
    );

    await pressKey("a");
  });

  test("on_start gets params", async () => {
    expect.assertions(1);

    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          extensions: [{ type: TestExtension, params: { foo: 1 } }],
          on_load: () => {
            expect(extension.on_start).toHaveBeenCalledWith({ foo: 1 });
          },
        },
      ],
      jsPsych
    );

    await pressKey("a");
  });

  test("on_load is called after load", async () => {
    expect.assertions(2);

    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          extensions: [{ type: TestExtension }],
          on_load: () => {
            // trial load happens before extension load
            expect(extension.on_load).not.toHaveBeenCalled();
          },
        },
      ],
      jsPsych
    );

    expect(extension.on_load).toHaveBeenCalled();

    await pressKey("a");
  });

  test("on_load gets params", async () => {
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          extensions: [{ type: TestExtension, params: { foo: 1 } }],
        },
      ],
      jsPsych
    );

    expect(extension.on_load).toHaveBeenCalledWith({ foo: 1 });

    await pressKey("a");
  });

  test("on_finish called after trial", async () => {
    expect.assertions(2);

    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          extensions: [{ type: TestExtension }],
          on_load: () => {
            expect(extension.on_finish).not.toHaveBeenCalled();
          },
        },
      ],
      jsPsych
    );

    await pressKey("a");

    expect(extension.on_finish).toHaveBeenCalled();
  });

  test("on_finish gets params", async () => {
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          extensions: [{ type: TestExtension, params: { foo: 1 } }],
        },
      ],
      jsPsych
    );

    await pressKey("a");

    expect(extension.on_finish).toHaveBeenCalledWith({ foo: 1 });
  });

  test.each`
    name                 | onFinishReturnValue
    ${"on_finish"}       | ${{ extension_data: true }}
    ${"async on_finish"} | ${Promise.resolve({ extension_data: true })}
  `("$name adds trial data", async ({ onFinishReturnValue }) => {
    extension.on_finish.mockReturnValueOnce(onFinishReturnValue);

    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          extensions: [{ type: TestExtension }],
        },
      ],
      jsPsych
    );

    await pressKey("a");

    expect(jsPsych.data.get().values()[0].extension_data).toBe(true);
  });

  test("on_finish data is available in trial on_finish", async () => {
    expect.assertions(1);

    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          extensions: [{ type: TestExtension }],
          on_finish: (data) => {
            expect(data.extension_data).toBe(true);
          },
        },
      ],
      jsPsych
    );

    await pressKey("a");
  });
});
