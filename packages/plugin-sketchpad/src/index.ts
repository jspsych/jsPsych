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
     * Background color of the canvas.
     */
    background_color: {
      type: ParameterType.STRING,
      default: "#ffffff",
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
    /**
     * Whether to save the final image in the data as dataURL
     */
    save_final_image: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * Whether to save the set of strokes that generated the image
     */
    save_strokes: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * If this key is held down then it is like the mouse button being clicked for controlling
     * the flow of the "ink".
     */
    key_to_draw: {
      type: ParameterType.KEY,
      default: null,
    },
    /**
     * Whether to show the button that ends the trial
     */
    show_finished_button: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * The label for the button that ends the trial
     */
    finished_button_label: {
      type: ParameterType.STRING,
      default: "Finished",
    },
    /**
     * Whether to show the button that clears the entire drawing.
     */
    show_clear_button: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * The label for the button that clears the entire drawing.
     */
    clear_button_label: {
      type: ParameterType.STRING,
      default: "Clear",
    },
    /**
     * Whether to show the button that enables an undo action.
     */
    show_undo_button: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * The label for the button that performs an undo action.
     */
    undo_button_label: {
      type: ParameterType.STRING,
      default: "Undo",
    },
    /**
     * Whether to show the button that enables an redo action. `show_undo_button` must also
     * be `true` for the redo button to show.
     */
    show_redo_button: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * The label for the button that performs an redo action.
     */
    redo_button_label: {
      type: ParameterType.STRING,
      default: "Redo",
    },
    /**
     * Array of keys that will end the trial when pressed.
     */
    choices: {
      type: ParameterType.KEYS,
      default: "NO_KEYS",
    },
    /**
     * Length of time before trial ends. If `null` the trial will not timeout.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /**
     * Whether to show a countdown timer for the remaining trial duration
     */
    show_countdown_trial_duration: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * The html for the countdown timer.
     */
    countdown_timer_html: {
      type: ParameterType.HTML_STRING,
      default: `<span id="sketchpad-timer"></span> remaining`,
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
  private mouse_position = { x: 0, y: 0 };
  private draw_key_held = false;
  private timer_interval;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    this.display = display_element;
    this.params = trial;
    this.current_stroke_color = trial.stroke_color;

    this.init_display();

    this.setup_event_listeners();

    this.add_background_color();
    this.add_background_image().then(() => {
      on_load();
    });

    this.start_time = performance.now();
    this.set_trial_duration_timer();

    return new Promise((resolve, reject) => {
      this.trial_finished_handler = resolve;
    });
  }

  private init_display() {
    this.add_css();

    let canvas_html;
    if (this.params.canvas_shape == "rectangle") {
      canvas_html = `
        <canvas id="sketchpad-canvas" 
        width="${this.params.canvas_width}" 
        height="${this.params.canvas_height}" 
        class="sketchpad-rectangle"></canvas>
      `;
    } else if (this.params.canvas_shape == "circle") {
      canvas_html = `
        <canvas id="sketchpad-canvas" 
        width="${this.params.canvas_diameter}" 
        height="${this.params.canvas_diameter}" 
        class="sketchpad-circle">
        </canvas>
      `;
    } else {
      throw new Error(
        '`canvas_shape` parameter in sketchpad plugin must be either "rectangle" or "circle"'
      );
    }

    let sketchpad_controls = `<div id="sketchpad-controls">`;

    sketchpad_controls += `<div id="sketchpad-color-palette">`;
    for (const color of this.params.stroke_color_palette) {
      sketchpad_controls += `<button class="sketchpad-color-select" data-color="${color}" style="background-color:${color};"></button>`;
    }
    sketchpad_controls += `</div>`;

    sketchpad_controls += `<div id="sketchpad-actions">`;
    if (this.params.show_clear_button) {
      sketchpad_controls += `<button class="jspsych-btn" id="sketchpad-clear" disabled>${this.params.clear_button_label}</button>`;
    }
    if (this.params.show_undo_button) {
      sketchpad_controls += `<button class="jspsych-btn" id="sketchpad-undo" disabled>${this.params.undo_button_label}</button>`;
      if (this.params.show_redo_button) {
        sketchpad_controls += `<button class="jspsych-btn" id="sketchpad-redo" disabled>${this.params.redo_button_label}</button>`;
      }
    }
    sketchpad_controls += `</div></div>`;

    canvas_html += sketchpad_controls;

    let finish_button_html = "";
    if (this.params.show_finished_button) {
      finish_button_html = `<p id="finish-btn"><button class="jspsych-btn" id="sketchpad-end">${this.params.finished_button_label}</button></p>`;
    }

    let timer_html = "";
    if (this.params.show_countdown_trial_duration && this.params.trial_duration) {
      timer_html = `<p id="countdown-timer">${this.params.countdown_timer_html}</p>`;
    }

    let display_html;
    if (this.params.prompt !== null) {
      if (this.params.prompt_location == "abovecanvas") {
        display_html = this.params.prompt + timer_html + canvas_html + finish_button_html;
      }
      if (this.params.prompt_location == "belowcanvas") {
        display_html = timer_html + canvas_html + this.params.prompt + finish_button_html;
      }
      if (this.params.prompt_location == "belowbutton") {
        display_html = timer_html + canvas_html + finish_button_html + this.params.prompt;
      }
    } else {
      display_html = timer_html + canvas_html + finish_button_html;
    }

    this.display.innerHTML = display_html;

    this.sketchpad = this.display.querySelector("#sketchpad-canvas");
    this.ctx = this.sketchpad.getContext("2d");
  }

  private setup_event_listeners() {
    document.addEventListener("pointermove", (e) => {
      this.mouse_position = { x: e.clientX, y: e.clientY };
    });

    if (this.params.show_finished_button) {
      this.display.querySelector("#sketchpad-end").addEventListener("click", () => {
        this.end_trial("button");
      });
    }

    this.sketchpad.addEventListener("pointerdown", this.start_draw);
    this.sketchpad.addEventListener("pointermove", this.move_draw);
    this.sketchpad.addEventListener("pointerup", this.end_draw);
    this.sketchpad.addEventListener("pointerleave", this.end_draw);
    this.sketchpad.addEventListener("pointercancel", this.end_draw);

    if (this.params.key_to_draw !== null) {
      document.addEventListener("keydown", (e) => {
        if (e.key == this.params.key_to_draw && !this.is_drawing && !this.draw_key_held) {
          this.draw_key_held = true;
          if (
            document.elementFromPoint(this.mouse_position.x, this.mouse_position.y) ==
            this.sketchpad
          ) {
            this.sketchpad.dispatchEvent(
              new PointerEvent("pointerdown", {
                clientX: this.mouse_position.x,
                clientY: this.mouse_position.y,
              })
            );
          }
        }
      });

      document.addEventListener("keyup", (e) => {
        if (e.key == this.params.key_to_draw) {
          this.draw_key_held = false;
          if (
            document.elementFromPoint(this.mouse_position.x, this.mouse_position.y) ==
            this.sketchpad
          ) {
            this.sketchpad.dispatchEvent(
              new PointerEvent("pointerup", {
                clientX: this.mouse_position.x,
                clientY: this.mouse_position.y,
              })
            );
          }
        }
      });
    }

    if (this.params.show_undo_button) {
      this.display.querySelector("#sketchpad-undo").addEventListener("click", this.undo);
      if (this.params.show_redo_button) {
        this.display.querySelector("#sketchpad-redo").addEventListener("click", this.redo);
      }
    }
    if (this.params.show_clear_button) {
      this.display.querySelector("#sketchpad-clear").addEventListener("click", this.clear);
    }

    const color_btns = Array.from(this.display.querySelectorAll(".sketchpad-color-select"));
    for (const btn of color_btns) {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLButtonElement;
        this.current_stroke_color = target.getAttribute("data-color");
      });
    }

    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: this.after_key_response,
      valid_responses: this.params.choices,
      persist: false,
      allow_held_key: false,
    });
  }

  private add_css() {
    document.querySelector("head").insertAdjacentHTML(
      "beforeend",
      `<style id="sketchpad-styles">
        #sketchpad-controls {
          line-height: 1; 
          width:${
            this.params.canvas_shape == "rectangle"
              ? this.params.canvas_width + this.params.canvas_border_width * 2
              : this.params.canvas_diameter + this.params.canvas_border_width * 2
          }px; 
          display: flex; 
          justify-content: space-between; 
          flex-wrap: wrap;
          margin: auto;
        }
        #sketchpad-color-palette { 
          display: inline-block; text-align:left; flex-grow: 1;
        }
        .sketchpad-color-select { 
          cursor: pointer; height: 33px; width: 33px; border-radius: 4px; padding: 0; border: 1px solid #ccc; 
        }
        #sketchpad-actions {
          display:inline-block; text-align:right; flex-grow: 1;
        }
        #sketchpad-actions button {
          margin-left: 4px;
        }
        #sketchpad-canvas {
          touch-action: none;
          border: ${this.params.canvas_border_width}px solid ${this.params.canvas_border_color};
        }
        .sketchpad-circle {
          border-radius: ${this.params.canvas_diameter / 2}px;
        }
        #countdown-timer {
          width:${
            this.params.canvas_shape == "rectangle"
              ? this.params.canvas_width + this.params.canvas_border_width * 2
              : this.params.canvas_diameter + this.params.canvas_border_width * 2
          }px; 
          text-align: right;
          font-size: 12px; 
          margin-bottom: 0.2em;
        }
      </style>`
    );
  }

  private add_background_color() {
    this.ctx.fillStyle = this.params.background_color;
    if (this.params.canvas_shape == "rectangle") {
      this.ctx.fillRect(0, 0, this.params.canvas_width, this.params.canvas_height);
    }
    if (this.params.canvas_shape == "circle") {
      this.ctx.fillRect(0, 0, this.params.canvas_diameter, this.params.canvas_diameter);
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

    const x = Math.round(e.clientX - this.sketchpad.getBoundingClientRect().left);
    const y = Math.round(e.clientY - this.sketchpad.getBoundingClientRect().top);

    this.undo_history = [];
    this.set_redo_btn_state(false);

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

    this.sketchpad.releasePointerCapture(e.pointerId);
  }

  private move_draw(e) {
    if (this.is_drawing) {
      const x = Math.round(e.clientX - this.sketchpad.getBoundingClientRect().left);
      const y = Math.round(e.clientY - this.sketchpad.getBoundingClientRect().top);

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
      this.set_undo_btn_state(true);
      this.set_clear_btn_state(true);
    }
    this.is_drawing = false;
  }

  private render_drawing() {
    this.ctx.clearRect(0, 0, this.sketchpad.width, this.sketchpad.height);
    this.add_background_color();
    if (this.background_image) {
      this.ctx.drawImage(this.background_image, 0, 0);
    }
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
    this.set_redo_btn_state(true);
    if (this.strokes.length == 0) {
      this.set_undo_btn_state(false);
    }
    this.render_drawing();
  }

  private redo() {
    this.strokes.push(this.undo_history.pop());
    this.set_undo_btn_state(true);
    if (this.undo_history.length == 0) {
      this.set_redo_btn_state(false);
    }
    this.render_drawing();
  }

  private clear() {
    this.strokes = [];
    this.undo_history = [];
    this.render_drawing();
    this.set_redo_btn_state(false);
    this.set_undo_btn_state(false);
    this.set_clear_btn_state(false);
  }

  private set_undo_btn_state(enabled: boolean) {
    if (this.params.show_undo_button) {
      (this.display.querySelector("#sketchpad-undo") as HTMLButtonElement).disabled = !enabled;
    }
  }

  private set_redo_btn_state(enabled: boolean) {
    if (this.params.show_undo_button && this.params.show_redo_button) {
      (this.display.querySelector("#sketchpad-redo") as HTMLButtonElement).disabled = !enabled;
    }
  }

  private set_clear_btn_state(enabled: boolean) {
    if (this.params.show_clear_button) {
      (this.display.querySelector("#sketchpad-clear") as HTMLButtonElement).disabled = !enabled;
    }
  }

  private set_trial_duration_timer() {
    if (this.params.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.end_trial();
      }, this.params.trial_duration);
      if (this.params.show_countdown_trial_duration) {
        this.timer_interval = setInterval(() => {
          const remaining = this.params.trial_duration - (performance.now() - this.start_time);
          let minutes = Math.floor(remaining / 1000 / 60);
          let seconds = Math.ceil((remaining - minutes * 1000 * 60) / 1000);
          if (seconds == 60) {
            seconds = 0;
            minutes++;
          }
          const minutes_str = minutes.toString();
          const seconds_str = seconds.toString().padStart(2, "0");
          const timer_span = this.display.querySelector("#sketchpad-timer");
          if (timer_span) {
            timer_span.innerHTML = `${minutes_str}:${seconds_str}`;
          }
          if (remaining <= 0) {
            if (timer_span) {
              timer_span.innerHTML = `0:00`;
            }
            clearInterval(this.timer_interval);
          }
        }, 250);
      }
    }
  }

  private after_key_response(info) {
    this.end_trial(info.key);
  }

  private end_trial(response = null) {
    this.jsPsych.pluginAPI.clearAllTimeouts();
    this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
    clearInterval(this.timer_interval);

    const trial_data = <any>{};

    trial_data.rt = Math.round(performance.now() - this.start_time);
    trial_data.response = response;

    if (this.params.save_final_image) {
      trial_data.png = this.sketchpad.toDataURL();
    }

    if (this.params.save_strokes) {
      trial_data.strokes = this.strokes;
    }

    this.display.innerHTML = "";

    document.querySelector("#sketchpad-styles").remove();

    this.jsPsych.finishTrial(trial_data);

    this.trial_finished_handler();
  }
}

export default SketchpadPlugin;
