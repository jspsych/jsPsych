/* These tests are ran directly by the Node.js runtime and used to test compatiblity in Node environments */

describe("Load Node Module", () => {
  it("should load with CommonJS require", () => {
    const jsPsych = require("../../jspsych");
    console.log(jsPsych);
    expect(jsPsych).toHaveProperty("data");
    expect(jsPsych).toHaveProperty("plugins");
  });
});
