import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "free-sort",
  parameters: {
    /** Array of images to be displayed and sorted. */
    stimuli: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimuli",
      default: undefined,
      array: true,
    },
    /** Height of items in pixels. */
    stim_height: {
      type: ParameterType.INT,
      pretty_name: "Stimulus height",
      default: 100,
    },
    /** Width of items in pixels */
    stim_width: {
      type: ParameterType.INT,
      pretty_name: "Stimulus width",
      default: 100,
    },
    /** How much larger to make the stimulus while moving (1 = no scaling) */
    scale_factor: {
      type: ParameterType.FLOAT,
      pretty_name: "Stimulus scaling factor",
      default: 1.5,
    },
    /** The height in pixels of the container that subjects can move the stimuli in. */
    sort_area_height: {
      type: ParameterType.INT,
      pretty_name: "Sort area height",
      default: 700,
    },
    /** The width in pixels of the container that subjects can move the stimuli in. */
    sort_area_width: {
      type: ParameterType.INT,
      pretty_name: "Sort area width",
      default: 700,
    },
    /** The shape of the sorting area */
    sort_area_shape: {
      type: ParameterType.SELECT,
      pretty_name: "Sort area shape",
      options: ["square", "ellipse"],
      default: "ellipse",
    },
    /** HTML to display above/below the sort area. It can be used to provide a reminder about the action the subject is supposed to take. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: "",
    },
    /** Indicates whether to show prompt "above" or "below" the sorting area. */
    prompt_location: {
      type: ParameterType.SELECT,
      pretty_name: "Prompt location",
      options: ["above", "below"],
      default: "above",
    },
    /** The text that appears on the button to continue to the next trial. */
    button_label: {
      type: ParameterType.STRING,
      pretty_name: "Button label",
      default: "Continue",
    },
    /**
     * If true, the sort area border color will change while items are being moved in and out of the sort area,
     * and the background color will change once all items have been moved into the sort area.
     * If false, the border will remain black and the background will remain white throughout the trial.
     */
    change_border_background_color: {
      type: ParameterType.BOOL,
      pretty_name: "Change border background color",
      default: true,
    },
    /**
     * If change_border_background_color is true, the sort area border will change to this color
     * when an item is being moved into the sort area, and the background will change to this color
     * when all of the items have been moved into the sort area.
     */
    border_color_in: {
      type: ParameterType.STRING,
      pretty_name: "Border color - in",
      default: "#a1d99b",
    },
    /**
     * If change_border_background_color is true, this will be the color of the sort area border
     * when there are one or more items that still need to be moved into the sort area.
     */
    border_color_out: {
      type: ParameterType.STRING,
      pretty_name: "Border color - out",
      default: "#fc9272",
    },
    /** The width in pixels of the border around the sort area. If null, the border width defaults to 3% of the sort area height. */
    border_width: {
      type: ParameterType.INT,
      pretty_name: "Border width",
      default: null,
    },
    /**
     * Text to display when there are one or more items that still need to be placed in the sort area.
     * If "%n%" is included in the string, it will be replaced with the number of items that still need to be moved inside.
     * If "%s%" is included in the string, a "s" will be included when the number of items remaining is greater than one.
     * */
    counter_text_unfinished: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Counter text unfinished",
      default: "You still need to place %n% item%s% inside the sort area.",
    },
    /** Text that will take the place of the counter_text_unfinished text when all items have been moved inside the sort area. */
    counter_text_finished: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Counter text finished",
      default: "All items placed. Feel free to reposition items if necessary.",
    },
    /**
     * If false, the images will be positioned to the left and right of the sort area when the trial loads.
     * If true, the images will be positioned at random locations inside the sort area when the trial loads.
     */
    stim_starts_inside: {
      type: ParameterType.BOOL,
      pretty_name: "Stim starts inside",
      default: false,
    },
    /**
     * When the images appear outside the sort area, this determines the x-axis spread of the image columns.
     * Default value is 1. Values less than 1 will compress the image columns along the x-axis, and values greater than 1 will spread them farther apart.
     */
    column_spread_factor: {
      type: ParameterType.FLOAT,
      pretty_name: "column spread factor",
      default: 1,
    },
  },
};

type Info = typeof info;

