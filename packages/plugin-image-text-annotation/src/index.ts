import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "sketchpad",
  parameters: {
    image: {
      type: ParameterType.IMAGE,
      default: undefined,
    },
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
  },
};

type Info = typeof info;

/**
 * **image-text-annotaiton**
 *
 * jsPsych plugin for annotating an image with text labels
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/image-text-annotation/ image-text-annotation plugin documentation on jspsych.org}
 */
class ImageTextAnnotationPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private img_container: HTMLElement;
  private is_drawing = false;
  private start_x: number;
  private start_y: number;
  private end_x: number;
  private end_y: number;
  private active_box: AnnotationBox;
  private active_label: string;
  private boxes: Array<AnnotationBox> = [];

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.add_css();
    this.renderDisplay(display_element, trial);
    this.addEvents(display_element, trial);
  }

  private renderDisplay(display_element, trial) {
    let html = `<div id="jspsych-annotation-display">`;
    if (trial.prompt !== null) {
      html += `<div id='instructions'>${trial.prompt}</div>`;
    }
    html += `
      <div id='main-display'>
        <div id='annotated-image-container'>
          <img src="${trial.image}" draggable="false"></img>
        </div>
        <div id='annotation-options'>
          <div><input type="radio" id="opt1" name="annotate_label" value="foo"><label for="opt1">Foo</label></div>
          <div><input type="radio" id="opt2" name="annotate_label" value="bar"><label for="opt2">Bar</label></div>
          <div><input type="radio" id="opt3" name="annotate_label" value=""><label for="opt3"><input type="text"></label></div>
        </div>
      </div>
    `;
    html += `</div>`;

    display_element.innerHTML = html;

    this.img_container = display_element.querySelector("#annotated-image-container");
  }

  private addEvents(display_element, trial) {
    this.img_container.addEventListener("mousedown", this.start_box);

    const radios = display_element.querySelectorAll('input[type="radio"]');
    for (const r of radios) {
      r.addEventListener("change", (e) => {
        this.active_label = e.target.value;
      });
    }

    this.img_container.addEventListener("mousemove", this.sort_boxes);
  }

  private add_css() {
    document.querySelector("head").insertAdjacentHTML(
      "beforeend",
      `<style id="image-text-annotation-styles">
        #jspsych-annotation-display #main-display {
          display: flex;
        }

        #jspsych-annotation-display #annotated-image-container {
          cursor: crosshair;
          position: relative;
        }

        #jspsych-annotation-display #annotated-image-container img {
          
        }

        #jspsych-annotation-display #annotated-image-container .annotation-box {
          border: 1px solid green;
          position: absolute;
          color:green;
        }

        #jspsych-annotation-display #annotated-image-container .annotation-box:hover {
          border: 1px solid yellow;
          position: absolute;
          color:yellow;
        }

        #jspsych-annotation-display #annotated-image-container .annotation-box .annotation-box-label {
          font-size:10px;
          font-family:monospace;
          margin:0px;
          text-align:left;
          line-height:1em;
        }

        .annotation-box-remove {
          visibility: hidden;
        }

        #jspsych-annotation-display #annotated-image-container .annotation-box:hover .annotation-box-remove {
          visibility: visible;
          font-size:15px;
          font-family:monospace;
          margin:0px;
          text-align:left;
          line-height:1em;
          position: absolute;
          top:0;
          right:0;
          background-color: green;
          color: white;
          width:1em;
          height:1em;
          text-align: center;
          cursor: pointer;
        }

        #jspsych-annotation-display #annotation-options {
          text-align: left;
          padding-left: 24px;
        }
      </style>`
    );
  }

  private start_box(e) {
    const x = Math.round(e.clientX - this.img_container.getBoundingClientRect().left);
    const y = Math.round(e.clientY - this.img_container.getBoundingClientRect().top);

    this.is_drawing = true;

    this.active_box = new AnnotationBox(x, y, this.boxes);

    this.img_container.appendChild(this.active_box.getElement());

    this.img_container.addEventListener("mousemove", this.move_box);
    this.img_container.addEventListener("mouseup", this.stop_box);
  }

  private move_box(e) {
    if (this.is_drawing) {
      const x = Math.round(e.clientX - this.img_container.getBoundingClientRect().left);
      const y = Math.round(e.clientY - this.img_container.getBoundingClientRect().top);

      this.active_box.setEndCoords(x, y);
    }
  }

  private stop_box() {
    if (this.is_drawing) {
      this.active_box.finishDrawing();

      this.active_box.setLabel(this.active_label);

      this.active_box = null;
      this.img_container.removeEventListener("mousemove", this.move_box);

      this.is_drawing = false;
    }
  }

  private sort_boxes() {
    const original_order = this.boxes.map((box) => box.area());
    const sizes = this.boxes.map((box) => box.area());
    sizes.sort((a, b) => b - a);

    let z = 0;
    for (const s of sizes) {
      this.boxes[original_order.indexOf(s)].setZIndex(z.toString());
      z++;
    }
  }
}

class AnnotationBox {
  private label = "?";
  private element: HTMLElement;
  private start_x;
  private start_y;
  private end_x;
  private end_y;
  private is_hovered = false;
  private box_list: Array<AnnotationBox>;

  constructor(x, y, box_list) {
    this.start_x = x;
    this.start_y = y;

    const el = document.createElement("div");
    el.setAttribute("class", "annotation-box");
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    this.element = el;

    this.box_list = box_list;
  }

  private hover(e) {
    this.is_hovered = true;
  }

  private exit_hover(e) {
    this.is_hovered = false;
  }

  setLabel(label) {
    if (label) {
      this.label = label;
    }
    this.element.querySelector(".annotation-box-label").innerHTML = this.label;
  }

  getLabel() {
    return this.label;
  }

  getElement() {
    return this.element;
  }

  setEndCoords(x, y) {
    this.end_x = x;
    this.end_y = y;

    this.element.style.width = `${Math.abs(this.end_x - this.start_x)}px`;
    this.element.style.height = `${Math.abs(this.end_y - this.start_y)}px`;

    if (this.start_x <= this.end_x) {
      this.element.style.left = `${this.start_x}px`;
    } else {
      this.element.style.left = `${this.end_x}px`;
    }

    if (this.start_y <= this.end_y) {
      this.element.style.top = `${this.start_y}px`;
    } else {
      this.element.style.top = `${this.end_y}px`;
    }
  }

  finishDrawing() {
    this.element.innerHTML = `
      <p class="annotation-box-label"></p>
      <span class="annotation-box-remove">X</span>
    `;

    this.box_list.push(this);

    this.element.addEventListener("mouseenter", (e) => this.hover(e));
    this.element.addEventListener("mouseleave", (e) => this.exit_hover(e));
    this.element.querySelector(".annotation-box-remove").addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    this.element.querySelector(".annotation-box-remove").addEventListener("mouseup", (e) => {
      e.stopPropagation();
    });
    this.element.querySelector(".annotation-box-remove").addEventListener("click", (e) => {
      e.preventDefault();
      this.remove();
    });
  }

  area() {
    const { width, height } = this.element.getBoundingClientRect();
    return width * height;
  }

  setZIndex(z: string) {
    this.element.style.zIndex = z;
  }

  remove() {
    this.element.remove();
    this.box_list = this.box_list.filter((x) => {
      x !== this;
    });
  }
}

export default ImageTextAnnotationPlugin;
