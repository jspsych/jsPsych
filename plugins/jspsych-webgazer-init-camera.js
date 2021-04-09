/**
 * jspsych-webgazer-init-camera
 * Josh de Leeuw
 **/

 jsPsych.plugins["webgazer-init-camera"] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'webgazer-init-camera',
    description: '',
    parameters: {
      instructions: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        default: `
            <p>Position your head so that the webcam has a good view of your eyes.</p>
            <p>Center your face in the box and look directly towards the camera.</p>
            <p>It is important that you try and keep your head reasonably still throughout the experiment, so please take a moment to adjust your setup to be comfortable.</p>
            <p>When your face is centered in the box and the box is green, you can click to continue.</p>`
      },
      button_text: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'Continue'
      }
    }
  }

  plugin.trial = function (display_element, trial) {

    var start_time = performance.now();
    var load_time;

    if (!jsPsych.extensions.webgazer.isInitialized()) {
      jsPsych.extensions.webgazer.start().then(function () {
        showTrial();
      }).catch(function () {
        display_element.innerHTML = `<p>The experiment cannot continue because the eye tracker failed to start.</p>
            <p>This may be because of a technical problem or because you did not grant permission for the page to use your camera.</p>`
      });
    } else {
      showTrial();
    }

    function showTrial() {

      load_time = Math.round(performance.now() - start_time);

      var style = `
        <style id="webgazer-center-style">
          #webgazerVideoContainer { top: 20px !important; left: calc(50% - 160px) !important;}
        </style>
      `
      document.querySelector('head').insertAdjacentHTML('beforeend', style);

      var html = `
        <div id='webgazer-init-container' style='position: relative; width:100vw; height:100vh'>
        </div>`

      display_element.innerHTML = html;

      jsPsych.extensions['webgazer'].showVideo();
      jsPsych.extensions['webgazer'].resume();

      var wg_container = display_element.querySelector('#webgazer-init-container');


      wg_container.innerHTML = `
        <div style='position: absolute; top: max(260px, 40%); left: calc(50% - 400px); width:800px;'>
        ${trial.instructions}
        <button id='jspsych-wg-cont' class='jspsych-btn' disabled>${trial.button_text}</button>
        </div>`

      if(is_face_detect_green()){
        document.querySelector('#jspsych-wg-cont').disabled = false;
      } else {
        var observer = new MutationObserver(face_detect_event_observer);
        observer.observe(document, {
          attributes: true,
          attributeFilter: ['style'],
          subtree: true
        });
      }

      document.querySelector('#jspsych-wg-cont').addEventListener('click', function () {
        if(observer){
          observer.disconnect();
        }
        end_trial();
      });
    }

    function is_face_detect_green(){
      if(document.querySelector("#webgazerFaceFeedbackBox")){
        return document.querySelector('#webgazerFaceFeedbackBox').style.borderColor == "green"
      } else {
        return false;
      }
    }

    function face_detect_event_observer(mutationsList, observer) {
      if (mutationsList[0].target == document.querySelector('#webgazerFaceFeedbackBox')) {
        if (mutationsList[0].type == 'attributes' && mutationsList[0].target.style.borderColor == "green") {
          document.querySelector('#jspsych-wg-cont').disabled = false;
        }
        if (mutationsList[0].type == 'attributes' && mutationsList[0].target.style.borderColor == "red") {
          document.querySelector('#jspsych-wg-cont').disabled = true;
        }
      }
    }

    // function to end trial when it is time
    function end_trial() {
      
      jsPsych.extensions['webgazer'].pause();
      jsPsych.extensions['webgazer'].hideVideo();


      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        load_time: load_time
      };

      // clear the display
      display_element.innerHTML = '';

      document.querySelector('#webgazer-center-style').remove();

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

  };

  return plugin;
})();