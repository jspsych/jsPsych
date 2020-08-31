/*
 *  plugin based in  Qisheng Li 11/2019. /// https://github.com/QishengLi/virtual_chinrest
    Modified by Gustavo Juantorena 08/2020
 */

jsPsych.plugins['virtual-chin'] = (function() {

  var plugin = {};

  plugin.info = {
    name: "virtual-chin", 
    parameters: {
      viewing_distance_cm: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      },
      cardWidth_px: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      },
      pixels_per_unit: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Pixels per unit',
        default: 100,
        description: 'After the scaling factor is applied, this many pixels will equal one unit of measurement.'
      },
      prompt_instructions: {
        type: jsPsych.plugins.parameterType.STRING,
        default: null,
        description: 'Any content here will be displayed above card image.'
      },
      // prompt_card: {
      //   type: jsPsych.plugins.parameterType.STRING,
      //   default: null,
      //   description: 'Any content here will be displayed above card image.'
      // },
      // prompt_blindspot: {
      //   type: jsPsych.plugins.parameterType.STRING,
      //   default: null,
      //   description: 'Any content here will be displayed below the stimulus.'
      // }
    }
  }
  
  plugin.trial = function(display_element, trial) {
   
    // data saving
    var trial_data = { //I need to modify this in order to save important data
      'viewing_distance_cm': trial.viewing_distance_cm,
      'cardWidth_px': trial.cardWidth_px
    };

  
  //Store all the configuration data in variable 'data'
  var data = {"dataType":"configurationData"};
      
      data["ballPosition"] = [];

      data["sliderClicked"] = false;

  (function ( distanceSetup, $ ) {  // jQuery short-hand for $(document).ready(function() { ... });

      distanceSetup.round = function(value, decimals) {
          return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
      };

      distanceSetup.px2mm = function(cardImageWidth) {
          const cardWidth = 85.6; //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)
          var px2mm = cardImageWidth/cardWidth;
          data["px2mm"] = distanceSetup.round(px2mm, 2);
          return px2mm; 
      };

  }( window.distanceSetup = window.distanceSetup || {}, jQuery));


  function getCardWidth() {
      var cardWidthPx = $('#card').width();
      data["cardWidthPx"] = distanceSetup.round(cardWidthPx,2);
      console.log(cardWidthPx)

      trial_data.cardWidth_px = cardWidthPx // add to trial_data

      return cardWidthPx
  }


  function configureBlindSpot() {

      drawBall();
      $('#page-size').remove();
      $('#blind-spot').css({'visibility':'visible'});
      // $(document).on('keydown', recordPosition);
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
          data["sliderClicked"] = true;
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
      data["squarePosition"] = distanceSetup.round(square.cx(),2);
      data['rectX'] = rectX
      data['ballX'] = ballX
  };


  function animateBall(){
      ball.animate(7000).during(
          function(pos){
              moveX = - pos*data['ballX'];
              window.moveX = moveX;
              moveY = 0;
              ball.attr({transform:"translate("+moveX+","+moveY+")"});

          }
      ).loop(true, false).
      after(function(){
          animateBall();
      });

      //disbale the button after clicked once.
      $("#start").attr("disabled", true);
  };

  function recordPosition(event, angle=13.5) {
      // angle: define horizontal blind spot entry point position in degrees.
      if (event.keyCode == '32') { //Press "Space"

          data["ballPosition"].push(distanceSetup.round((ball.cx() + moveX),2));
          var sum = data["ballPosition"].reduce((a, b) => a + b, 0);
          var ballPosLen = data["ballPosition"].length;
          data["avgBallPos"] = distanceSetup.round(sum/ballPosLen, 2);
          var ball_sqr_distance = (data["squarePosition"]-data["avgBallPos"])/data["px2mm"];
          var viewDistance = ball_sqr_distance/Math.radians(angle)
          console.log(Math.radians(angle))
          data["viewDistance_mm"] = distanceSetup.round(viewDistance, 2);

          //counter and stop
          var counter = Number($('#click').text());
          counter = counter - 1;
          $('#click').text(Math.max(counter, 0));
          if (counter <= 0) {

              ball.stop();

              // Disable space key
              $('html').bind('keydown', function(e)
              {
                if (e.keyCode == 32) {return false;} //32 is spacebar
              });

              // // Display data
              // $('#info').css("visibility", "visible");
              // $('#info-h').append(data["viewDistance_mm"]/10)


              //Estimated viewing distance in centimeters
              trial_data.viewing_distance_cm = (data["viewDistance_mm"]/10); // add to trial_data

              console.log(data["viewDistance_mm"]/10);

              dist = Math.round(data["viewDistance_mm"]/10)

              // The trial must end 
              end_trial();

              // You can then DO SOMETHING HERE TO PROCEED TO YOUR NEXT STEPS OF THE EXPERIMENT. For example, add a button to go to the next page.
              // display_element.innerHTML = `<p>"Press space bar to start the experiment.</p>`
              display_element.innerHTML = 
                
              `<p style='font-size:180%;'>  Este experimento consta de dos tipos de ensayos: <br></p>
              <p style='font-size:130%;'>
              Los ensayos del primer tipo consisten en una serie de números del 1 al 20 rodeados cada
              uno por un círculo.<br> Su objetivo será unir con un trazo continuo los puntos en orden creciente,<br> tratando de
              evitar que los trazos se toquen.<br> Tendrá un límite de tiempo fijo para resolver cada ensayo.<br>
              AL COMENZAR CADA ENSAYO VERÁ UNA CRUZ EN EL CENTRO DE LA PANTALLA,<br> CUANDO ESTA DESAPAREZCA Y VEA LOS CIRCULOS
              DEBERÁ PRESIONAR EL BOTON IZQUIERDO DEL MOUSE (O SU PAD DE NOTEBOOK) <br>Y
              MANTENERLO PRESIONADO HASTA TERMINARLO.<br> No levante el dedo del botón al menos que
              hayas terminado el ensayo, o que este haya terminado por superar el tiempo límite.<br>
              El otro tipo de ensayo consiste en una serie de números del 1 al 10 y letras de la A
              a la J.<br> Su objetivo será unir con un trazo continuo los puntos de manera alternada (ejemplo 1-A-2-B-3-C,
              etc).<br><br><br>
  
              Su objetivo será realizar la tarea SIN PASAR POR ENCIMA DE SU PROPIO TRAZO y lo más rápido posible.<br>
              Los ensayos van a aparecer siempre alternadamente.<br><br>
              
              ¡Suerte y muchas gracias por participar! </p><br>
              
              <p style='font-size:200%;'>  Para comenzar por favor presione la barra espaciadora </p>
              `

              return trial_data.viewing_distance_cm;
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


      // You can write functions here that live only in the scope of plugin.trial
      function show_stimulus(){
        display_element.innerHTML = `<p>Por favor repetí la medición de la tarjeta,pero esta vez utilizando la barra deslizante.</p>`    


          var html = "<body><div id='content'><div id='page-size'><br><br><br><br><br><br>";
          // html += "<h3> Let’s find out what your monitor size is (click to go into <div onclick='fullScreen(); registerClick();' style='display:inline; cursor:pointer; color: red'><em><u>full screen mode</u></em></div>).</h2>";
          
          html += "<p>Por favor repita la medición de la misma tarjeta, pero esta vez utilizando la barra deslizante.</p>";   
          
          html += "<b style='font-style: italic'>Asegúrese de poner la tarjeta sobre la pantalla.</b>";
          html += '<br><div id="container">';
          html += "<div id='slider'></div>";
          html += '<br> <img id="card" src="card.png" style="width: 50%"><br><br>';
          html +='<button id="btnBlindSpot" class="btn btn-primary">Presione aquí cuando termine!</button></div></div>';

        
          html += '<div id="blind-spot" style="visibility: hidden">';
          html += '<!-- <h2 class="bolded-blue">Task 2: Where’s your blind spot?</h2> -->';
          html += "<h3>Ahora vamos a estimar su distancia a la pantalla.</h3>";
          
          html += '<h3>Instrucciones</h3>';
          html += '<p>1. Coloque su dedo índice en la <b>barra espaciadora</b> </p>';
          html += '<p>2. Cierre su ojo derecho. <em> (Tip:Quizá le resulte más fácil tapándolo con su mano!)</em></p>';
          html += '<p>3. Usando su ojo izquierdo, haga foco en el cuadrado negro.</p>';
          html += '<p>4. Presione el botón de abajo para iniciar la animación de la pelotita roja. Esa <b style="color: red">pelotita roja</b> va a desaparecer de su vista en algún momento. Ni bien la deje de ver (siempre enfocando en el cuadrado negro) presione una vez la barra lo más rápidamente posible.</p><br>';
          html += '<p>Por favor repita el proceso <b>cinco</b> veces. Mantenga su ojo derecho cerrado y presione la barra espaciadora lo más rápidamente posible!</p><br>';
          html += '<button class="btn btn-primary" id="start" ">Empezar</button>';

          html += '<div id="svgDiv" style="width:1000px;height:200px;"></div>';
          html +=  "Presioná la barra <div id='click' style='display:inline; color: red; font-weight: bold'>5</div> veces más!</div>";


      display_element.innerHTML = html; //
      document.getElementById("btnBlindSpot").addEventListener('click', function() {
        console.log('presionaste el boton 1');
        configureBlindSpot();
      });

      document.getElementById("start").addEventListener('click', function() {
        console.log('presionaste el boton 2');
        animateBall(); 
      });

        jsPsych.pluginAPI.getKeyboardResponse({ 
          callback_function: after_response,                           // we need to create after_response
          valid_responses: [trial.key],                             // valid_responses expects an array
          rt_method: 'performance',                                   // This is only relevant for RT in audio stimuli
          persist: false,                                             // true if you want to listen to more than one key
          allow_held_key: true                                       // false for a new key pressing in order to get a new response  
        }); 
      }
                  
              //     <div id="container">
              //         <div id="slider"></div>
              //         <br>
              //         <img id="card" src="card.png" style="width: 50%">
              //         <br><br>
              //         <button class="btn btn-primary" onclick="configureBlindSpot()">Click here when you are done!</button>
              //     </div>
              // </div>
      


       // scales the stimulus
    //     var scale_factor;
    //     var final_height_px, final_width_px;
    //     final_width_px = trial.cardWidth_px;
    //     function scale() {
    //       final_width_px = scale_div.offsetWidth;
    //       //final_height_px = scale_div.offsetHeight;

    //       var pixels_unit_screen = final_width_px / trial.item_width;

    //       scale_factor = pixels_unit_screen / trial.pixels_per_unit;
    //       document.getElementById("jspsych-content").style.transform = "scale(" + scale_factor + ")";
    // };
      function after_response(response_info){
        // rt.push(response_info.rt); // response time of the key
        // scale() // Esto lo agregue pero no creo que quede
        end_trial();
      }

      function end_trial(){
        document.getElementsByClassName("jspsych-content-wrapper")[0].style.backgroundColor = 'gray'; //Background color
        // trial_data.viewingDistance=   JSON.stringify(viewingDistance); // best practice for saving in jsPsych. It is a JSON instead of array.
        jsPsych.finishTrial(trial_data); // ends trial and save the data
        display_element.innerHTML = ' '; // clear the display

      }
      show_stimulus();

    };

    return plugin;
  })();


