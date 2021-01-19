/**
 * jspsych-virtual-chinrest
 * jspsych plugin implementation of virtual chinrest procedure from 
 * 
 * Li, Q., Joo, S.J., Yeatman, J.D. et al. 
 * Controlling for Participants’ Viewing Distance in Large-Scale, 
 * Psychophysical Online Experiments Using a Virtual Chinrest. 
 * Sci Rep 10, 904 (2020). https://doi.org/10.1038/s41598-019-57204-1
 * 
 * Based on slightly modified code by Qisheng Li in 11/2019.
 * original code available at: https://github.com/QishengLi/virtual_chinrest
 * 
 */

jsPsych.plugins["virtual-chinrest"] = (function() {

  let plugin = {};

  plugin.info = {
    name: "virtual-chinrest",
    parameters: {
      pagesize_msg: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '<b> Let’s find out how big your monitor is! </b>'+
                  '<p>Please use any credit card that you have available.<br>' +
                  'It can also be a grocery store membership card,<br>'+
                  'your drivers license or anything else of the same format.<br>'+
                  '<b>Place your card flat onto the screen, and adjust the slider below to match its size.</b></p>'+
                  '<p>If you do not have access to a real card <br>'+
                  'you can use a ruler to measure the image width to 3.37 inches or 85.6 mm.<br>'
      },
      blindspot_msg: {
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
                  '</div><br><p>Please do it <b>five</b> times. Keep your right eye closed and hit the “Space” key fast!</p><br>'

      },
      card_path: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "img/card.png"
      }
    }
  }

  let trial_data = {
    "ball_pos": [],
    "slider_clck": false,
    "card_width_mm":  85.60 //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)
  };

  plugin.trial = function(display_element, trial) {

    const start_time = performance.now();

    pagesize_content = 
      '<div id="page-size">'+
        trial.pagesize_msg +
        '<div id="container">'+
          '<div id="slider"></div><br>'+
          '<img id="card" src="' + trial.card_path + '" style="width: 50%">'+
          '<br><br><button id=blind_spot class="btn btn-primary">Click here when you are done!</button>'+
        '</div>'+
      '</div>'

    blindspot_content = 
      '<div id="blind-spot" style="visibility: hidden">' +
        trial.blindspot_msg +
        '<div id="svgDiv" style="width:1000px;height:200px;"></div>'+
        '<button class="btn btn-primary" id="start_ball">Start</button>'+
        '<button class="btn btn-primary" id="proceed" style="display:none">Proceed</button><br>'+
        '<b>Hit space <div id="click" style="display:inline; color: red">5</div> more times!<b><br>'+
        '<div id="info" style="visibility:hidden">'+
          '<b id="info-h">Estimated viewing distance (cm): </b>'+
        '</div>'+
      '</div>'
    
    display_element.innerHTML = 
      '<div id="content" style="width: 900px; margin: 0 auto;">'+
        pagesize_content + 
        blindspot_content +
      '</div>'

    display_element.querySelector('#blind_spot').addEventListener('click', function(){    
      configureBlindSpot()
    })
    display_element.querySelector('#start_ball').addEventListener('click', function(){    
      animateBall()
    })

    display_element.querySelector('#proceed').addEventListener('click', function(){    
      // finish trial
      display_element.innerHTML = '';
      trial_data.card_width_deg = 2*(Math.atan((trial_data["card_width_mm"]/2)/trial_data["view_dist_mm"])) * 180/Math.PI
      trial_data.px2deg = trial_data["card_width_px"] / trial_data.card_width_deg  // size of card in pixels divided by size of card in degrees of visual angle
      trial_data.rt = performance.now() - start_time;

      trial_data.scr_width_deg = window.innerWidth/trial_data.px2deg
      trial_data.scr_height_deg = window.innerHeight/trial_data.px2deg
      jsPsych.finishTrial(trial_data);
    })
  };

  // helper functions

  (function ( distanceSetup, $ ) {

      distanceSetup.round = function(value, decimals) {
          return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
      };

      distanceSetup.px2mm = function(cardImageWidth) {
          var px2mm = cardImageWidth/trial_data["card_width_mm"];
          trial_data["px2mm"] = distanceSetup.round(px2mm, 2);
          return px2mm; 
      };

  }( window.distanceSetup = window.distanceSetup || {}, jQuery));


  function getCardWidth() {
      var card_width_px = $('#card').width();
      trial_data["card_width_px"] = distanceSetup.round(card_width_px,2);
      return card_width_px
  }


  function configureBlindSpot() {

      drawBall();
      $('#page-size').remove();
      $('#blind-spot').css({'visibility':'visible'});
      $(document).on('keydown', recordPosition);

  };


  $( function() {
      $( "#slider" ).slider({value:"50"});
  } );

  $(document).ready(function() {
      $( "#slider" ).on("slide", function (event, ui) {
          var cardWidth = ui.value + "%";
          $("#card").css({"width":cardWidth});
      });

      $('#slider').on('slidechange', function(event, ui){
          trial_data["slider_clck"] = true;
      });

  });

  //=============================
  //Ball Animation

  function drawBall(pos=180){
      // pos: define where the fixation square should be.
      var mySVG = SVG("svgDiv");
      const card_width_px = getCardWidth()
      const rectX = distanceSetup.px2mm(card_width_px)*pos;
      
      const ballX = rectX*0.6 // define where the ball is
      var ball = mySVG.circle(30).move(ballX, 50).fill("#f00"); 
      window.ball = ball;
      var square = mySVG.rect(30, 30).move(Math.min(rectX - 50, 950), 50); //square position
      trial_data["squarePosition"] = distanceSetup.round(square.cx(),2);
      trial_data['rectX'] = rectX
      trial_data['ballX'] = ballX
  };

  function animateBall(){
      ball.animate(7000).during(
          function(pos){
              moveX = - pos*trial_data['ballX'];
              window.moveX = moveX;
              moveY = 0;
              ball.attr({transform:"translate("+moveX+","+moveY+")"});

          }
      ).loop(true, false).
      after(function(){
          animateBall();
      });

      //disbale the button after clicked once.
      $("#start_ball").attr("disabled", true);
      $('#start_ball').css("display", "none");
  };

  function recordPosition(event, angle=13.5) {
      // angle: define horizontal blind spot entry point position in degrees.
      if (event.keyCode == '32') { //Press "Space"

          trial_data["ball_pos"].push(distanceSetup.round((ball.cx() + moveX),2));
          var sum = trial_data["ball_pos"].reduce((a, b) => a + b, 0);
          var ballPosLen = trial_data["ball_pos"].length;
          trial_data["avgBallPos"] = distanceSetup.round(sum/ballPosLen, 2);
          var ball_sqr_distance = (trial_data["squarePosition"]-trial_data["avgBallPos"])/trial_data["px2mm"];
          var viewDistance = ball_sqr_distance/Math.radians(angle)
          console.log(Math.radians(angle))
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

              return;
          }

          ball.stop();
          animateBall();
      }
  }

  function registerClick(){
      trial_data["fullScreenClicked"] = true;
  }

  // Converts from degrees to radians.
  Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
  };

  return plugin;
})();
