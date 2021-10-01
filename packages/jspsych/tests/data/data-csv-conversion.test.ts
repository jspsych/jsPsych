import sameDifferentHtml from "@jspsych/plugin-same-different-html";
import surveyMultiSelect from "@jspsych/plugin-survey-multi-select";
import surveyText from "@jspsych/plugin-survey-text";
import { clickTarget, pressKey, startTimeline } from "@jspsych/test-utils";

jest.useFakeTimers();

describe("data conversion to csv", () => {
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

    expect(getData().ignore(["rt", "internal_node_id", "time_elapsed", "trial_type"]).csv()).toBe(
      '"response","trial_index"\r\n"{""Q0"":""Response 1"",""Q1"":""Response 2""}","0"\r\n'
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
        .csv()
    ).toBe(
      '"answer","correct","stimulus","response","trial_index"\r\n"different","false","[""<p>Climbing</p>"",""<p>Walking</p>""]","q","0"\r\n'
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
        .csv()
    ).toBe('"response","trial_index"\r\n"{""q"":[""fuzz"",""bizz""]}","0"\r\n');
  });
});
