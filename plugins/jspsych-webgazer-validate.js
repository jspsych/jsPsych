/**
 * jspsych-webgazer-validate
 * Josh de Leeuw
 **/

jsPsych.plugins["webgazer-validate"] = (function() {

    var plugin = {};
  
    plugin.info = {
      name: 'webgazer-validate',
      description: '',
      parameters: {
        validation_points: {
          type: jsPsych.plugins.parameterType.INT,
          default: [[10,10], [10,50], [10,90], [50,10], [50,50], [50,90], [90,10], [90,50], [90,90]]
        },
        randomize_validation_order: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: false
        },
        validation_duration: {
          type: jsPsych.plugins.parameterType.INT,
          default: 2000
        }
      }
    }
  
    // provide options for calibration routines?
    // dot clicks?
    // track a dot with mouse?
    
    // then a validation phase of staring at the dot in different locations?
  
    plugin.trial = function(display_element, trial) {

      var trial_data = {}
      trial_data.rawGaze = [];
  
      var html = `
        <div id='webgazer-validate-container' style='position: relative; width:100vw; height:100vh; overflow: hidden;'>
        </div>`
  
      display_element.innerHTML = html;

      var wg_container = display_element.querySelector('#webgazer-validate-container');
  
      show_begin_validate_message();
  
      function show_begin_validate_message(){
        wg_container.innerHTML = `<div style='position: absolute; top: 50%; left: calc(50% - 350px); transform: translateY(-50%); width:700px;'>
          <p>Let's see how accurate the eye tracking is. </p>
          <p>Keep your head still, and move your eyes to focus on each dot as it appears.</p>
          <button id='begin-validate-btn' class='jspsych-btn'>Click to begin.</button>
          </div>`
        document.querySelector('#begin-validate-btn').addEventListener('click', function(){
          validate();
        });
      }
  
      var points_completed = -1;
      var val_points = null;

      function validate(){
        
        if(trial.randomize_validation_order){
          val_points = jsPsych.randomization.shuffle(trial.validation_points);
        } else {
          val_points = trial.validation_points;
        }
        points_completed = -1;
        jsPsych.extensions['webgazer'].resume();
        next_validation_point();
      }
  
      function next_validation_point(){
        points_completed++;
        if(points_completed == val_points.length){
          validation_done();
        } else {
          var pt = val_points[points_completed];
          validation_display(pt);
        }
      }

      function validation_display(pt){
        var pt_html = '<div id="validation-point" style="width:10px; height:10px; border-radius:10px; border: 1px solid #000; background-color: #333; position: absolute; left:'+pt[0]+'%; top:'+pt[1]+'%;"></div>'
        wg_container.innerHTML = pt_html;

        var pt_dom = wg_container.querySelector('#validation-point');

        var br = pt_dom.getBoundingClientRect();
        var x = br.left + br.width / 2;
        var y = br.top + br.height / 2;

        var pt_start_val = performance.now() + 1000;
        var pt_finish = performance.now() + 3000;

        var pt_data = [];
        
        requestAnimationFrame(function watch_dot(){
          
          if(performance.now() > pt_start_val){
            jsPsych.extensions['webgazer'].getCurrentPrediction().then(function(prediction){
              pt_data.push({dx: prediction.x - x, dy: prediction.y - y});
            });
          }
          if(performance.now() < pt_finish){
            requestAnimationFrame(watch_dot);
          } else {
            trial_data.rawGaze.push(pt_data);
            next_validation_point();
          }
        })

        // jsPsych.pluginAPI.setTimeout(function(){
        //   pt_dom.style.backgroundColor = "#fff";
        //   pt_dom.addEventListener('click', function(){
        //     next_calibration_point();
        //   });
        // }, Math.random()*(trial.maximum_dot_change_delay-trial.minimum_dot_change_delay)+trial.minimum_dot_change_delay);
  
      }

      function drawValidationPoint(x,y){
        return '<div class="validation-point" style="width:10px; height:10px; border-radius:10px; border: 1px solid #000; background-color: #333; position: absolute; left:'+x+'%; top:'+y+'%;"></div>'
      }

      function drawCircle(target_x, target_y, dx, dy,r){
        var html = `
          <div class="validation-centroid" style="width:${r*2}px; height:${r*2}px; border: 2px solid red; border-radius: ${r}px; background-color: transparent; position: absolute; left:calc(${target_x}% + ${dx-r}px); top:calc(${target_y}% + ${dy-r}px);"></div>
        `
        return html;
      }

      function drawRawDataPoint(target_x, target_y, dx, dy){
        return `<div class="raw-data-point" style="width:5px; height:5px; border-radius:5px; border: 1px solid #f00; background-color: #faa; opacity:0.2; position: absolute; left:calc(${target_x}% + ${dx}px); top:calc(${target_y}% + ${dy}px);"></div>`
      }

      function median(arr){
        var mid = Math.floor(arr.length/2);
        var sorted_arr = arr.sort((a,b) => a-b);
        if(arr.length % 2 == 0){
          return sorted_arr[mid-1] + sorted_arr[mid] / 2;
        } else {
          return sorted_arr[mid];
        }
      }

      function calculateGazeCentroid(gazeData){

        var x_diff_m = gazeData.reduce(function(accumulator, currentValue, index){
          accumulator += currentValue.dx;
          if(index == gazeData.length-1){
            return accumulator / gazeData.length;
          } else {
            return accumulator;
          }
        }, 0);

        var y_diff_m = gazeData.reduce(function(accumulator, currentValue, index){
          accumulator += currentValue.dy;
          if(index == gazeData.length-1){
            return accumulator / gazeData.length;
          } else {
            return accumulator;
          }
        }, 0);

        var median_distance = median(gazeData.map(function(x){ return(Math.sqrt(Math.pow(x.dx-x_diff_m,2) + Math.pow(x.dy-y_diff_m,2)))}));

        return {
          x: x_diff_m,
          y: y_diff_m,
          r: median_distance
        }
      }

      function validation_done(){
        var html = '';
        for(var i=0; i<trial.validation_points.length; i++){
          html += drawValidationPoint(trial.validation_points[i][0], trial.validation_points[i][1]);
          var gc = calculateGazeCentroid(trial_data.rawGaze[i]);
          html += drawCircle(trial.validation_points[i][0], trial.validation_points[i][1], gc.x, gc.y, gc.r);
          for(var j=0; j<trial_data.rawGaze[i].length; j++){
            html += drawRawDataPoint(trial.validation_points[i][0], trial.validation_points[i][1], trial_data.rawGaze[i][j].dx, trial_data.rawGaze[i][j].dy)
          }
        }
        wg_container.innerHTML = html;
        // debugging
        jsPsych.extensions.webgazer.showPredictions();        
      }

      // function to end trial when it is time
      function end_trial() {
        jsPsych.extensions['webgazer'].pause();
        jsPsych.extensions['webgazer'].hidePredictions();
        jsPsych.extensions['webgazer'].hideVideo();
  
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();
  
        // gather the data to store for the trial
        var trial_data = {
  
        };
  
        // clear the display
        display_element.innerHTML = '';
  
        // move on to the next trial
        jsPsych.finishTrial(trial_data);
      };
  
    };
  
    return plugin;
  })();