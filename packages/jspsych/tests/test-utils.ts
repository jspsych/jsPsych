import { JsPsych } from "src";

export function mockDomRelatedJsPsychMethods(jsPsychInstance: JsPsych) {
  const displayElement = document.createElement("div");
  const displayContainerElement = document.createElement("div");
  jest.spyOn(jsPsychInstance, "getDisplayElement").mockImplementation(() => displayElement);
  jest
    .spyOn(jsPsychInstance, "getDisplayContainerElement")
    .mockImplementation(() => displayContainerElement);

  jest.spyOn(jsPsychInstance, "focusDisplayContainerElement").mockImplementation(() => {});
  jest.spyOn(jsPsychInstance, "addCssClasses").mockImplementation(() => {});
  jest.spyOn(jsPsychInstance, "removeCssClasses").mockImplementation(() => {});
}
