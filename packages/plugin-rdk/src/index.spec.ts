import { pressKey, startTimeline } from "@jspsych/test-utils";

import rdk from ".";

describe("rdk plugin", () => {
  test("choices and frame data are stored as arrays", async () => {
    const { getData } = await startTimeline([
      {
        type: rdk,
        number_of_dots: 200,
        RDK_type: 3,
        choices: ["a", "l"],
        correct_choice: "l",
        coherent_direction: 0,
      },
    ]);

    pressKey("l");
    const data = getData().values()[0];
    expect(data.choices).toStrictEqual(["a", "l"]);
    expect(Array.isArray(data.frame_rate_array)).toBe(true);
  });

  test("responses are scored correctly", async () => {
    const trial = {
      type: rdk,
      number_of_dots: 200,
      RDK_type: 3,
      choices: ["a", "l"],
      correct_choice: "l",
      coherent_direction: 0,
    };

    const { getData } = await startTimeline([trial, trial]);

    pressKey("l");
    pressKey("a");

    expect(getData().values()).toEqual([
      expect.objectContaining({ response: "l", correct: true }),
      expect.objectContaining({ response: "a", correct: false }),
    ]);
  });
});
