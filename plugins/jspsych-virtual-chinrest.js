/*
 *  plugin for jsPsych based in Qisheng Li 11/2019. /// https://github.com/QishengLi/virtual_chinrest
    
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
        default: "none",
        description:
          'What units to resize to? ["none"/"cm"/"inch"/"deg"]. If "none", no resize will be done.',
      },
      pixels_per_unit: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Pixels per unit",
        default: 100,
        description:
          "After the scaling factor is applied, this many pixels will equal one unit of measurement.",
      },
      mouse_adjustment: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: "Adjust Using Mouse?",
        default: true,
      },
      adjustment_prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        default:
          "<b> Let’s find out how big your monitor is! </b>" +
          "<p>Please use any credit card that you have available.<br>" +
          "It can also be a grocery store membership card,<br>" +
          "your drivers license or anything else of the same format.<br>" +
          "<b>Place your card flat onto the screen, and adjust the slider below to match its size.</b></p>" +
          "<p>If you do not have access to a real card <br>" +
          "you can use a ruler to measure the image width to 3.37 inches or 85.6 mm.<br>",
        description:
          " Any content here will be displayed above the card stimulus.",
      },
      adjustment_button_prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "Click here when the card has the right size!",
        description:
          " Content of the button displayed below the card stimulus.",
      },
      item_path: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "img/card.png",
      },
      item_height_mm: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Item height",
        default: 53.98,
        description: "The height of the item to be measured.",
      },
      item_width_mm: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Item width",
        default: 85.6,
        description: "The width of the item to be measured.",
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
          "How many times to measure the blindspot location? If 0, blindspot will not detected and viewing distance not computed.",
      },
      blindspot_prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        default:
          "<b>Now, let’s quickly test how far away you are sitting.</b>" +
          "<p>You might know that vision tests at a doctor’s practice often involve chinrests.<br>" +
          "The doctor basically asks you to sit away from a screen in a specific distance.<br>" +
          "We do this here with a “virtual chinrest”.</p><br>" +
          "<b>Instructions</b>" +
          '<div style="text-align: left">' +
          "<ol><li>Put your finger on <b>space bar</b> on the keyboard.</li>" +
          "<li>Close your right eye. <em>(Tips: it might be easier to cover your right eye by hand!)</em></li>" +
          "<li>Using your left eye, focus on the black square.</li>" +
          '<li>Click the button below to start the animation of the red ball. The <b style="color: red">red ball </b>' +
          "will disappear as it moves from right to left. Press the “Space” key as soon as the ball disappears from your eye sight.</li>" +
          "</div><br> Keep your right eye closed and hit the “Space” key fast!</p><br>",
      },
      blindspot_start_prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "Start",
        description: "Content of the start button for the blindspot tasks.",
      },
      blindspot_done_prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "Done",
        description: "Content of the done button for the blindspot tasks.",
      },
      blindspot_measurements_prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "Remaining measurements: ",
        description: "Text accompanying the remaining measures counter",
      },
      viewing_distance_report: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "Estimated viewing distance (cm):",
        description:
          'If "none" is given, viewing distance will not be reported to the participant',
      },
    },
  };

  // Get screen size
  var w = window.innerWidth;
  var h = window.innerHeight;

  const screen_size_px = [];
  screen_size_px.push(w);
  screen_size_px.push("x");
  screen_size_px.push(h);

  let trial_data = {}; // declare trial data as empty so we have access to it across functions

  let config_data = {
    ball_pos: [],
    slider_clck: false,
  };

  plugin.trial = function (display_element, trial) {
    try {
      if (
        !(trial.blindspot_reps > 0) &&
        (trial.resize_units == "deg" || trial.resize_units == "degrees")
      ) {
        throw Error(
          "Blindspot repetitions set to 0, so resizing to degrees of visual angle is not possible!"
        );
      } else {
        const start_time = performance.now();

        trial_data = {
          item_width_mm: trial.item_width_mm,
          item_height_mm: trial.item_height_mm, //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)
        };

        let button_str = '<button id=blind_spot class="btn btn-primary">';
        if (!(trial.blindspot_reps > 0)) {
          button_str = '<button id=proceed class="btn btn-primary">';
        }

        let report_str = "";
        if (!(trial.viewing_distance_report == "none")) {
          report_str =
            '<div id="info" style="visibility:hidden">' +
            '<b id="info-h">' +
            trial.viewing_distance_report +
            " </b>" +
            "</div>";
        }

        let pagesize_content =
          '<div id="page-size"><br><br>' + trial.adjustment_prompt;

        // variables to determine div size
        let aspect_ratio = 1;

        if (trial.mouse_adjustment) {
          aspect_ratio = trial.item_width_mm / trial.item_height_mm;
          const start_div_height =
            aspect_ratio < 1
              ? trial.item_init_size
              : Math.round(trial.item_init_size / aspect_ratio);
          const start_div_width =
            aspect_ratio < 1
              ? Math.round(trial.item_init_size * aspect_ratio)
              : trial.item_init_size;
          const adjust_size = Math.round(start_div_width * 0.1);
          pagesize_content +=
            "<br>" +
            button_str +
            trial.adjustment_button_prompt +
            "</button><br>" +
            '<div id="item" style="border: none; ' +
            "height: " +
            start_div_height +
            "px; width:" +
            start_div_width +
            "px; " +
            "margin: 5px auto; background-color: none; position: relative; " +
            "background-image: url(" +
            trial.item_path +
            "); " +
            'background-size: 100% auto; background-repeat: no-repeat">' +
            '<div id="jspsych-resize-handle" style="cursor: nwse-resize; ' +
            "background-color: none; width: " +
            adjust_size +
            "px; height: " +
            adjust_size +
            "px; " +
            'border: 5px solid red; border-left: 0; border-top: 0; position: absolute; bottom: 0; right: 0;">' +
            "</div>" +
            "</div>" +
            "</div>";
        } else {
          pagesize_content +=
            '<div id="container">' +
            '<div id="slider"></div><br>' +
            button_str +
            trial.adjustment_button_prompt +
            "</button><br><br>" +
            '<img id="item" src="' +
            trial.item_path +
            '" style="width: 50%">' +
            "</div>" +
            "</div>";
        }

        const blindspot_content =
          '<div id="blind-spot" style="visibility: hidden">' +
          trial.blindspot_prompt +
          '<div id="svgDiv" style="width:1000px;height:200px;"></div>' +
          '<button class="btn btn-primary" id="start_ball">' +
          trial.blindspot_start_prompt +
          "</button>" +
          '<button class="btn btn-primary" id="proceed" style="display:none">' +
          trial.blindspot_done_prompt +
          "</button><br>" +
          `<b> ${trial.blindspot_measurements_prompt} <div id="click" style="display:inline; color: red"> ${trial.blindspot_reps} </div> <b><br>` +
          report_str +
          "</div>";

        display_element.innerHTML =
          '<div id="content" style="width: 900px; margin: 0 auto;">' +
          pagesize_content +
          blindspot_content +
          "</div>";

        // Event listeners for mouse-based resize
        if (trial.mouse_adjustment) {
          let dragging = false;
          let origin_x, origin_y;
          let cx, cy;

          const mouseupevent = function (e) {
            dragging = false;
          };
          display_element.addEventListener("mouseup", mouseupevent);

          const mousedownevent = function (e) {
            e.preventDefault();
            dragging = true;
            origin_x = e.pageX;
            origin_y = e.pageY;
            cx = parseInt(scale_div.style.width);
            cy = parseInt(scale_div.style.height);
          };
          display_element
            .querySelector("#jspsych-resize-handle")
            .addEventListener("mousedown", mousedownevent);

          const scale_div = display_element.querySelector("#item");

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
        }

        //Event listeners for buttons
        if (trial.blindspot_reps > 0) {
          display_element
            .querySelector("#blind_spot")
            .addEventListener("click", function () {
              configureBlindSpot();
            });
          display_element
            .querySelector("#start_ball")
            .addEventListener("click", function () {
              animateBall();
            });
        } else {
          // run the two relevant functions to get item_width_mm and px2mm
          distanceSetup.px2mm(get_item_width());
        }

        display_element
          .querySelector("#proceed")
          .addEventListener("click", function () {
            // finish trial
            trial_data.rt = performance.now() - start_time;
            display_element.innerHTML = "";

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
            jsPsych.finishTrial(trial_data);
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
          });
      }
    } catch (e) {
      console.error(e);
    }
  };

  (function (distanceSetup, $) {
    // jQuery short-hand for $(document).ready(function() { ... });

    distanceSetup.round = function (value, decimals) {
      return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    };

    distanceSetup.px2mm = function (item_width_px) {
      const px2mm = item_width_px / trial_data["item_width_mm"];
      trial_data["px2mm"] = distanceSetup.round(px2mm, 2);
      return px2mm;
    };
  })((window.distanceSetup = window.distanceSetup || {}), jQuery);

  function get_item_width() {
    const item_width_px = $("#item").width();
    trial_data["item_width_px"] = distanceSetup.round(item_width_px, 2);
    return item_width_px;
  }

  function configureBlindSpot() {
    drawBall();
    $("#page-size").remove(); // jqueryToVanilla: el.parentNode.removeChild(el);
    $("#blind-spot").css({ visibility: "visible" }); // jqueryToVanilla: document.getElementById("myP").style.visibility = "hidden";
    // $(document).on('keydown', recordPosition);
    $(document).on("keydown", recordPosition); // jqueryToVanilla: document.addEventListener("keydown", (e) => { /* ... */ });
  }

  $(function () {
    $("#slider").slider({ value: "50" }); // jqueryToVanilla:
  });

  $(document).ready(function () {
    //  jqueryToVanilla: https://stackoverflow.com/questions/799981/document-ready-equivalent-without-jquery
    $("#slider").on("slide", function (event, ui) {
      const item_width = ui.value + "%";
      $("#item").css({ width: item_width });
    });

    $("#slider").on("slidechange", function (event, ui) {
      // jqueryToVanilla: document.addEventListener("keydown", (e) => { /* ... */ });
      config_data["slider_clck"] = true;
    });
  });

  //=============================
  //Ball Animation

  function drawBall(pos = 180) {
    // pos: define where the fixation square should be.
    var mySVG = SVG("svgDiv");
    const item_width_px = get_item_width();
    const rectX = distanceSetup.px2mm(item_width_px) * pos;
    const ballX = rectX * 0.6; // define where the ball is
    var ball = mySVG.circle(30).move(ballX, 50).fill("#f00");
    window.ball = ball;
    var square = mySVG.rect(30, 30).move(Math.min(rectX - 50, 950), 50); //square position
    config_data["square_pos"] = distanceSetup.round(square.cx(), 2);
    config_data["rectX"] = rectX;
    config_data["ballX"] = ballX;
  }

  function animateBall() {
    ball
      .animate(7000)
      .during(function (pos) {
        moveX = -pos * config_data["ballX"];
        window.moveX = moveX;
        moveY = 0;
        ball.attr({ transform: "translate(" + moveX + "," + moveY + ")" }); //jqueryToVanilla: el.getAttribute('');
      })
      .loop(true, false)
      .after(function () {
        animateBall();
      });

    //disable the button after clicked once.
    $("#start_ball").attr("disabled", true); // el.getAttribute('');
    $("#start_ball").css("display", "none"); // document.querySelector('#start_ball').style.display = 'none';
  }

  function recordPosition(event, angle = 13.5) {
    // angle: define horizontal blind spot entry point position in degrees.
    if (event.keyCode == "32") {
      //Press "Space"

      config_data["ball_pos"].push(distanceSetup.round(ball.cx() + moveX, 2));
      var sum = config_data["ball_pos"].reduce((a, b) => a + b, 0);
      var ballPosLen = config_data["ball_pos"].length;
      config_data["avg_ball_pos"] = distanceSetup.round(sum / ballPosLen, 2);
      var ball_sqr_distance =
        (config_data["square_pos"] - config_data["avg_ball_pos"]) /
        trial_data["px2mm"];
      var viewDistance = ball_sqr_distance / Math.radians(angle);
      trial_data["view_dist_mm"] = distanceSetup.round(viewDistance, 2);

      //counter and stop
      var counter = Number($("#click").text());
      counter = counter - 1;
      $("#click").text(Math.max(counter, 0)); // jqueryToVanilla: document.querySelector("#click").textContent = Math.max(counter, 0);
      if (counter <= 0) {
        ball.stop();

        // Disable space key
        $("html").bind("keydown", function (e) {
          // jqueryToVanilla
          if (e.keyCode == 32) {
            return false;
          }
        });

        // Display data
        $("#info").css("visibility", "visible"); // jqueryToVanilla: document.querySelector('#info').style.visibility = 'visible';
        $("#info-h").append(trial_data["view_dist_mm"] / 10); // jqueryToVanilla(2 lines of code): var element = document.createElement("div");
        // document.querySelector(".container").appendChild(element);

        $("#proceed").css("display", "inline"); // jqueryToVanilla: document.querySelector('#info').style.display = 'inline';

        return;
      }

      ball.stop();
      animateBall();
    }
  }

  //helper function for radians
  // Converts from degrees to radians.
  Math.radians = function (degrees) {
    return (degrees * Math.PI) / 180;
  };

  return plugin;
})();
