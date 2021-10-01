import instructions from "@jspsych/plugin-instructions";
import sameDifferentHtml from "@jspsych/plugin-same-different-html";
import surveyMultiSelect from "@jspsych/plugin-survey-multi-select";
import surveyText from "@jspsych/plugin-survey-text";
import { clickTarget, pressKey, startTimeline } from "@jspsych/test-utils";

jest.useFakeTimers();

describe("data conversion to json", () => {
  test("survey-text data response object is correctly converted", async () => {
    const { getData } = await startTimeline([
      {
        type: surveyText,
        questions: [{ prompt: "Q1" }, { prompt: "Q2" }],
      },
    ]);

    document.querySelector<HTMLInputElement>("#input-0").value = "Response 1";
    document.querySelector<HTMLInputElement>("#input-1").value = "Response 2";

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

    expect(getData().ignore(["rt", "internal_node_id", "time_elapsed", "trial_type"]).json()).toBe(
      JSON.stringify([{ response: { Q0: "Response 1", Q1: "Response 2" }, trial_index: 0 }])
    );
  });

  test("same-different-html stimulus array is correctly converted", async () => {
    const { getHTML, getData } = await startTimeline([
      {
        type: sameDifferentHtml,
        stimuli: ["<p>Climbing</p>", "<p>Walking</p>"],
        answer: "different",
        gap_duration: 0,
        first_stim_duration: null,
      },
    ]);

    expect(getHTML()).toMatch("<p>Climbing</p>");
    pressKey("q");
    jest.runAllTimers();
    expect(getHTML()).toMatch("<p>Walking</p>");
    pressKey("q");
    expect(getHTML()).toBe("");

    expect(
      getData()
        .ignore([
          "rt",
          "internal_node_id",
          "time_elapsed",
          "trial_type",
          "rt_stim1",
          "response_stim1",
        ])
        .json()
    ).toBe(
      JSON.stringify([
        {
          answer: "different",
          correct: false,
          stimulus: ["<p>Climbing</p>", "<p>Walking</p>"],
          response: "q",
          trial_index: 0,
        },
      ])
    );
  });

  test("survey-multi-select response array is correctly converted", async () => {
    const { getHTML, getData } = await startTimeline([
      {
        type: surveyMultiSelect,
        questions: [{ prompt: "foo", options: ["fuzz", "bizz", "bar"], name: "q" }],
      },
    ]);

    expect(getHTML()).toMatch("foo");
    clickTarget(document.querySelector("#jspsych-survey-multi-select-response-0-0"));
    clickTarget(document.querySelector("#jspsych-survey-multi-select-response-0-1"));
    clickTarget(document.querySelector("#jspsych-survey-multi-select-next"));
    expect(getHTML()).toBe("");

    expect(
      getData()
        .ignore(["rt", "internal_node_id", "time_elapsed", "trial_type", "question_order"])
        .json()
    ).toBe(
      JSON.stringify([
        {
          response: {
            q: ["fuzz", "bizz"],
          },
          trial_index: 0,
        },
      ])
    );
  });

  test("instructions view_history is correctly converted - issue #670", async () => {
    const { getHTML, getData } = await startTimeline([
      {
        type: instructions,
        pages: ["page 1", "page 2"],
        key_forward: "a",
        allow_keys: true,
      },
    ]);

    expect(getHTML()).toMatch("page 1");
    pressKey("a");
    expect(getHTML()).toMatch("page 2");
    pressKey("a");
    expect(getHTML()).toBe("");

    const jsonData = getData().ignore(["rt", "internal_node_id", "time_elapsed"]).json();
    const jsData = JSON.parse(jsonData);
    expect(Array.isArray(jsData[0].view_history)).toBe(true);
    expect(jsData[0].view_history.length).toBe(2);
    expect(jsData[0].view_history[0].page_index).toBe(0);
    expect(jsData[0].view_history[1].page_index).toBe(1);
  });
});
