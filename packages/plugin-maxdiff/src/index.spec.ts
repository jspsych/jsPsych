import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { clickTarget } from "jspsych/tests/utils";

import maxdiff from ".";

jest.useFakeTimers();

describe("maxdiff plugin", function () {
  test("returns appropriate response with randomization", function () {
    var trial = {
      type: maxdiff,
      alternatives: ["a", "b", "c", "d"],
      labels: ["Most", "Least"],
      randomize_alternative_order: true,
    };

    jsPsych.init({
      timeline: [trial],
    });

    document.querySelector<HTMLInputElement>('input[data-name="0"][name="left"]').checked = true;
    document.querySelector<HTMLInputElement>('input[data-name="1"][name="right"]').checked = true;

    clickTarget(document.querySelector("#jspsych-maxdiff-next"));

    var maxdiff_data = jsPsych.data.get().values()[0];
    expect(maxdiff_data.response.left).toBe("a");
    expect(maxdiff_data.response.right).toBe("b");
  });
});
