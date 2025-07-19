import { clickTarget, startTimeline } from "@jspsych/test-utils";

import surveyTextDynamic from ".";

jest.useFakeTimers();

describe("survey-text-dynamic plugin", () => {
  test("loads", async () => {
    const { jsPsych } = await startTimeline([
      {
        type: surveyTextDynamic,
        questions: [
          {
            prompt: "What is your name?",
            name: "name",
          },
        ],
      },
    ]);

    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-survey-text-dynamic-form")
    ).not.toBeNull();
  });

  test("data are logged with the right question names", async () => {
    const { jsPsych, expectFinished } = await startTimeline([
      {
        type: surveyTextDynamic,
        questions: [
          {
            prompt: "What is your name?",
            name: "name",
          },
          {
            prompt: "What is your age?",
            name: "age",
          },
        ],
      },
    ]);

    const name_input = jsPsych.getDisplayElement().querySelector("#input-0-0") as HTMLInputElement;
    const age_input = jsPsych.getDisplayElement().querySelector("#input-1-0") as HTMLInputElement;

    name_input.value = "John";
    age_input.value = "25";

    await clickTarget(
      jsPsych.getDisplayElement().querySelector("#jspsych-survey-text-dynamic-next")
    );

    await expectFinished();

    const data = jsPsych.data.get().values()[0];
    expect(data.response.name).toEqual(["John"]);
    expect(data.response.age).toEqual(["25"]);
  });

  test("creates new input when Enter is pressed", async () => {
    const { jsPsych } = await startTimeline([
      {
        type: surveyTextDynamic,
        questions: [
          {
            prompt: "List your hobbies:",
            name: "hobbies",
          },
        ],
      },
    ]);

    const firstInput = jsPsych.getDisplayElement().querySelector("#input-0-0") as HTMLInputElement;
    firstInput.value = "Reading";

    // Simulate Enter key press
    const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
    firstInput.dispatchEvent(enterEvent);

    jest.runAllTimers();

    // Check that a second input was created
    const secondInput = jsPsych.getDisplayElement().querySelector("#input-0-1") as HTMLInputElement;
    expect(secondInput).not.toBeNull();
  });

  test("creates new input when spacebar is pressed", async () => {
    const { jsPsych } = await startTimeline([
      {
        type: surveyTextDynamic,
        questions: [
          {
            prompt: "List your hobbies:",
            name: "hobbies",
          },
        ],
      },
    ]);

    const firstInput = jsPsych.getDisplayElement().querySelector("#input-0-0") as HTMLInputElement;
    firstInput.value = "Reading";

    // Simulate Enter key press
    const enterEvent = new KeyboardEvent("keydown", { key: " " });
    firstInput.dispatchEvent(enterEvent);

    jest.runAllTimers();

    // Check that a second input was created
    const secondInput = jsPsych.getDisplayElement().querySelector("#input-0-1") as HTMLInputElement;
    expect(secondInput).not.toBeNull();
  });

  test("collects data from multiple dynamic inputs", async () => {
    const { jsPsych, expectFinished } = await startTimeline([
      {
        type: surveyTextDynamic,
        questions: [
          {
            prompt: "List your hobbies:",
            name: "hobbies",
          },
        ],
      },
    ]);

    const firstInput = jsPsych.getDisplayElement().querySelector("#input-0-0") as HTMLInputElement;
    firstInput.value = "Reading";

    // Create second input
    const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
    firstInput.dispatchEvent(enterEvent);

    jest.runAllTimers();

    const secondInput = jsPsych.getDisplayElement().querySelector("#input-0-1") as HTMLInputElement;
    secondInput.value = "Swimming";

    await clickTarget(
      jsPsych.getDisplayElement().querySelector("#jspsych-survey-text-dynamic-next")
    );

    await expectFinished();

    const data = jsPsych.data.get().values()[0];
    expect(data.response.hobbies).toEqual(["Reading", "Swimming"]);
  });

  test("deletes empty input field when backspace is pressed (except first input)", async () => {
    const { jsPsych } = await startTimeline([
      {
        type: surveyTextDynamic,
        questions: [
          {
            prompt: "List your hobbies:",
            name: "hobbies",
          },
        ],
      },
    ]);

    const firstInput = jsPsych.getDisplayElement().querySelector("#input-0-0") as HTMLInputElement;
    firstInput.value = "Reading";

    // Create second input
    const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
    firstInput.dispatchEvent(enterEvent);

    jest.runAllTimers();

    // Verify second input was created
    const secondInput = jsPsych.getDisplayElement().querySelector("#input-0-1") as HTMLInputElement;
    expect(secondInput).not.toBeNull();

    // Press backspace on empty second input
    const backspaceEvent = new KeyboardEvent("keydown", { key: "Backspace" });
    secondInput.dispatchEvent(backspaceEvent);

    jest.runAllTimers();

    // Check that second input was removed
    const deletedInput = jsPsych.getDisplayElement().querySelector("#input-0-1");
    expect(deletedInput).toBeNull();

    // First input should still exist
    const remainingFirstInput = jsPsych.getDisplayElement().querySelector("#input-0-0");
    expect(remainingFirstInput).not.toBeNull();
  });

  test("does not delete first input field when backspace is pressed", async () => {
    const { jsPsych } = await startTimeline([
      {
        type: surveyTextDynamic,
        questions: [
          {
            prompt: "List your hobbies:",
            name: "hobbies",
          },
        ],
      },
    ]);

    const firstInput = jsPsych.getDisplayElement().querySelector("#input-0-0") as HTMLInputElement;

    // Press backspace on empty first input
    const backspaceEvent = new KeyboardEvent("keydown", { key: "Backspace" });
    firstInput.dispatchEvent(backspaceEvent);

    jest.runAllTimers();

    // First input should still exist
    const remainingFirstInput = jsPsych.getDisplayElement().querySelector("#input-0-0");
    expect(remainingFirstInput).not.toBeNull();
  });
});
