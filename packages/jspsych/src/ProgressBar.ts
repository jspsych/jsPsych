/**
 * Maintains a visual progress bar using HTML and CSS
 */
export class ProgressBar {
  constructor(
    private readonly containerElement: HTMLDivElement,
    private readonly message: string | ((progress: number) => string)
  ) {
    this.setupElements();
  }

  private _progress = 0;

  private innerDiv: HTMLDivElement;
  private messageSpan: HTMLSpanElement;

  /** Adds the progress bar HTML code into `this.containerElement` */
  private setupElements() {
    this.messageSpan = document.createElement("span");

    this.innerDiv = document.createElement("div");
    this.innerDiv.id = "jspsych-progressbar-inner";
    this.update();

    const outerDiv = document.createElement("div");
    outerDiv.id = "jspsych-progressbar-outer";
    outerDiv.appendChild(this.innerDiv);

    this.containerElement.appendChild(this.messageSpan);
    this.containerElement.appendChild(outerDiv);
  }

  /** Updates the progress bar according to `this.progress` */
  private update() {
    this.innerDiv.style.width = this._progress * 100 + "%";

    if (typeof this.message === "function") {
      this.messageSpan.innerHTML = this.message(this._progress);
    } else {
      this.messageSpan.innerHTML = this.message;
    }
  }

  /**
   * The bar's current position as a number in the closed interval [0, 1]. Set this to update the
   * progress bar accordingly.
   */
  set progress(progress: number) {
    if (typeof progress !== "number" || progress < 0 || progress > 1) {
      throw new Error("jsPsych.progressBar.progress must be a number between 0 and 1");
    }

    this._progress = progress;
    this.update();
  }

  get progress() {
    return this._progress;
  }
}
