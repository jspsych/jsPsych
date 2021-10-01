import { startTimeline } from "@jspsych/test-utils";

import freeSort from ".";

jest.useFakeTimers();

describe("free-sort plugin", () => {
  test("should display stimuli", async () => {
    const { getHTML } = await startTimeline([
      {
        type: freeSort,
        stimuli: [
          "img/happy_face_1.jpg",
          "img/happy_face_2.jpg",
          "img/happy_face_3.jpg",
          "img/happy_face_4.jpg",
        ],
      },
    ]);

    for (let i = 1; i < 5; i++) {
      expect(getHTML()).toContain(
        `src="img/happy_face_${i}.jpg" data-src="img/happy_face_${i}.jpg"`
      );
    }
  });

  test("should be able to adjust the height and width of free-sort area", async () => {
    const { getHTML } = await startTimeline([
      {
        type: freeSort,
        stimuli: [
          "img/happy_face_1.jpg",
          "img/happy_face_2.jpg",
          "img/happy_face_3.jpg",
          "img/happy_face_4.jpg",
        ],
        sort_area_height: 500,
        sort_area_width: 700,
      },
    ]);

    expect(getHTML()).toContain(
      'class="jspsych-free-sort-arena" style="position: relative; width:700px; height:500px;'
    );
  });

  test("should be able to adjust the height and width of stimuli", async () => {
    const { getHTML } = await startTimeline([
      {
        type: freeSort,
        stimuli: [
          "img/happy_face_1.jpg",
          "img/happy_face_2.jpg",
          "img/happy_face_3.jpg",
          "img/happy_face_4.jpg",
        ],
        stim_height: 200,
        stim_width: 200,
      },
    ]);

    expect(getHTML()).toMatch(/<img src="img\/happy_face_1\.jpg".+width:200px; height:200px/);
  });

  test("should display prompt", async () => {
    const { getHTML } = await startTimeline([
      {
        type: freeSort,
        stimuli: [
          "img/happy_face_1.jpg",
          "img/happy_face_2.jpg",
          "img/happy_face_3.jpg",
          "img/happy_face_4.jpg",
        ],
        prompt: "<p>This is a prompt</p>",
      },
    ]);

    expect(getHTML()).toContain("<p>This is a prompt</p>");
  });

  test('should display prompt at bottom if prompt_location is "below"', async () => {
    const { getHTML } = await startTimeline([
      {
        type: freeSort,
        stimuli: [
          "img/happy_face_1.jpg",
          "img/happy_face_2.jpg",
          "img/happy_face_3.jpg",
          "img/happy_face_4.jpg",
        ],
        prompt: "<p>This is a prompt</p>",
        prompt_location: "below",
      },
    ]);

    expect(getHTML()).toMatch(/<p>This is a prompt<\/p>.+<button id="jspsych-free-sort-done-btn"/);
  });

  test("should be able to change label of button", async () => {
    const { getHTML } = await startTimeline([
      {
        type: freeSort,
        stimuli: [
          "img/happy_face_1.jpg",
          "img/happy_face_2.jpg",
          "img/happy_face_3.jpg",
          "img/happy_face_4.jpg",
        ],
        button_label: "Finito",
      },
    ]);

    expect(getHTML()).toMatch(
      /<button id="jspsych-free-sort-done-btn" class="jspsych-btn".+>Finito<\/button>/
    );
  });
});
