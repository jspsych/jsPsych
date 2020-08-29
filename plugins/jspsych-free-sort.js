/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of images
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */


jsPsych.plugins['free-sort'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('free-sort', 'stimuli', 'image');

  plugin.info = {
    name: 'free-sort',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
        description: 'items to be displayed.'
      },
      stim_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus height',
        default: 100,
        description: 'Height of items in pixels.'
      },
      stim_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus width',
        default: 100,
        description: 'Width of items in pixels'
      },
      scale_factor: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Stimulus scaling factor',
        default: 1.5,
        description: 'How much larger to make the stimulus while moving (1 = no scaling)'
      },
      sort_area_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sort area height',
        default: 800,
        description: 'The height of the container that subjects can move the stimuli in.'
      },
      sort_area_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sort area width',
        default: 800,
        description: 'The width of the container that subjects can move the stimuli in.'
      },
      sort_area_shape: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Sort area shape',
        options: ['square','ellipse'],
        default: 'ellipse',
        description: 'The shape of the sorting area'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'It can be used to provide a reminder about the action the subject is supposed to take.'
      },
      prompt_location: {
        type: jsPsych.plugins.parameterType.SELECT,
        pretty_name: 'Prompt location',
        options: ['above','below'],
        default: 'above',
        description: 'Indicates whether to show prompt "above" or "below" the sorting area.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'continue',
        description: 'The text that appears on the button to continue to the next trial.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var start_time = performance.now();

    var html = 
      '<div '+
      'id="jspsych-free-sort-arena" '+
      'class="jspsych-free-sort-arena" '+
      'style="position: relative; width:'+trial.sort_area_width+'px; height:'+trial.sort_area_height+'px; margin: auto; line-height: 0em"</div>';

    // variable that has the prompt text, counter and button
    const html_text = '<div style="line-height: 0em">' + trial.prompt + 
      '<p id="jspsych-free-sort-counter" style="display: inline-block; line-height: 1em">You still need to place ' + trial.stimuli.length + ' items inside the arena.</p>' +
      '<button id="jspsych-free-sort-done-btn" class="jspsych-btn" '+ 
      'style="display: none; margin: 5px; padding: 5px; text-align: center; font-weight: bold; font-size: 18px; vertical-align:baseline; line-height: 1em">' + trial.button_label+'</button></div>'
    
    // position prompt above or below
    if (trial.prompt_location == "below") {
        html += html_text
    } else {
        html = html_text + html
    }

    display_element.innerHTML = html;

    // another div for border
    let border_div = '<div '+
      'id="jspsych-free-sort-border" '+
      'class="jspsych-free-sort-border" '+
      'style="position: relative; width:'+trial.sort_area_width*.94+'px; height:'+trial.sort_area_height*.94+'px; border:'+trial.sort_area_height*.03+'px solid #fc9272; margin: auto; line-height: 0em; ';
    
    if ( trial.sort_area_shape == "ellipse") {
      border_div += 'webkit-border-radius: 50%; moz-border-radius: 50%; border-radius: 50%"></div>'
    } else {
      border_div += 'webkit-border-radius: 0%; moz-border-radius: 0%; border-radius: 0%"></div>'
    }

    // add border div code
    display_element.querySelector("#jspsych-free-sort-arena").innerHTML += border_div

    // store initial location data
    let init_locations = [];

    // determine number of rows and colums, must be a even number
    let num_rows = Math.ceil(Math.sqrt(trial.stimuli.length))
    if ( num_rows % 2 != 0) {
      num_rows = num_rows + 1
    }

    // compute coords for left and right side of arena
    let r_coords = [];
    let l_coords = [];
    for (const x of make_arr(0, trial.sort_area_width - trial.stim_width, num_rows) ) {
      for (const y of make_arr(0, trial.sort_area_height - trial.stim_height, num_rows) ) {
        if ( x > ( (trial.sort_area_width - trial.stim_width)  * .5 ) ) {
          //r_coords.push({ x:x, y:y } )
          r_coords.push({ x:x + (trial.sort_area_width)  * .5 , y:y });
        } else {
          l_coords.push({ x:x - (trial.sort_area_width)  * .5 , y:y });
          //l_coords.push({ x:x, y:y } )
        }
      }
    }

    // repeat coordinates until you have enough coords (may be obsolete)
    while ( ( r_coords.length + l_coords.length ) < trial.stimuli.length ) {
      r_coords = r_coords.concat(r_coords)
      l_coords = l_coords.concat(l_coords)
    }
    // reverse left coords, so that coords closest to arena is used first
    l_coords = l_coords.reverse()

    // shuffle stimuli, so that starting positions are random
    trial.stimuli = shuffle(trial.stimuli);

    let inside = []
    for (let i = 0; i < trial.stimuli.length; i++) {
      let coords = []
      if ( (i % 2) == 0 ) {
        coords = r_coords[Math.floor(i * .5)];
      } else {
        coords = l_coords[Math.floor(i * .5)];
      }
      display_element.querySelector("#jspsych-free-sort-arena").innerHTML += '<img '+
        'src="'+trial.stimuli[i]+'" '+
        'data-src="'+trial.stimuli[i]+'" '+
        'class="jspsych-free-sort-draggable" '+
        'draggable="false" '+
        'id="'+i+'" '+
        'style="position: absolute; cursor: move; width:'+trial.stim_width+'px; height:'+trial.stim_height+'px; top:'+coords.y+'px; left:'+coords.x+'px;">'+
        '</img>';

      init_locations.push({
        "src": trial.stimuli[i],
        "x": coords.x,
        "y": coords.y
      });
      inside.push(false);
    }
    // moves within a trial
    let moves = [];

    // are objects currently inside
    let cur_in = false

    // draggable items 
    const draggables = display_element.querySelectorAll('.jspsych-free-sort-draggable');

    // button (will show when all items are inside) and border (will change color)
    const border = display_element.querySelector("#jspsych-free-sort-border")
    const button = display_element.querySelector('#jspsych-free-sort-done-btn')

    for(let i=0; i<draggables.length; i++){
      draggables[i].addEventListener('mousedown', function(event){
        let x = event.pageX - event.currentTarget.offsetLeft;
        let y = event.pageY - event.currentTarget.offsetTop - window.scrollY;
        let elem = event.currentTarget;
        elem.style.transform = "scale(" + trial.scale_factor + "," + trial.scale_factor + ")";
        let mousemoveevent = function(e){
          cur_in = inside_ellipse(e.clientX - x, e.clientY - y, 
              trial.sort_area_width*.5 - trial.stim_width*.5, trial.sort_area_height*.5 - trial.stim_height*.5, 
              trial.sort_area_width*.5, trial.sort_area_height*.5,
              trial.sort_area_shape == "square");
          elem.style.top =  Math.min(trial.sort_area_height - trial.stim_height*.5, Math.max(- trial.stim_height*.5, (e.clientY - y))) + 'px';
          elem.style.left = Math.min(trial.sort_area_width*1.5  - trial.stim_width,  Math.max(-trial.sort_area_width*.5, (e.clientX - x)))+ 'px';
          
          // modify border while items is being moved
          if (cur_in) {
            border.style.borderColor = "#a1d99b";
            border.style.background = "None";
          } else {
            border.style.borderColor = "#fc9272";
            border.style.background = "None";
          }
          
          // replace in overall array, grab idx from item id
          inside.splice(elem.id, true, cur_in)

          // modify text and background if all items are inside
          if (inside.every(Boolean)) {
            border.style.background = "#a1d99b";
            button.style.display = "inline-block";
            display_element.querySelector("#jspsych-free-sort-counter").innerHTML = "All items placed. Feel free to reposition any item if necessary. Otherwise, click here to "
          } else {
            border.style.background = "none";
            button.style.display = "none";
            if ( (inside.length - inside.filter(Boolean).length) > 1 ) {
              display_element.querySelector("#jspsych-free-sort-counter").innerHTML = "You still need to place " + (inside.length - inside.filter(Boolean).length) + " items inside the arena."
            } else {
              display_element.querySelector("#jspsych-free-sort-counter").innerHTML = "You still need to place " + (inside.length - inside.filter(Boolean).length) + " item inside the arena."
            }
          }
        }
        document.addEventListener('mousemove', mousemoveevent);

        var mouseupevent = function(e){
          document.removeEventListener('mousemove', mousemoveevent);
          elem.style.transform = "scale(1, 1)";
          if (inside.every(Boolean)) {
            border.style.background = "#a1d99b";
            border.style.borderColor = "#a1d99b";
          } else {
            border.style.background = "none";
            border.style.borderColor = "#fc9272";
          }
          moves.push({
            "src": elem.dataset.src,
            "x": elem.offsetLeft,
            "y": elem.offsetTop
          });
          document.removeEventListener('mouseup', mouseupevent);
        }
        document.addEventListener('mouseup', mouseupevent);
      });
    }

    display_element.querySelector('#jspsych-free-sort-done-btn').addEventListener('click', function(){      
      if (inside.every(Boolean)) {
        const end_time = performance.now();
        const rt = end_time - start_time;
        // gather data
        const items = display_element.querySelectorAll('.jspsych-free-sort-draggable');
        // get final position of all items
        let final_locations = [];
        for(let i=0; i<items.length; i++){
          final_locations.push({
            "src": items[i].dataset.src,
            "x": parseInt(items[i].style.left),
            "y": parseInt(items[i].style.top)
          });
        }

        const trial_data = {
          "init_locations": JSON.stringify(init_locations),
          "moves": JSON.stringify(moves),
          "final_locations": JSON.stringify(final_locations),
          "rt": rt
        };
        
        // advance to next part
        display_element.innerHTML = '';
        jsPsych.finishTrial(trial_data);
      }
    });
  };

  // helper functions

  function shuffle(array) {
    // define three variables
    let cur_idx = array.length, tmp_val, rand_idx;

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
      arr.push(startValue + (step * i));
    }
    return arr;
  }

  function inside_ellipse(x, y, x0, y0, rx, ry, square=false) {
    const results = [];
    if (square) {
      result = ( Math.abs(x - x0) <= rx ) && ( Math.abs(y - y0) <= ry )
    } else {
      result = (( x - x0 ) * ( x - x0 )) * (ry * ry) + ((y - y0) * ( y - y0 )) * ( rx * rx ) <= ( (rx * rx) * (ry * ry) )
    }
    return result 
  }

  /* 
  un-used functions (that might be useful for something else)

  function random_coordinate(max_width, max_height) {
    const rnd_x = Math.floor(Math.random() * (max_width - 1));
    const rnd_y = Math.floor(Math.random() * (max_height - 1));
    return {
      x: rnd_x,
      y: rnd_y
    };
  }
  */
  return plugin;
})();
