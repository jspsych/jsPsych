/* These tests are transpiled with babel and used to test the API's compatibility in ES6 environments */

import * as jsPsych from "../../jspsych";
describe("Load ES Module with Babel", () => {
  it("should load as ES Module", () => {
    console.log(jsPsych);
    expect(jsPsych).toBeTruthy();
  });
});
