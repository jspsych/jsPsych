/*
 *  virtual chinrest plugin for jsPsych, based on Qisheng Li 11/2019. /// https://github.com/QishengLi/virtual_chinrest
    
    Modified by Gustavo Juantorena 08/2020 // https://github.com/GEJ1

    Contributions from Peter J. Kohler: https://github.com/pjkohler
 */

jsPsych.plugins["virtual-chinrest"] = (function () {
  var plugin = {};

  plugin.info = {
    name: "virtual-chinrest",
    parameters: {
      resize_units: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Resize units",
        default: "none",
        description:
          'What units to resize to? ["none"/"cm"/"inch"/"deg"]. If "none", no resizing will be done to the jsPsych content after this trial.',
      },
      pixels_per_unit: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Pixels per unit",
        default: 100,
        description:
          "After the scaling factor is applied, this many pixels will equal one unit of measurement.",
      },
      // mouse_adjustment: {
      //   type: jsPsych.plugins.parameterType.BOOL,
      //   pretty_name: "Adjust Using Mouse?",
      //   default: true,
      // },
      adjustment_prompt: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Adjustment prompt",
        default: `
          <div style="text-align: left;">
          <p>Click and drag the lower right corner of the image until it is the same size as a credit card held up to the screen.</p>
          <p>You can use any card that is the same size as a credit card, like a membership card or driver's license.</p>
          <p>If you do not have access to a real card you can use a ruler to measure the image width to 3.37 inches or 85.6 mm.</p>
          </div>`,
        description:
          "Any content here will be displayed above the card stimulus.",
      },
      adjustment_button_prompt: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Adjustment button prompt",
        default: "Click here when the image is the correct size",
        description:
          " Content of the button displayed below the card stimulus.",
      },
      item_path: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Item path",
        default: "img/card.png",
        description: "Path to an image to be shown in the resizable item div."
      },
      item_height_mm: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: "Item height (mm)",
        default: 53.98,
        description: "The height of the item to be measured, in mm.",
      },
      item_width_mm: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: "Item width (mm)",
        default: 85.6,
        description: "The width of the item to be measured, in mm.",
      },
      item_init_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Initial Size",
        default: 250,
        description:
          "The initial size of the card, in pixels, along the largest dimension.",
      },
      blindspot_reps: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Blindspot measurement repetitions",
        default: 5,
        description:
          "How many times to measure the blindspot location? If 0, blindspot will not be detected, and viewing distance and degree data not computed.",
      },
      blindspot_prompt: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Blindspot prompt",
        default: `
          <p>Now we will quickly measure how far away you are sitting.</p>
          <div style="text-align: left">
            <ol>
              <li>Put your left hand on the <b>space bar</b>.</li>
              <li>Cover your right eye with your right hand.</li>
              <li>Using your left eye, focus on the black square. Keep your focus on the black square.</li>
              <li>The <span style="color: red; font-weight: bold;">red ball</span> will disappear as it moves from right to left. Press the space bar as soon as the ball disappears.</li>
            </ol>
          </div>
          <p>Press the space bar when you are ready to begin.</p>
          `,
        description: "HTML-formatted prompt to be shown on the screen during blindspot estimates."
      },
      // blindspot_start_prompt: {
      //   type: jsPsych.plugins.parameterType.HTML_STRING,
      //   pretty_name: "Blindspot start prompt",
      //   default: "Start",
      //   description: "Content of the start button for the blindspot tasks.",
      // },
      blindspot_measurements_prompt: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Blindspot measurements prompt",
        default: "Remaining measurements: ",
        description: "Text accompanying the remaining measures counter",
      },
      viewing_distance_report: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Viewing distance report",
        default: "<p>Based on your responses, you are sitting about <span id='distance-estimate' style='font-weight: bold;'></span> from the screen.</p><p>Does that seem about right?</p>",
        description:
          'If "none" is given, viewing distance will not be reported to the participant',
      },
      redo_measurement_button_label: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Re-do measurement button label",
        default: 'No, that is not close. Try again.',
        description: "Label for the button that can be clicked on the viewing distance report screen to re-do the blindspot estimate(s)."
      },
      blindspot_done_prompt: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Blindspot done prompt",
        default: "Yes",
        description: "Label for the button that can be clicked on the viewing distance report screen to accept the viewing distance estimate.",
      },
    },
  };

  plugin.trial = function (display_element, trial) {
    /* check parameter compatibility */
    if (!(trial.blindspot_reps > 0) && (trial.resize_units == "deg" || trial.resize_units == "degrees")) {
      console.error("Blindspot repetitions set to 0, so resizing to degrees of visual angle is not possible!");
      return;
    }

    /* some additional parameter configuration */
    let trial_data = {
      item_width_mm: trial.item_width_mm,
      item_height_mm: trial.item_height_mm, //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)
    };

    let blindspot_config_data = {
      ball_pos: [],
      slider_clck: false,
    };

    let aspect_ratio = trial.item_width_mm / trial.item_height_mm;

    const start_div_height =
      aspect_ratio < 1
        ? trial.item_init_size
        : Math.round(trial.item_init_size / aspect_ratio);
    const start_div_width =
      aspect_ratio < 1
        ? Math.round(trial.item_init_size * aspect_ratio)
        : trial.item_init_size;
    const adjust_size = Math.round(start_div_width * 0.1);

    /* create content for first screen, resizing card */
    let pagesize_content = `
      <div id="page-size">
        <div id="item" style="border: none; height: ${start_div_height}px; width: ${start_div_width}px; margin: 5px auto; background-color: none; position: relative; background-image: url(${trial.item_path}); background-size: 100% auto; background-repeat: no-repeat;">
          <div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: none; width: ${adjust_size}px; height: ${adjust_size}px; border: 5px solid red; border-left: 0; border-top: 0; position: absolute; bottom: 0; right: 0;">
          </div>
        </div>
        ${trial.adjustment_prompt}
        <button id="end_resize_phase" class="jspsych-btn">
          ${trial.adjustment_button_prompt}
        </button>
      </div>
    `

    /* create content for second screen, blind spot */
    let blindspot_content = `
      <div id="blind-spot">
        ${trial.blindspot_prompt}
        <div id="svgDiv" style="width:1000px;height:200px;"></div>
        <button class="btn btn-primary" id="proceed" style="display:none;"> +
          ${trial.blindspot_done_prompt} +
        </button>
        ${trial.blindspot_measurements_prompt} 
        <div id="click" style="display:inline; color: red"> ${trial.blindspot_reps} </div>
      </div>`

    /* create content for final report screen */
    let report_content = `
      <div id="distance-report">
        <div id="info-h">
          ${trial.viewing_distance_report}
        </div>
        <button id="redo_blindspot" class="jspsych-btn">${trial.redo_measurement_button_label}</button>
        <button id="proceed" class="jspsych-btn">${trial.blindspot_done_prompt}</button>
      </div>
    `

    display_element.innerHTML = `<div id="content" style="width: 900px; margin: 0 auto;"></div>`

    const start_time = performance.now();
    startResizePhase();

    function startResizePhase() {
      display_element.querySelector('#content').innerHTML = pagesize_content;

      // Event listeners for mouse-based resize
      let dragging = false;
      let origin_x, origin_y;
      let cx, cy;
      const scale_div = display_element.querySelector("#item");

      function mouseupevent() {
        dragging = false;
      };
      document.addEventListener("mouseup", mouseupevent);

      function mousedownevent(e) {
        e.preventDefault();
        dragging = true;
        origin_x = e.pageX;
        origin_y = e.pageY;
        cx = parseInt(scale_div.style.width);
        cy = parseInt(scale_div.style.height);
      };
      display_element.querySelector("#jspsych-resize-handle").addEventListener("mousedown", mousedownevent);

      function resizeevent(e) {
        if (dragging) {
          let dx = e.pageX - origin_x;
          let dy = e.pageY - origin_y;

          if (Math.abs(dx) >= Math.abs(dy)) {
            scale_div.style.width =
              Math.round(Math.max(20, cx + dx * 2)) + "px";
            scale_div.style.height =
              Math.round(Math.max(20, cx + dx * 2) / aspect_ratio) + "px";
          } else {
            scale_div.style.height =
              Math.round(Math.max(20, cy + dy * 2)) + "px";
            scale_div.style.width =
              Math.round(aspect_ratio * Math.max(20, cy + dy * 2)) + "px";
          }
        }
      }
      display_element.addEventListener("mousemove", resizeevent);

      display_element.querySelector("#end_resize_phase").addEventListener("click", finishResizePhase);

    }

    function finishResizePhase() {
      // add item width info to data
      const item_width_px = getScaledItemWidth();
      trial_data["item_width_px"] = Math.round(item_width_px);
      const px2mm = convertPixelsToMM(item_width_px);
      trial_data["px2mm"] = accurateRound(px2mm, 2);
      // check what to do next
      if (trial.blindspot_reps > 0) {
        startBlindSpotPhase();
      } else {
        endTrial();
      }
    }

    function startBlindSpotPhase() {
      // reset the config data in case we are redoing the measurement
      blindspot_config_data = {
        ball_pos: [],
        slider_clck: false,
      };
      // add the content to the page
      document.querySelector("#content").innerHTML = blindspot_content;
      // draw the ball and fixation square
      drawBall();
      // wait for a spacebar to begin the animations
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: startBall,
        valid_responses: [' '],
        rt_method: 'performance',
        allow_held_keys: false,
        persist: false
      })
    }

    function startBall() {
      ball_position_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: recordPosition,
        valid_responses: [' '],
        rt_method: 'performance',
        allow_held_keys: false,
        persist: true
      });
      animateBall();
    }

    function finishBlindSpotPhase() {
      ball.stop();

      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      if(trial.viewing_distance_report == 'none'){
        endTrial();
      } else {
        showReport();
      }
    }

    function showReport() {
      // Display data
      display_element.querySelector("#content").innerHTML = report_content;
      display_element.querySelector('#distance-estimate').innerHTML = `
        ${Math.round(trial_data["view_dist_mm"] / 10)} cm (${Math.round(trial_data["view_dist_mm"]*0.0393701)} inches)
      `

      display_element.querySelector("#redo_blindspot").addEventListener('click', startBlindSpotPhase)
      display_element.querySelector("#proceed").addEventListener('click', endTrial);
    }

    function computeTransformation() {
      trial_data.item_width_deg =
        (2 *
          Math.atan(
            trial_data["item_width_mm"] / 2 / trial_data["view_dist_mm"]
          ) *
          180) /
        Math.PI;
      trial_data.px2deg =
        trial_data["item_width_px"] / trial_data.item_width_deg; // size of item in pixels divided by size of item in degrees of visual angle

      let px2unit_scr = 0;
      switch (trial.resize_units) {
        case "cm":
        case "centimeters":
          px2unit_scr = trial_data["px2mm"] * 10; // pixels per centimeter
          break;
        case "inch":
        case "inches":
          px2unit_scr = trial_data["px2mm"] * 25.4; // pixels per inch
          break;
        case "deg":
        case "degrees":
          px2unit_scr = trial_data["px2deg"]; // pixels per degree of visual angle
          break;
      }
      if (px2unit_scr > 0) {
        // scale the window
        scale_factor = px2unit_scr / trial.pixels_per_unit;
        document.getElementById("jspsych-content").style.transform =
          "scale(" + scale_factor + ")";
        // pixels have been scaled, so pixels per degree, pixels per mm and pixels per item_width needs to be updated
        trial_data.px2deg = trial_data.px2deg / scale_factor;
        trial_data.px2mm = trial_data.px2mm / scale_factor;
        trial_data.item_width_px =
          trial_data.item_width_px / scale_factor;
        trial_data.scale_factor = scale_factor;
      }

      if (trial.blindspot_reps > 0) {
        trial_data.win_width_deg = window.innerWidth / trial_data.px2deg;
        trial_data.win_height_deg =
          window.innerHeight / trial_data.px2deg;
      } else {
        // delete degree related properties
        delete trial_data.px2deg;
        delete trial_data.item_width_deg;
      }
    }

    function endTrial() {

      // finish trial
      trial_data.rt = performance.now() - start_time;

      // remove lingering event listeners, just in case
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // compute final data
      computeTransformation();

      // clear the display
      display_element.innerHTML = "";

      // finish the trial
      jsPsych.finishTrial(trial_data);
      
    }

    function getScaledItemWidth() {
      return document.querySelector('#item').getBoundingClientRect().width;
    }

    function drawBall(pos = 180) {
      // pos: define where the fixation square should be.
      var mySVG = SVG("svgDiv");
      const rectX = trial_data["px2mm"] * pos;
      const ballX = rectX * 0.6; // define where the ball is
      var ball = mySVG.circle(30).move(ballX, 50).fill("#f00");
      window.ball = ball;
      var square = mySVG.rect(30, 30).move(Math.min(rectX - 50, 950), 50); //square position
      blindspot_config_data["square_pos"] = accurateRound(square.cx(), 2);
      blindspot_config_data["rectX"] = rectX;
      blindspot_config_data["ballX"] = ballX;
    }

    function animateBall() {
      ball
        .animate(7000)
        .during(function (pos) {
          moveX = -pos * blindspot_config_data["ballX"];
          window.moveX = moveX;
          moveY = 0;
          ball.attr({ transform: "translate(" + moveX + "," + moveY + ")" }); //jqueryToVanilla: el.getAttribute('');
        })
        .loop(true, false)
        .after(function () {
          animateBall();
        });
    }

    function recordPosition() {
      // angle: define horizontal blind spot entry point position in degrees.
      const angle = 13.5;

      blindspot_config_data["ball_pos"].push(accurateRound(ball.cx() + moveX, 2));
      var sum = blindspot_config_data["ball_pos"].reduce((a, b) => a + b, 0);
      var ballPosLen = blindspot_config_data["ball_pos"].length;
      blindspot_config_data["avg_ball_pos"] = accurateRound(sum / ballPosLen, 2);
      var ball_sqr_distance =
        (blindspot_config_data["square_pos"] - blindspot_config_data["avg_ball_pos"]) /
        trial_data["px2mm"];
      var viewDistance = ball_sqr_distance / Math.tan(Math.radians(angle));
      trial_data["view_dist_mm"] = accurateRound(viewDistance, 2);

      //counter and stop
      var counter = Number(document.querySelector("#click").textContent);
      counter = counter - 1;
      document.querySelector("#click").textContent = Math.max(counter, 0);
      if (counter <= 0) {
        finishBlindSpotPhase();
        return;
      } else {
        ball.stop();
        animateBall();
      }

    }

    function convertPixelsToMM(item_width_px){
      const px2mm = item_width_px / trial_data["item_width_mm"];
      return px2mm;
    }

    function accurateRound(value, decimals){
      return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

  };

  //helper function for radians
  // Converts from degrees to radians.
  Math.radians = function (degrees) {
    return (degrees * Math.PI) / 180;
  };

  return plugin;
})();
