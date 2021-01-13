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
          default: 2000
        }
      }
    }
  
    // provide options for calibration routines?
    // dot clicks?
    // track a dot with mouse?
    
    // then a validation phase of staring at the dot in different locations?
  
    plugin.trial = function(display_element, trial) {
  
      var html = `
        <div id='webgazer-calibrate-container' style='position: relative; width:100vw; height:100vh'>
        </div>`
  
      display_element.innerHTML = html;

      jsPsych.extensions['webgazer'].showVideo();
  
      var wg_container = display_element.querySelector('#webgazer-calibrate-container');
  
      show_video_detect_message();
          
      function show_video_detect_message(){
        wg_container.innerHTML = "<div style='position: absolute; top: 50%; left: calc(50% - 350px); transform: translateY(-50%); width:700px;'>"+
          "<p>To start, you need to position your head so that the webcam has a good view of your eyes.</p>"+
          "<p>Use the video in the upper-left corner as a guide. Center your face in the box.</p>"+
          "<p>When your face is centered in the box and the box turns green, you can click to continue.</p>"+
          "<button id='jspsych-wg-cont' class='jspsych-btn' disabled>Continue</button>"
          // "<p>Quality of detection:</p>"+
          // "<div id='video-detect-quality-container' style='width:700px; height: 20px; background-color:#ccc; position: relative;'>"+
          // "<div id='video-detect-quality-inner' style='width:0%; height:20px; background-color: #5c5;'></div>"+
          // "<div id='video-detect-threshold' style='width: 1px; height: 20px; background-color: #f00; position: absolute; top:0; left:"+(trial.face_detect_threshold*100)+"%;'></div>"+
          "</div>"+
          "</div>"

          var observer = new MutationObserver(face_detect_event_observer);
          observer.observe(document, {
            attributes: true,
            attributeFilter: ['style'],
            subtree: true
          });
        
          document.querySelector('#jspsych-wg-cont').addEventListener('click', function(){
            observer.disconnect();
            show_begin_calibrate_message();
          })

          // function waitForFace(){
          //   var score = check_face_score();
          //   //wg_container.querySelector('#video-detect-quality-inner').style.width = (score*100) + "%"
          //   if(score){
          //     document.querySelector('#jspsych-wg-cont').disabled = false;
          //   } else {
          //     requestAnimationFrame(waitForFace);
          //   }
          // }
          // requestAnimationFrame(waitForFace);

          
      }

      function face_detect_event_observer(mutationsList, observer){
        if(mutationsList[0].target == document.querySelector('#webgazerFaceFeedbackBox')){
          if(mutationsList[0].type == 'attributes' && mutationsList[0].target.style.borderColor == "green"){
            document.querySelector('#jspsych-wg-cont').disabled = false;
          }
          if(mutationsList[0].type == 'attributes' && mutationsList[0].target.style.borderColor == "red"){
            document.querySelector('#jspsych-wg-cont').disabled = true;
          }
        }
      }
  
      function show_begin_calibrate_message(){
        jsPsych.extensions['webgazer'].hideVideo();
        wg_container.innerHTML = "<div style='position: absolute; top: 50%; left: calc(50% - 350px); transform: translateY(-50%); width:700px;'>"+
          "<p>Great! Now the eye tracker will be calibrated to translate the image of your eyes from the webcam to a location on your screen.</p>"+
          "<p>To do this, you need to look at a series of dots.</p>"+
          "<p>Keep your head still, and focus on each dot as quickly as possible. Keep your gaze fixed on the dot for as long as it is on the screen.</p>"+
          "<button id='begin-calibrate-btn' class='jspsych-btn'>Click to begin.</button>"+
          "</div>"
        document.querySelector('#begin-calibrate-btn').addEventListener('click', function(){
          calibrate();
        });
      }
  
      var reps_completed = 0;
      var points_completed = -1;
      var cal_points = null;

      function calibrate(){
        jsPsych.extensions['webgazer'].resume();
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
        var pt_html = '<div id="calibration-point" style="width:10px; height:10px; border-radius:10px; border: 1px solid #000; background-color: #333; position: absolute; left:'+pt[0]+'%; top:'+pt[1]+'%;"></div>'
        wg_container.innerHTML = pt_html;

        var pt_dom = wg_container.querySelector('#calibration-point');

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

        // jsPsych.pluginAPI.setTimeout(function(){
        //   pt_dom.style.backgroundColor = "#fff";
        //   pt_dom.addEventListener('click', function(){
        //     next_calibration_point();
        //   });
        // }, Math.random()*(trial.maximum_dot_change_delay-trial.minimum_dot_change_delay)+trial.minimum_dot_change_delay);
  
      }

      function calibration_done(){
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