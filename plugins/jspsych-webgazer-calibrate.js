/**
 * jspsych-webgazer-calibrate
 * Josh de Leeuw
 **/

jsPsych.plugins["webgazer-calibrate"] = (function() {

    var plugin = {};
  
    plugin.info = {
      name: 'webgazer-calibrate',
      description: '',
      parameters: {
        calibration_points: {
          type: jsPsych.plugins.parameterType.INT,
          default: [[10,10], [10,50], [10,90], [50,10], [50,50], [50,90], [90,10], [90,50], [90,90]]
        },
        calibration_mode: {
          type: jsPsych.plugins.parameterType.STRING,
          default: 'click', // options: 'click', 'view'
        },
        point_size:{
          type: jsPsych.plugins.parameterType.INT,
          default: 20
        },
        repetitions_per_point: {
          type: jsPsych.plugins.parameterType.INT,
          default: 1
        },
        randomize_calibration_order: {
          type: jsPsych.plugins.parameterType.BOOL,
          default: false
        },
        time_to_saccade: {
          type: jsPsych.plugins.parameterType.INT,
          default: 1000
        },
        time_per_point: {
          type: jsPsych.plugins.parameterType.STRING,
          default: 1000
        }
      }
    }
  
    plugin.trial = function(display_element, trial) {
  
      var html = `
        <div id='webgazer-calibrate-container' style='position: relative; width:100vw; height:100vh'>
        </div>`
  
      display_element.innerHTML = html;
  
      var wg_container = display_element.querySelector('#webgazer-calibrate-container');
        
      var reps_completed = 0;
      var points_completed = -1;
      var cal_points = null;

      calibrate();
      
      function calibrate(){
        jsPsych.extensions['webgazer'].resume();
        if(trial.calibration_mode == 'click'){
          jsPsych.extensions['webgazer'].startMouseCalibration();
        }
        next_calibration_round();
      }

      function next_calibration_round(){
        if(trial.randomize_calibration_order){
          cal_points = jsPsych.randomization.shuffle(trial.calibration_points);
        } else {
          cal_points = trial.calibration_points;
        }
        points_completed = -1;
        next_calibration_point();
      }
  
      function next_calibration_point(){
        points_completed++;
        if(points_completed == cal_points.length){
          reps_completed++;
          if(reps_completed == trial.repetitions_per_point){
            calibration_done();
          } else {
            next_calibration_round();
          }
        } else {
          var pt = cal_points[points_completed];
          calibration_display_gaze_only(pt);
        }
      }

      function calibration_display_gaze_only(pt){
        var pt_html = `<div id="calibration-point" style="width:${trial.point_size}px; height:${trial.point_size}px; border-radius:${trial.point_size}px; border: 1px solid #000; background-color: #333; position: absolute; left:${pt[0]}%; top:${pt[1]}%;"></div>`
        wg_container.innerHTML = pt_html;

        var pt_dom = wg_container.querySelector('#calibration-point');
        
        if(trial.calibration_mode == 'click'){
          pt_dom.style.cursor = 'pointer';
          pt_dom.addEventListener('click', function(){
            next_calibration_point();
          })
        }
        
        if(trial.calibration_mode == 'view'){
          var br = pt_dom.getBoundingClientRect();
          var x = br.left + br.width / 2;
          var y = br.top + br.height / 2;
  
          var pt_start_cal = performance.now() + trial.time_to_saccade;
          var pt_finish = performance.now() + trial.time_to_saccade + trial.time_per_point;
          
          requestAnimationFrame(function watch_dot(){
            
            if(performance.now() > pt_start_cal){
              jsPsych.extensions['webgazer'].calibratePoint(x,y,'click');
            }
            if(performance.now() < pt_finish){
              requestAnimationFrame(watch_dot);
            } else {
              next_calibration_point();
            }
          })
        }  
      }

      function calibration_done(){
        if(trial.calibration_mode == 'click'){
          jsPsych.extensions['webgazer'].stopMouseCalibration();
        }
        wg_container.innerHTML = "";
        end_trial();
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