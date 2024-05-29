import { JsPsych } from "../../JsPsych";
import { Author } from "./Author";
import { Variable } from "./Variable";

export class JsPsychMetadata {
  private metadata: {};

  // private author: string;
  // private context: string;
  // private authorsList: List[Authors];
  // private variablesList: Variables[];

  constructor(private JsPsych: JsPsych) {
    this.generateDefaultMetaData();
  }

  setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  getMetadata(key: string): any {
    return this.metadata[key];
  }

  getAllMetadata(): Record<string, any> {
    return this.metadata;
  }

  removeMetadata(key: string): void {
    delete this.metadata[key];
  }

  generateDefaultMetaData(): void {
    this.metadata = {};
  }

  createVariableMetaData(): void {}

  convertToJsonObject() {}

  getAndSetVariable() {}

  // need an automatic method to pass in metadata

  displayMetaData(): void {
    // Format the metadata as a JSON string for display
    const metadata_string = JSON.stringify(this.metadata, null, 2);

    // Get the display element from jsPsych
    const display_element = this.JsPsych.getDisplayElement();

    // Set the inner HTML of the display element to include a preformatted text block
    display_element.innerHTML = '<pre id="jspsych-metadata-display"></pre>';

    // Set the text content of the preformatted text block to the metadata string
    document.getElementById("jspsych-metadata-display").textContent = metadata_string;
  }
}
