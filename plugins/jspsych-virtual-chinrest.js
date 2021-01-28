/*
 *  plugin for jsPsych based in Qisheng Li 11/2019. /// https://github.com/QishengLi/virtual_chinrest
    
    Modified by Gustavo Juantorena 08/2020 // https://github.com/GEJ1

    Contributions from Peter J. Kohler: https://github.com/pjkohler
 */

jsPsych.plugins['virtual-chinrest'] = (function() {

  var plugin = {};

  plugin.info = {
    name: "virtual-chinrest", 
    parameters: {
      // not sure what these two parameters are supposed to do. 
      /*viewing_distance_cm: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      },
      cardWidth_px: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      },*/
      resize_units: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "none",
        description: 'What units to resize to? ["none"/"cm"/"inch"/"deg"]. If "none", no resize will be done.'
      },
      pixels_per_unit: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Pixels per unit',
        default: 100,
        description: 'After the scaling factor is applied, this many pixels will equal one unit of measurement.'
      },
      resize_allowed: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: false,
        description: 'If true, the resize of the screen will be done.'
      },
      blindspot_reps: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Blindspot measurement repetitions',
        default: 5,
        description: 'How many times to measure the blindspot location'
      },
      prompt_card: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '<b> Let’s find out how big your monitor is! </b>'+
                  '<p>Please use any credit card that you have available.<br>' +
                  'It can also be a grocery store membership card,<br>'+
                  'your drivers license or anything else of the same format.<br>'+
                  '<b>Place your card flat onto the screen, and adjust the slider below to match its size.</b></p>'+
                  '<p>If you do not have access to a real card <br>'+
                  'you can use a ruler to measure the image width to 3.37 inches or 85.6 mm.<br>'
      },
      prompt_blindspot: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '<b>Now, let’s quickly test how far away you are sitting.</b>'+
                  '<p>You might know that vision tests at a doctor’s practice often involve chinrests.<br>'+
                  'The doctor basically asks you to sit away from a screen in a specific distance.<br>'+
                  'We do this here with a “virtual chinrest”.</p><br>'+
                  '<b>Instructions</b>'+
                  '<div style="text-align: left">'+
                  '<ol><li>Put your finger on <b>space bar</b> on the keyboard.</li>'+
                  '<li>Close your right eye. <em>(Tips: it might be easier to cover your right eye by hand!)</em></li>'+
                  '<li>Using your left eye, focus on the black square.</li>'+
                  '<li>Click the button below to start the animation of the red ball. The <b style="color: red">red ball </b>'+
                  'will disappear as it moves from right to left. Press the “Space” key as soon as the ball disappears from your eye sight.</li>'+
                  '</div><br>'

      },
      card_path: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "img/card.png"
      }
    }
  }

  
  
  // Get screen size
  var w = window.innerWidth;
  var h = window.innerHeight;

  const screen_size_px = []
  screen_size_px.push(w)
  screen_size_px.push('x')
  screen_size_px.push(h)

  let trial_data = {
    "card_width_mm":  85.60, //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)

  };

  let config_data = {
    "ball_pos": [],
    "slider_clck": false
  }

  plugin.trial = function(display_element, trial) {

    const start_time = performance.now();

    console.log(trial)

    pagesize_content = 
      '<div id="page-size"><br><br>'+
        trial.prompt_card +
        '<div id="container">'+
          '<div id="slider"></div><br>'+
          '<img id="card" src="' + trial.card_path + '" style="width: 50%">'+
          '<br><br><button id=blind_spot class="btn btn-primary">Click here when you are done!</button>'+
        '</div>'+
      '</div>'

    blindspot_content = 
      '<div id="blind-spot" style="visibility: hidden">' +
        trial.prompt_blindspot +
        '<p>Please do it <b>' + trial.blindspot_reps + '</b> times. Keep your right eye closed and hit the “Space” key fast!</p><br>' +
        '<div id="svgDiv" style="width:1000px;height:200px;"></div>'+
        '<button class="btn btn-primary" id="start_ball">Start</button>'+
        '<button class="btn btn-primary" id="proceed" style="display:none">Proceed</button><br>'+
        '<b>Hit space <div id="click" style="display:inline; color: red">' + trial.blindspot_reps + '</div> more times!<b><br>'+
        '<div id="info" style="visibility:hidden">'+
          '<b id="info-h">Estimated viewing distance (cm): </b>'+
        '</div>'+
      '</div>'
    
    display_element.innerHTML = 
      '<div id="content" style="width: 900px; margin: 0 auto;">'+
        pagesize_content + 
        blindspot_content +
      '</div>'



      /*// create html for display
      var html = "<body><div id='content'><div id='page-size'><br><br><br><br><br><br>";
      // html += "<h3> Let’s find out what your monitor size is (click to go into <div onclick='fullScreen(); registerClick();' style='display:inline; cursor:pointer; color: red'><em><u>full screen mode</u></em></div>).</h2>";
      
      html += "<p>Please use any credit card that you have available (it can also be a grocery store membership card, your drivers license, or anything that is of the same format), hold it onto the screen, and adjust the slider below to its size.</p>";   
      html += "<p>(If you don't have access to a real card, you can use a ruler to measure image width to 3.37inch or 85.6mm, or make your best guess!)</p>";
      html += "<b style='font-style: italic'>Make sure you put the card onto your screen.</b>";
      html += '<br><div id="container">';
      html += "<div id='slider'></div>";
      html += '<br> <img id="card" src="img/card.png" style="width: 50%"><br><br>';
      html +='<button id="btnBlindSpot" class="btn btn-primary">Click here when you are done!</button></div></div>';

    
      html += '<div id="blind-spot" style="visibility: hidden">';
      html += '<!-- <h2 class="bolded-blue">Task 2: Where’s your blind spot?</h2> -->';
      html += "<h3>Now, let's quickly test how far away you are sitting.</h3>";
      html += "<p>You might know that vision tests at a doctor's practice often involve chinrests; the doctor basically asks you to sit away from a screen in a specific distance. We do this here with a 'virtual chinrest'.</p>";
      
      html += '<h3>Instructions</h3>';
      html += '<p>1. Put your finger on <b>space bar</b> on the keyboard.</p>';
      html += '<p>2. Close your right eye. <em>(Tips: it might be easier to cover your right eye by hand!)</em></p>';
      html += '<p>3. Using your left eye, focus on the black square.</p>';
      html += '<p>4. Click the button below to start the animation of the red ball. The <b style="color: red">red ball</b> will disappear as it moves from right to left. Press the Space key as soon as the ball disappears from your eye sight.</p><br>';
      html += '<p>Please do it <b>five</b> times. Keep your right eye closed and hit the Space key fast!</p><br>';
      html += '<button class="btn btn-primary" id="start" ">Start</button>';

      html += '<div id="svgDiv" style="width:1000px;height:200px;"></div>';
      html +=  "Hit 'space' <div id='click' style='display:inline; color: red; font-weight: bold'>5</div> more times!</div>";


      // render
      display_element.innerHTML = html; */
  
      //Event listeners for buttons

      display_element.querySelector('#blind_spot').addEventListener('click', function(){    
        configureBlindSpot()
      })
      display_element.querySelector('#start_ball').addEventListener('click', function(){    
        animateBall()
      })

      if (trial.resize_allowed === true){             
        display_element.querySelector('#proceed').addEventListener('click', function(){
          // finish trial
          display_element.innerHTML = '';
          trial_data.card_width_deg = 2*(Math.atan((trial_data["card_width_mm"]/2)/trial_data["view_dist_mm"])) * 180/Math.PI
          trial_data.px2deg = trial_data["card_width_px"] / trial_data.card_width_deg  // size of card in pixels divided by size of card in degrees of visual angle
          trial_data.rt = performance.now() - start_time;
  
          let px2unit_scr = 0
          switch (trial.resize_units) {
            case "cm":
            case "centimeters": 
              px2unit_scr = trial_data["px2mm"]*10 // pixels per centimeter
              break;
            case "inch":
            case "inches":
              px2unit_scr = trial_data["px2mm"]*25.4 // pixels per inch
              break;
            case "deg":
            case "degrees":
              px2unit_scr = trial_data["px2deg"] // pixels per degree of visual angle
              break;
          }
          if (px2unit_scr > 0) {
            // scale the window
            scale_factor = px2unit_scr / trial.pixels_per_unit;
            console.log(scale_factor, trial_data)
            document.getElementById("jspsych-content").style.transform = "scale(" + scale_factor + ")";
            // pixels have been scaled, so pixels per degree, pixels per mm and pixels per card_width needs to be updated
            trial_data.px2deg = trial_data.px2deg / scale_factor
            trial_data.px2mm = trial_data.px2mm / scale_factor
            trial_data.card_width_px = trial_data.card_width_px / scale_factor
          }
  
          trial_data.win_width_deg = window.innerWidth/trial_data.px2deg
          trial_data.win_height_deg = window.innerHeight/trial_data.px2deg
          jsPsych.finishTrial(trial_data);
        })
      } else{
        display_element.querySelector('#proceed').addEventListener('click', function(){
          end_trial()
        })
      }


      /*

      jsPsych.pluginAPI.getKeyboardResponse({ 
        callback_function: after_response,                           // we need to create after_response
        valid_responses: [trial.key],                             // valid_responses expects an array
        rt_method: 'performance',                                   // This is only relevant for RT in audio stimuli
        persist: false,                                             // true if you want to listen to more than one key
        allow_held_key: true                                       // false for a new key pressing in order to get a new response  
      });
      */ 
  }

  function after_response(response_info){
    // rt.push(response_info.rt); // response time of the key
    end_trial();
  }

  function end_trial(){
    jsPsych.finishTrial(trial_data); // ends trial and save the data
    // display_element.innerHTML = ' '; // clear the display

    jsPsych.pluginAPI.cancelAllKeyboardResponses();
  }

  (function ( distanceSetup, $ ) {  // jQuery short-hand for $(document).ready(function() { ... });

      distanceSetup.round = function(value, decimals) {
          return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
      };

      distanceSetup.px2mm = function(cardImageWidth) {
          const cardWidth = 85.6; //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)
          var px2mm = cardImageWidth/cardWidth;
          trial_data["px2mm"] = distanceSetup.round(px2mm, 2);
          return px2mm; 
      };

  }( window.distanceSetup = window.distanceSetup || {}, jQuery))

  
  function getCardWidth() {
      var card_width_px = $('#card').width();
      trial_data["card_width_px"] = distanceSetup.round(card_width_px,2);
      return card_width_px
  }

  function configureBlindSpot() {

      drawBall();
      $('#page-size').remove();
      $('#blind-spot').css({'visibility':'visible'});
      // $(document).on('keydown', recordPosition);
      $(document).on('keydown', recordPosition);

  }

  $( function() {
      $( "#slider" ).slider({value:"50"});
  } );

  $(document).ready(function() {
      $( "#slider" ).on("slide", function (event, ui) {
          var cardWidth = ui.value + "%";
          $("#card").css({"width":cardWidth});
      });

      $('#slider').on('slidechange', function(event, ui){
          config_data["slider_clck"] = true;
      });

  });


  //=============================
  //Ball Animation

  function drawBall(pos=180){
      // pos: define where the fixation square should be.
      var mySVG = SVG("svgDiv");
      const cardWidthPx = getCardWidth()
      const rectX = distanceSetup.px2mm(cardWidthPx)*pos;
      
      const ballX = rectX*0.6 // define where the ball is
      var ball = mySVG.circle(30).move(ballX, 50).fill("#f00"); 
      window.ball = ball;
      var square = mySVG.rect(30, 30).move(Math.min(rectX - 50, 950), 50); //square position
      config_data["square_pos"] = distanceSetup.round(square.cx(),2);
      config_data['rectX'] = rectX
      config_data['ballX'] = ballX
  };


  function animateBall(){
      ball.animate(7000).during(
          function(pos){
              moveX = - pos*config_data['ballX'];
              window.moveX = moveX;
              moveY = 0;
              ball.attr({transform:"translate("+moveX+","+moveY+")"});

          }
      ).loop(true, false).
      after(function(){
          animateBall();
      });

      //disable the button after clicked once.
      $("#start_ball").attr("disabled", true);
      $('#start_ball').css("display", "none");
  };

  function recordPosition(event, angle=13.5) {
      // angle: define horizontal blind spot entry point position in degrees.
      if (event.keyCode == '32') { //Press "Space"
          

          config_data["ball_pos"].push(distanceSetup.round((ball.cx() + moveX),2));
          var sum = config_data["ball_pos"].reduce((a, b) => a + b, 0);
          var ballPosLen = config_data["ball_pos"].length;
          config_data["avg_ball_pos"] = distanceSetup.round(sum/ballPosLen, 2);
          var ball_sqr_distance = (config_data["square_pos"]-config_data["avg_ball_pos"])/trial_data["px2mm"];
          var viewDistance = ball_sqr_distance/Math.radians(angle)
          trial_data["view_dist_mm"] = distanceSetup.round(viewDistance, 2);

          //counter and stop
          var counter = Number($('#click').text());
          counter = counter - 1;
          $('#click').text(Math.max(counter, 0));
          if (counter <= 0) {
              ball.stop();

              // Disable space key
              $('html').bind('keydown', function(e)
              {
                 if (e.keyCode == 32) {return false;}
              });

              // Display data
              $('#info').css("visibility", "visible");
              $('#info-h').append(trial_data["view_dist_mm"]/10)

              $('#proceed').css("display", "inline");
                           
              return //trial_data.viewing_distance_cm;  
          }

          ball.stop();
          animateBall();
      }
  }

  //helper function for radians
  // Converts from degrees to radians.
  Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
  };
  
  return plugin;

})();