/**
 * **free-sort**
 *
 * jsPsych plugin for drag-and-drop sorting of a collection of images
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-free-sort/ free-sort plugin documentation on jspsych.org}
 */
class FreeSortPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var start_time = performance.now();

    // can't change trial properties (const), so create new variables for properties that might need to be changed
    var border_color_out = trial.border_color_out;
    var border_width = trial.border_width;
    var stimuli = trial.stimuli;

    if (trial.change_border_background_color == false) {
      border_color_out = "#000000";
    }

    if (trial.border_width == null) {
      border_width = trial.sort_area_height * 0.03;
    }

    let html =
      "<div " +
      'id="jspsych-free-sort-arena" ' +
      'class="jspsych-free-sort-arena" ' +
      'style="position: relative; width:' +
      trial.sort_area_width +
      "px; height:" +
      trial.sort_area_height +
      'px; margin: auto;"</div>';

    // another div for border
    html +=
      "<div " +
      'id="jspsych-free-sort-border" ' +
      'class="jspsych-free-sort-border" ' +
      'style="position: relative; width:' +
      trial.sort_area_width * 0.94 +
      "px; height:" +
      trial.sort_area_height * 0.94 +
      "px; " +
      "border:" +
      border_width +
      "px solid " +
      border_color_out +
      "; margin: auto; line-height: 0em; ";

    if (trial.sort_area_shape == "ellipse") {
      html += 'webkit-border-radius: 50%; moz-border-radius: 50%; border-radius: 50%"></div>';
    } else {
      html += 'webkit-border-radius: 0%; moz-border-radius: 0%; border-radius: 0%"></div>';
    }

    // variable that has the prompt text and counter
    const html_text =
      '<div style="line-height: 1.0em;">' +
      trial.prompt +
      '<p id="jspsych-free-sort-counter" style="display: inline-block;">' +
      get_counter_text(stimuli.length) +
      "</p></div>";

    // position prompt above or below
    if (trial.prompt_location == "below") {
      html += html_text;
    } else {
      html = html_text + html;
    }
    // add button
    html +=
      '<div><button id="jspsych-free-sort-done-btn" class="jspsych-btn" ' +
      'style="margin-top: 5px; margin-bottom: 15px; visibility: hidden;">' +
      trial.button_label +
      "</button></div>";

    display_element.innerHTML = html;

    // store initial location data
    let init_locations = [];

    if (!trial.stim_starts_inside) {
      // determine number of rows and colums, must be a even number
      let num_rows = Math.ceil(Math.sqrt(stimuli.length));
      if (num_rows % 2 != 0) {
        num_rows = num_rows + 1;
      }

      // compute coords for left and right side of arena
      var r_coords = [];
      var l_coords = [];
      for (const x of make_arr(0, trial.sort_area_width - trial.stim_width, num_rows)) {
        for (const y of make_arr(0, trial.sort_area_height - trial.stim_height, num_rows)) {
          if (x > (trial.sort_area_width - trial.stim_width) * 0.5) {
            //r_coords.push({ x:x, y:y } )
            r_coords.push({
              x: x + trial.sort_area_width * (0.5 * trial.column_spread_factor),
              y: y,
            });
          } else {
            l_coords.push({
              x: x - trial.sort_area_width * (0.5 * trial.column_spread_factor),
              y: y,
            });
            //l_coords.push({ x:x, y:y } )
          }
        }
      }

      // repeat coordinates until you have enough coords (may be obsolete)
      while (r_coords.length + l_coords.length < stimuli.length) {
        r_coords = r_coords.concat(r_coords);
        l_coords = l_coords.concat(l_coords);
      }
      // reverse left coords, so that coords closest to arena is used first
      l_coords = l_coords.reverse();

      // shuffle stimuli, so that starting positions are random
      stimuli = shuffle(stimuli);
    }

    let inside = [];
    for (let i = 0; i < stimuli.length; i++) {
      var coords;
      if (trial.stim_starts_inside) {
        coords = random_coordinate(
          trial.sort_area_width - trial.stim_width,
          trial.sort_area_height - trial.stim_height
        );
      } else {
        if (i % 2 == 0) {
          coords = r_coords[Math.floor(i * 0.5)];
        } else {
          coords = l_coords[Math.floor(i * 0.5)];
        }
      }

      display_element.querySelector("#jspsych-free-sort-arena").innerHTML +=
        "<img " +
        'src="' +
        stimuli[i] +
        '" ' +
        'data-src="' +
        stimuli[i] +
        '" ' +
        'class="jspsych-free-sort-draggable" ' +
        'draggable="false" ' +
        'id="jspsych-free-sort-draggable-' +
        i +
        '" ' +
        'style="position: absolute; cursor: move; width:' +
        trial.stim_width +
        "px; height:" +
        trial.stim_height +
        "px; top:" +
        coords.y +
        "px; left:" +
        coords.x +
        'px;">' +
        "</img>";

      init_locations.push({
        src: stimuli[i],
        x: coords.x,
        y: coords.y,
      });
      if (trial.stim_starts_inside) {
        inside.push(true);
      } else {
        inside.push(false);
      }
    }

    // moves within a trial
    let moves = [];

    // are objects currently inside
    let cur_in = false;

    // draggable items
    const draggables = display_element.querySelectorAll(".jspsych-free-sort-draggable");

    // button (will show when all items are inside) and border (will change color)
    const border: HTMLElement = display_element.querySelector("#jspsych-free-sort-border");
    const button: HTMLButtonElement = display_element.querySelector("#jspsych-free-sort-done-btn");

    // when trial starts, modify text and border/background if all items are inside (stim_starts_inside: true)
    if (inside.some(Boolean) && trial.change_border_background_color) {
      border.style.borderColor = trial.border_color_in;
    }
    if (inside.every(Boolean)) {
      if (trial.change_border_background_color) {
        border.style.background = trial.border_color_in;
      }
      button.style.visibility = "visible";
      display_element.querySelector("#jspsych-free-sort-counter").innerHTML =
        trial.counter_text_finished;
    }

    let start_event_name = "mousedown";
    let move_event_name = "mousemove";
    let end_event_name = "mouseup";
    if (typeof document.ontouchend !== "undefined") {
      // for touch devices
      start_event_name = "touchstart";
      move_event_name = "touchmove";
      end_event_name = "touchend";
    }

    for (let i = 0; i < draggables.length; i++) {
      draggables[i].addEventListener(start_event_name, (event: MouseEvent | TouchEvent) => {
        let pageX: number;
        let pageY: number;
        if (event instanceof MouseEvent) {
          pageX = event.pageX;
          pageY = event.pageY;
        }
        //if (typeof document.ontouchend !== "undefined") {
        if (event instanceof TouchEvent) {
          // for touch devices
          event.preventDefault();
          const touchObject = event.changedTouches[0];
          pageX = touchObject.pageX;
          pageY = touchObject.pageY;
        }

        let elem = event.currentTarget as HTMLImageElement;
        let x = pageX - elem.offsetLeft;
        let y = pageY - elem.offsetTop - window.scrollY;
        elem.style.transform = "scale(" + trial.scale_factor + "," + trial.scale_factor + ")";

        let move_event = (e) => {
          let clientX = e.clientX;
          let clientY = e.clientY;
          if (typeof document.ontouchend !== "undefined") {
            // for touch devices
            const touchObject = e.changedTouches[0];
            clientX = touchObject.clientX;
            clientY = touchObject.clientY;
          }

          cur_in = inside_ellipse(
            clientX - x,
            clientY - y,
            trial.sort_area_width * 0.5 - trial.stim_width * 0.5,
            trial.sort_area_height * 0.5 - trial.stim_height * 0.5,
            trial.sort_area_width * 0.5,
            trial.sort_area_height * 0.5,
            trial.sort_area_shape == "square"
          );
          elem.style.top =
            Math.min(
              trial.sort_area_height - trial.stim_height * 0.5,
              Math.max(-trial.stim_height * 0.5, clientY - y)
            ) + "px";
          elem.style.left =
            Math.min(
              trial.sort_area_width * 1.5 - trial.stim_width,
              Math.max(-trial.sort_area_width * 0.5, clientX - x)
            ) + "px";

          // modify border while items is being moved
          if (trial.change_border_background_color) {
            if (cur_in) {
              border.style.borderColor = trial.border_color_in;
              border.style.background = "None";
            } else {
              border.style.borderColor = border_color_out;
              border.style.background = "None";
            }
          }

          // replace in overall array, grab index from item id
          var elem_number = parseInt(elem.id.split("jspsych-free-sort-draggable-")[1], 10);
          inside.splice(elem_number, 1, cur_in);

          // modify text and background if all items are inside
          if (inside.every(Boolean)) {
            if (trial.change_border_background_color) {
              border.style.background = trial.border_color_in;
            }
            button.style.visibility = "visible";
            display_element.querySelector("#jspsych-free-sort-counter").innerHTML =
              trial.counter_text_finished;
          } else {
            border.style.background = "none";
            button.style.visibility = "hidden";
            display_element.querySelector("#jspsych-free-sort-counter").innerHTML =
              get_counter_text(inside.length - inside.filter(Boolean).length);
          }
        };
        document.addEventListener(move_event_name, move_event);

        var end_event = (e) => {
          document.removeEventListener(move_event_name, move_event);
          elem.style.transform = "scale(1, 1)";
          if (trial.change_border_background_color) {
            if (inside.every(Boolean)) {
              border.style.background = trial.border_color_in;
              border.style.borderColor = trial.border_color_in;
            } else {
              border.style.background = "none";
              border.style.borderColor = border_color_out;
            }
          }
          moves.push({
            src: elem.dataset.src,
            x: elem.offsetLeft,
            y: elem.offsetTop,
          });
          document.removeEventListener(end_event_name, end_event);
        };
        document.addEventListener(end_event_name, end_event);
      });
    }

    display_element.querySelector("#jspsych-free-sort-done-btn").addEventListener("click", () => {
      if (inside.every(Boolean)) {
        const end_time = performance.now();
        const rt = Math.round(end_time - start_time);
        // gather data
        const items = display_element.querySelectorAll<HTMLElement>(".jspsych-free-sort-draggable");
        // get final position of all items
        let final_locations = [];
        for (let i = 0; i < items.length; i++) {
          final_locations.push({
            src: items[i].dataset.src,
            x: parseInt(items[i].style.left),
            y: parseInt(items[i].style.top),
          });
        }

        const trial_data = {
          init_locations: init_locations,
          moves: moves,
          final_locations: final_locations,
          rt: rt,
        };

        // advance to next part
        display_element.innerHTML = "";
        this.jsPsych.finishTrial(trial_data);
      }
    });

    function get_counter_text(n: number) {
      var text_out = "";
      var text_bits = trial.counter_text_unfinished.split("%");
      for (var i = 0; i < text_bits.length; i++) {
        if (i % 2 === 0) {
          text_out += text_bits[i];
        } else {
          if (text_bits[i] == "n") {
            text_out += n.toString();
          } else if (text_bits[i] == "s" && n > 1) {
            text_out += "s";
          }
        }
      }
      return text_out;
    }

    // helper functions
    function shuffle(array) {
      // define three variables
      let cur_idx = array.length,
        tmp_val,
        rand_idx;

      // While there remain elements to shuffle...
      while (0 !== cur_idx) {
        // Pick a remaining element...
        rand_idx = Math.floor(Math.random() * cur_idx);
        cur_idx -= 1;

        // And swap it with the current element.
        tmp_val = array[cur_idx];
        array[cur_idx] = array[rand_idx];
        array[rand_idx] = tmp_val;
      }
      return array;
    }

    function make_arr(startValue, stopValue, cardinality) {
      const step = (stopValue - startValue) / (cardinality - 1);
      let arr = [];
      for (let i = 0; i < cardinality; i++) {
        arr.push(startValue + step * i);
      }
      return arr;
    }

    function inside_ellipse(x, y, x0, y0, rx, ry, square = false) {
      const results = [];
      if (square) {
        return Math.abs(x - x0) <= rx && Math.abs(y - y0) <= ry;
      } else {
        return (
          (x - x0) * (x - x0) * (ry * ry) + (y - y0) * (y - y0) * (rx * rx) <= rx * rx * (ry * ry)
        );
      }
    }

    function random_coordinate(max_width, max_height) {
      const rnd_x = Math.floor(Math.random() * (max_width - 1));
      const rnd_y = Math.floor(Math.random() * (max_height - 1));
      return {
        x: rnd_x,
        y: rnd_y,
      };
    }
  }
}

export default FreeSortPlugin;
