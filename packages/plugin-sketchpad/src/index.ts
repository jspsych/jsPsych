import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "sketchpad",
  parameters: {
    /**
     * The shape of the canvas element. Accepts `'rectangle'` or `'circle'`
     */
    canvas_shape: {
      type: ParameterType.STRING,
      default: "rectangle",
    },
    /**
     * Width of the canvas in pixels.
     */
    canvas_width: {
      type: ParameterType.INT,
      default: 500,
    },
    /**
     * Width of the canvas in pixels.
     */
    canvas_height: {
      type: ParameterType.INT,
      default: 500,
    },
    /**
     * Diameter of the canvas (when `canvas_shape` is `'circle'`) in pixels.
     */
    canvas_diameter: {
      type: ParameterType.INT,
      default: 500,
    },
    /**
     * This width of the border around the canvas element
     */
    canvas_border_width: {
      type: ParameterType.INT,
      default: 0,
    },
    /**
     * The color of the border around the canvas element.
     */
    canvas_border_color: {
      type: ParameterType.STRING,
      default: "#000",
    },
    /**
     * Path to an image to render as the background of the canvas.
     */
    background_image: {
      type: ParameterType.IMAGE,
      default: null,
    },
    /**
     * The width of the strokes on the canvas.
     */
    stroke_width: {
      type: ParameterType.INT,
      default: 2,
    },
    /**
     * The color of the stroke on the canvas
     */
    stroke_color: {
      type: ParameterType.STRING,
      default: "#000000",
    },
    /**
     * An array of colors to render as a palette of options for stroke colors.
     */
    stroke_color_palette: {
      type: ParameterType.STRING,
      array: true,
      default: [],
    },
    /**
     * HTML content to render above or below the canvas (use `prompt_location` parameter to change location).
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /**
     * Location of the `prompt` content. Can be 'abovecanvas' or 'belowcanvas' or 'belowbutton'.
     */
    prompt_location: {
      type: ParameterType.STRING,
      default: "abovecanvas",
    },
  },
};

type Info = typeof info;

/**
 * **sketchpad**
 *
 * jsPsych plugin for displaying a canvas stimulus and getting a slider response
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/sketchpad/ sketchpad plugin documentation on jspsych.org}
 */
class SketchpadPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private display: HTMLElement;
  private params: TrialType<Info>;
  private sketchpad: HTMLCanvasElement;
  private is_drawing = false;
  private ctx: CanvasRenderingContext2D;
  private trial_finished_handler;
  private background_image;
  private strokes = [];
  private stroke = [];
  private undo_history = [];
  private current_stroke_color;
  private start_time;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    this.display = display_element;
    this.params = trial;

    document.querySelector("head").insertAdjacentHTML(
      "beforeend",
      `<style id="sketchpad-styles">
      .sketchpad-color-select { 
        cursor: pointer; height: 33px; width: 33px; border-radius: 4px; padding: 0; border: 1px solid #ccc; 
      }
    </style>`
    );

    this.current_stroke_color = trial.stroke_color;

    this.render_display();

    this.setup_event_listeners();

    this.add_background_image().then(() => {
      on_load();
    });

    this.start_time = performance.now();

    return new Promise((resolve, reject) => {
      this.trial_finished_handler = resolve;
    });
  }

  private render_display() {
    let canvas_html;
    if (this.params.canvas_shape == "rectangle") {
      canvas_html = `
        <canvas id="sketchpad-canvas" 
        width="${this.params.canvas_width}" 
        height="${this.params.canvas_height}" 
        style="border: ${this.params.canvas_border_width}px solid ${this.params.canvas_border_color};"></canvas>
      `;
    } else if (this.params.canvas_shape == "circle") {
      canvas_html = `
        <canvas id="sketchpad-canvas" 
        width="${this.params.canvas_diameter}" 
        height="${this.params.canvas_diameter}" 
        style="border: ${this.params.canvas_border_width}px solid ${
        this.params.canvas_border_color
      }; border-radius:${this.params.canvas_diameter / 2}px;">
        </canvas>
      `;
    } else {
      throw new Error(
        '`canvas_shape` parameter in sketchpad plugin must be either "rectangle" or "circle"'
      );
    }

    let sketchpad_controls = `<div id="sketchpad-controls" style="line-height: 1; width:${
      this.params.canvas_shape == "rectangle"
        ? this.params.canvas_width
        : this.params.canvas_diameter
    }px;">`;

    sketchpad_controls += `<div id="sketchpad-color-palette" style="width:50%; display: inline-block; text-align:left;">`;
    for (const color of this.params.stroke_color_palette) {
      sketchpad_controls += `<button class="sketchpad-color-select" data-color="${color}" style="background-color:${color};"></button>`;
    }
    sketchpad_controls += `</div>`;

    sketchpad_controls += `<div id="sketchpad-actions" style="width:50%; display:inline-block; right: 0; text-align:right;">
        <button class="jspsych-btn" id="sketchpad-clear">Clear</button>
        <button class="jspsych-btn" id="sketchpad-undo" disabled>Undo</button>
        <button class="jspsych-btn" id="sketchpad-redo" disabled>Redo</button>
      </div>`;

    canvas_html += sketchpad_controls;

    const finish_button_html = `<p><button class="jspsych-btn" id="sketchpad-end">Finished</button></p>`;

    let display_html;
    if (this.params.prompt !== null) {
      if (this.params.prompt_location == "abovecanvas") {
        display_html = this.params.prompt + canvas_html + finish_button_html;
      }
      if (this.params.prompt_location == "belowcanvas") {
        display_html = canvas_html + this.params.prompt + finish_button_html;
      }
      if (this.params.prompt_location == "belowbutton") {
        display_html = canvas_html + finish_button_html + this.params.prompt;
      }
    }

    this.display.innerHTML = display_html;

    this.sketchpad = this.display.querySelector("#sketchpad-canvas");
    this.ctx = this.sketchpad.getContext("2d");
  }

  private setup_event_listeners() {
    this.display.querySelector("#sketchpad-end").addEventListener("click", this.end_trial);

    this.sketchpad.addEventListener("mousedown", this.start_draw);
    this.sketchpad.addEventListener("mousemove", this.move_draw);
    this.sketchpad.addEventListener("mouseup", this.end_draw);
    this.sketchpad.addEventListener("mouseleave", this.end_draw);

    this.display.querySelector("#sketchpad-undo").addEventListener("click", this.undo);
    this.display.querySelector("#sketchpad-redo").addEventListener("click", this.redo);
    this.display.querySelector("#sketchpad-clear").addEventListener("click", this.clear);

    const color_btns = Array.from(this.display.querySelectorAll(".sketchpad-color-select"));
    for (const btn of color_btns) {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLButtonElement;
        this.current_stroke_color = target.getAttribute("data-color");
      });
    }
  }

  private add_background_image() {
    return new Promise((resolve, reject) => {
      if (this.params.background_image !== null) {
        this.background_image = new Image();
        this.background_image.src = this.params.background_image;
        this.background_image.onload = () => {
          this.ctx.drawImage(this.background_image, 0, 0);
          resolve(true);
        };
      } else {
        resolve(false);
      }
    });
  }

  private start_draw(e) {
    this.is_drawing = true;

    const x = e.clientX - this.sketchpad.getBoundingClientRect().left;
    const y = e.clientY - this.sketchpad.getBoundingClientRect().top;

    this.undo_history = [];
    (this.display.querySelector("#sketchpad-redo") as HTMLButtonElement).disabled = true;

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.strokeStyle = this.current_stroke_color;
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = this.params.stroke_width;
    this.stroke = [];
    this.stroke.push({
      x: x,
      y: y,
      color: this.current_stroke_color,
      action: "start",
      t: Math.round(performance.now() - this.start_time),
    });
  }

  private move_draw(e) {
    if (this.is_drawing) {
      const x = e.clientX - this.sketchpad.getBoundingClientRect().left;
      const y = e.clientY - this.sketchpad.getBoundingClientRect().top;

      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.stroke.push({
        x: x,
        y: y,
        action: "move",
      });
    }
  }

  private end_draw(e) {
    if (this.is_drawing) {
      this.stroke.push({
        action: "end",
        t: Math.round(performance.now() - this.start_time),
      });
      this.strokes.push(this.stroke);
      (this.display.querySelector("#sketchpad-undo") as HTMLButtonElement).disabled = false;
    }
    this.is_drawing = false;
  }

  private render_drawing() {
    this.ctx.clearRect(0, 0, this.sketchpad.width, this.sketchpad.height);
    this.ctx.drawImage(this.background_image, 0, 0);
    for (const stroke of this.strokes) {
      for (const m of stroke) {
        if (m.action == "start") {
          this.ctx.beginPath();
          this.ctx.moveTo(m.x, m.y);
          this.ctx.strokeStyle = m.color;
          this.ctx.lineJoin = "round";
          this.ctx.lineWidth = this.params.stroke_width;
        }
        if (m.action == "move") {
          this.ctx.lineTo(m.x, m.y);
          this.ctx.stroke();
        }
      }
    }
  }

  private undo() {
    this.undo_history.push(this.strokes.pop());
    (this.display.querySelector("#sketchpad-redo") as HTMLButtonElement).disabled = false;
    if (this.strokes.length == 0) {
      (this.display.querySelector("#sketchpad-undo") as HTMLButtonElement).disabled = true;
    }
    this.render_drawing();
  }

  private redo() {
    this.strokes.push(this.undo_history.pop());
    (this.display.querySelector("#sketchpad-undo") as HTMLButtonElement).disabled = false;
    if (this.undo_history.length == 0) {
      (this.display.querySelector("#sketchpad-redo") as HTMLButtonElement).disabled = true;
    }
    this.render_drawing();
  }

  private clear() {
    this.strokes = [];
    this.undo_history = [];
    this.render_drawing();
    (this.display.querySelector("#sketchpad-redo") as HTMLButtonElement).disabled = true;
    (this.display.querySelector("#sketchpad-undo") as HTMLButtonElement).disabled = true;
  }

  private end_trial() {
    this.display.innerHTML = "";

    this.jsPsych.finishTrial({
      strokes: this.strokes,
      rt: Math.round(performance.now() - this.start_time),
    });

    this.trial_finished_handler();
  }
}

export default SketchpadPlugin;
