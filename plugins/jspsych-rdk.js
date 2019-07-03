/*
		
	RDK plugin for JsPsych
	----------------------
	
	This code was created in the Consciousness and Metacognition Lab at UCLA, 
	under the supervision of Brian Odegaard and Hakwan Lau

	We would appreciate it if you cited this paper when you use the RDK: 
	Rajananda, S., Lau, H. & Odegaard, B., (2018). A Random-Dot Kinematogram for Web-Based Vision Research. Journal of Open Research Software. 6(1), p.6. DOI: [http://doi.org/10.5334/jors.194]
	
	----------------------
	
	Copyright (C) 2017  Sivananda Rajananda
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
	
*/
		
		
jsPsych.plugins["rdk"] = (function() {

	var plugin = {};
	
	plugin.info = {
	    name: "rdk",
	    parameters: {
		    choices: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Choices",
		      default: [],
		      array: true,
		      description: "The valid keys that the subject can press to indicate a response"
		    },
		    correct_choice: {
		      type: jsPsych.plugins.parameterType.STRING,
		      pretty_name: "Correct choice",
		      default: undefined,
		      array: true,
		      description: "The correct keys for that trial"
		    },
		    trial_duration: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Trial duration",
		      default: 500,
		      description: "The length of stimulus presentation"
		    },
		    response_ends_trial: {
		      type: jsPsych.plugins.parameterType.BOOL,
		      pretty_name: "Response ends trial",
		      default: true,
		      description: "If true, then any valid key will end the trial"
		    },
		    number_of_apertures: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Number of apertures",
		      default: 1,
		      description: "The number of RDK apertures (If more than one, make sure to separate them by setting aperture_center_x and aperture_center_y for each RDK)"
		    },
		    number_of_dots: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Number of dots",
		      default: 300,
		      description: "The number of dots per set in the stimulus"
		    },
		    number_of_sets: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Number of sets",
		      default: 1,
		      description: "The number of sets of dots to cycle through"
		    },
		    coherent_direction: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Coherent direction",
		      default: 0,
		      description: "The direction of coherent motion in degrees"
		    },
		    coherence: {
		      type: jsPsych.plugins.parameterType.FLOAT,
		      pretty_name: "Coherence",
		      default: 0.5,
		      description: "The percentage of dots moving in the coherent direction"
		    },
		    opposite_coherence: {
		      type: jsPsych.plugins.parameterType.FLOAT,
		      pretty_name: "Opposite coherence",
		      default: 0,
		      description: "The percentage of dots moving in the direction opposite of the coherent direction"
		    },
		    dot_radius: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Dot radius",
		      default: 2,
		      description: "The radius of the dots in pixels"
		    },
		    dot_life: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Dot life",
		      default: -1,
		      description: "The number of frames that pass before each dot disappears and reappears somewhere else"
		    },
		    move_distance: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Move distance",
		      default: 1,
		      description: "The distance in pixels each dot moves per frame"
		    },
		    aperture_width: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Aperture width",
		      default: 600,
		      description: "The width of the aperture in pixels"
		    },
		    aperture_height: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Aperture height",
		      default: 400,
		      description: "The height of the aperture in pixels"
		    },
		    dot_color: {
		      type: jsPsych.plugins.parameterType.STRING,
		      pretty_name: "Dot color",
		      default: "white",
		      description: "The color of the dots"
		    },
		    background_color: {
		      type: jsPsych.plugins.parameterType.STRING,
		      pretty_name: "Background color",
		      default: "gray",
		      description: "The background of the stimulus"
		    },
		    RDK_type: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "RDK type",
		      default: 3,
		      description: "The Type of RDK (refer to documentation for details)"
		    },
		    aperture_type: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Aperture Type",
		      default: 2,
		      description: "The shape of the aperture"
		    },
		    reinsert_type: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Reinsert type",
		      default: 2,
		      description: "The reinsertion rule for dots that move out of the aperture"
		    },
		    aperture_center_x: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Aperture center X",
		      default: window.innerWidth/2,
		      description: "The x-coordinate of the center of the aperture"
		    },
		    aperture_center_y: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Aperture center Y",
		      default: window.innerHeight/2,
		      description: "The y-coordinate of the center of the aperture"
		    },
		    fixation_cross: {
		      type: jsPsych.plugins.parameterType.INT, //boolean
		      pretty_name: "Fixation cross",
		      default: false,
		      description: "If true, then a fixation cross will be present in the middle of the screen"
		    },
		    fixation_cross_width: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Fixation cross width",
		      default: 20,
		      description: "The width of the fixation cross in pixels"
		    },
		    fixation_cross_height: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Fixation cross height",
		      default: 20,
		      description: "The height of the fixation cross in pixels"
		    },
		    fixation_cross_color: {
		      type: jsPsych.plugins.parameterType.STRING,
		      pretty_name: "Fixation cross color",
		      default: "black",
		      description: "The color of the fixation cross"
		    },
		    fixation_cross_thickness: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Fixation cross thickness",
		      default: 1,
		      description: "The thickness of the fixation cross"
		    },
		    border: {
		      type: jsPsych.plugins.parameterType.BOOL,
		      pretty_name: "Border",
		      default: false,
		      description: "The presence of a border around the aperture"
		    },
		    border_thickness: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Border width",
		      default: 1,
		      description: "The thickness of the border in pixels"
		    },
		    border_color: {
		      type: jsPsych.plugins.parameterType.STRING,
		      pretty_name: "Border Color",
		      default: 1,
		      description: "The color of the border"
		    }
	    }
	 }


	//BEGINNING OF TRIAL 
	plugin.trial = function(display_element, trial) {

		//--------------------------------------
		//---------SET PARAMETERS BEGIN---------
		//--------------------------------------
		
		
		//Note on '||' logical operator: If the first option is 'undefined', it evalutes to 'false' and the second option is returned as the assignment
		trial.choices = assignParameterValue(trial.choices, []);
		trial.correct_choice = assignParameterValue(trial.correct_choice, undefined);
		trial.trial_duration = assignParameterValue(trial.trial_duration, 500);
		trial.response_ends_trial = assignParameterValue(trial.response_ends_trial, true);
		trial.number_of_apertures = assignParameterValue(trial.number_of_apertures, 1);
		trial.number_of_dots = assignParameterValue(trial.number_of_dots, 300);
		trial.number_of_sets = assignParameterValue(trial.number_of_sets, 1);
		trial.coherent_direction = assignParameterValue(trial.coherent_direction, 0);
		trial.coherence = assignParameterValue(trial.coherence, 0.5);
		trial.opposite_coherence = assignParameterValue(trial.opposite_coherence, 0);
		trial.dot_radius = assignParameterValue(trial.dot_radius, 2);
		trial.dot_life = assignParameterValue(trial.dot_life, -1);
		trial.move_distance = assignParameterValue(trial.move_distance, 1);
		trial.aperture_width = assignParameterValue(trial.aperture_width, 600);
		trial.aperture_height = assignParameterValue(trial.aperture_height, 400);
		trial.dot_color = assignParameterValue(trial.dot_color, "white");
		trial.background_color = assignParameterValue(trial.background_color, "gray");
		trial.RDK_type = assignParameterValue(trial.RDK_type, 3);
		trial.aperture_type = assignParameterValue(trial.aperture_type, 2);
		trial.reinsert_type = assignParameterValue(trial.reinsert_type, 2);
		trial.aperture_center_x = assignParameterValue(trial.aperture_center_x, window.innerWidth/2);
		trial.aperture_center_y = assignParameterValue(trial.aperture_center_y, window.innerHeight/2);
		trial.fixation_cross = assignParameterValue(trial.fixation_cross, false); 
		trial.fixation_cross_width = assignParameterValue(trial.fixation_cross_width, 20);
		trial.fixation_cross_height = assignParameterValue(trial.fixation_cross_height, 20);
		trial.fixation_cross_color = assignParameterValue(trial.fixation_cross_color, "black");
		trial.fixation_cross_thickness = assignParameterValue(trial.fixation_cross_thickness, 1);
		trial.border = assignParameterValue(trial.border, false);
		trial.border_thickness = assignParameterValue(trial.border_thickness, 1);
		trial.border_color = assignParameterValue(trial.border_color, "black");
		
		
		//For square and circle, set the aperture height == aperture width
		if (apertureType == 1 || apertureType == 3) {
			trial.aperture_height = trial.aperture_width;
		}

		//Convert the parameter variables to those that the code below can use
		
		var nApertures = trial.number_of_apertures; //The number of apertures
		var nDots = trial.number_of_dots; //Number of dots per set (equivalent to number of dots per frame)
		var nSets = trial.number_of_sets; //Number of sets to cycle through per frame
		var coherentDirection = trial.coherent_direction; //The direction of the coherentDots in degrees. Starts at 3 o'clock and goes counterclockwise (0 == rightwards, 90 == upwards, 180 == leftwards, 270 == downwards), range 0 - 360
		var coherence = trial.coherence; //Proportion of dots to move together, range from 0 to 1
		var oppositeCoherence = trial.opposite_coherence; // The coherence for the dots going the opposite direction as the coherent dots
		var dotRadius = trial.dot_radius; //Radius of each dot in pixels
		var dotLife = trial.dot_life; //How many frames a dot will keep following its trajectory before it is redrawn at a random location. -1 denotes infinite life (the dot will only be redrawn if it reaches the end of the aperture).
		var moveDistance = trial.move_distance; //How many pixels the dots move per frame
		var apertureWidth = trial.aperture_width; // How many pixels wide the aperture is. For square aperture this will be the both height and width. For circle, this will be the diameter.
		var apertureHeight = trial.aperture_height; //How many pixels high the aperture is. Only relevant for ellipse and rectangle apertures. For circle and square, this is ignored.
		var dotColor = trial.dot_color; //Color of the dots
		var backgroundColor = trial.background_color; //Color of the background
		var apertureCenterX = trial.aperture_center_x; // The x-coordinate of center of the aperture on the screen, in pixels
		var apertureCenterY = trial.aperture_center_y; // The y-coordinate of center of the aperture on the screen, in pixels
		

		/* RDK type parameter
		** See Fig. 1 in Scase, Braddick, and Raymond (1996) for a visual depiction of these different signal selection rules and noise types

		-------------------
		SUMMARY:

		Signal Selection rule:
		-Same: Each dot is designated to be either a coherent dot (signal) or incoherent dot (noise) and will remain so throughout all frames in the display. Coherent dots will always move in the direction of coherent motion in all frames.
		-Different: Each dot can be either a coherent dot (signal) or incoherent dot (noise) and will be designated randomly (weighted based on the coherence level) at each frame. Only the dots that are designated to be coherent dots will move in the direction of coherent motion, but only in that frame. In the next frame, each dot will be designated randomly again on whether it is a coherent or incoherent dot.

		Noise Type:
		-Random position: The incoherent dots appear in a random location in the aperture in each frame
		-Random walk: The incoherent dots will move in a random direction (designated randomly in each frame) in each frame.
		-Random direction: Each incoherent dot has its own alternative direction of motion (designated randomly at the beginning of the trial), and moves in that direction in each frame.

		-------------------

		 1 - same && random position
		 2 - same && random walk
		 3 - same && random direction
		 4 - different && random position
		 5 - different && random walk
		 6 - different && random direction         */

		var RDK = trial.RDK_type;


		/* 
		Shape of aperture
		 1 - Circle
		 2 - Ellipse
		 3 - Square
		 4 - Rectangle
		*/
		var apertureType = trial.aperture_type;

		/*
		Out of Bounds Decision
		How we reinsert a dot that has moved outside the edges of the aperture:
		1 - Randomly appear anywhere in the aperture
		2 - Appear on the opposite edge of the aperture (Random if square or rectangle, reflected about origin in circle and ellipse)
		*/
		var reinsertType = trial.reinsert_type;
		
		//Fixation Cross Parameters
		var fixationCross = trial.fixation_cross; //To display or not to display the cross
		var fixationCrossWidth = trial.fixation_cross_width;  //The width of the fixation cross in pixels
		var fixationCrossHeight = trial.fixation_cross_height; //The height of the fixation cross in pixels
		var fixationCrossColor = trial.fixation_cross_color; //The color of the fixation cross
		var fixationCrossThickness = trial.fixation_cross_thickness; //The thickness of the fixation cross, must be positive number above 1
		
		//Border Parameters
		var border = trial.border; //To display or not to display the border
		var borderThickness = trial.border_thickness; //The width of the border in pixels
		var borderColor = trial.border_color; //The color of the border



		//--------------------------------------
		//----------SET PARAMETERS END----------
		//--------------------------------------

		//--------Set up Canvas begin-------
		
		//Create a canvas element and append it to the DOM
		var canvas = document.createElement("canvas");
		display_element.appendChild(canvas); 
		
		
		//The document body IS 'display_element' (i.e. <body class="jspsych-display-element"> .... </body> )
		var body = document.getElementsByClassName("jspsych-display-element")[0];
		
		//Save the current settings to be restored later
		var originalMargin = body.style.margin;
		var originalPadding = body.style.padding;
		var originalBackgroundColor = body.style.backgroundColor;
		
		//Remove the margins and paddings of the display_element
		body.style.margin = 0;
		body.style.padding = 0;
		body.style.backgroundColor = backgroundColor; //Match the background of the display element to the background color of the canvas so that the removal of the canvas at the end of the trial is not noticed

		//Remove the margins and padding of the canvas
		canvas.style.margin = 0;
		canvas.style.padding = 0;		
		
		//Get the context of the canvas so that it can be painted on.
		var ctx = canvas.getContext("2d");

		//Declare variables for width and height, and also set the canvas width and height to the window width and height
		var canvasWidth = canvas.width = window.innerWidth;
		var canvasHeight = canvas.height = window.innerHeight;

		//Set the canvas background color
		canvas.style.backgroundColor = backgroundColor;

		//--------Set up Canvas end-------
		
		
		
		//--------RDK variables and function calls begin--------
		
		//This is the main part of the trial that makes everything run

		//Global variable for the current aperture number
		var currentApertureNumber;

		//3D Array to hold the dots (1st D is Apertures, 2nd D is Sets, 3rd D is Dots)
		var dotArray3d = [];

		//Variables for different apertures (initialized in setUpMultipleApertures function below)
		var nDotsArray;
		var nSetsArray;
		var coherentDirectionArray;
		var coherenceArray;
		var oppositeCoherenceArray;
		var dotRadiusArray;
		var dotLifeArray;
		var moveDistanceArray;
		var apertureWidthArray;
		var apertureHeightArray;
		var dotColorArray;
		var apertureCenterXArray;
		var apertureCenterYArray;
					
		// Set up multiple apertures
		setUpMultipleApertures();

		//Declare aperture parameters for initialization based on shape (used in initializeApertureDimensions function below)
		var horizontalAxis;
		var verticalAxis;

		//Calculate the x and y jump sizes for coherent dots
		var coherentJumpSizeX;
		var coherentJumpSizeY;

		//Calculate the number of coherent, opposite coherent, and incoherent dots
		var nCoherentDots;
		var nOppositeCoherentDots;
		var nIncoherentDots;

		//Make the array of arrays containing dot objects
		var dotArray2d;

		var dotArray; //Declare a global variable to hold the current array
		var currentSetArray; //Declare and initialize a global variable to cycle through the dot arrays

		
		//Initialize stopping condition for animateDotMotion function that runs in a loop
		var stopDotMotion = false;
		
		//Variable to control the frame rate, to ensure that the first frame is skipped because it follows a different timing
		var firstFrame = true; //Used to skip the first frame in animate function below (in animateDotMotion function)
		
		//Variable to start the timer when the time comes
		var timerHasStarted = false;

		//Initialize object to store the response data. Default values of -1 are used if the trial times out and the subject has not pressed a valid key
		var response = {
			rt: -1,
			key: -1
		}
		
		//Declare a global timeout ID to be initialized below in animateDotMotion function and to be used in after_response function
		var timeoutID;
		
		//Declare global variable to be defined in startKeyboardListener function and to be used in end_trial function
		var keyboardListener; 
		
		//Declare global variable to store the frame rate of the trial
		var frameRate = []; //How often the monitor refreshes, in ms. Currently an array to store all the intervals. Will be converted into a single number (the average) in end_trial function.
		
		//variable to store how many frames were presented.
		var numberOfFrames = 0;

		//This runs the dot motion simulation, updating it according to the frame refresh rate of the screen.
		animateDotMotion();
		
		
		//--------RDK variables and function calls end--------



		//-------------------------------------
		//-----------FUNCTIONS BEGIN-----------
		//-------------------------------------

		//----JsPsych Functions Begin----
		
		
		//Function to start the keyboard listener
		function startKeyboardListener(){
			//Start the response listener if there are choices for keys
			if (trial.choices != jsPsych.NO_KEYS) {
				//Create the keyboard listener to listen for subjects' key response
				keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
					callback_function: after_response, //Function to call once the subject presses a valid key
					valid_responses: trial.choices, //The keys that will be considered a valid response and cause the callback function to be called
					rt_method: 'performance', //The type of method to record timing information. 
					persist: false, //If set to false, keyboard listener will only trigger the first time a valid key is pressed. If set to true, it has to be explicitly cancelled by the cancelKeyboardResponse plugin API.
					allow_held_key: false //Only register the key once, after this getKeyboardResponse function is called. (Check JsPsych docs for better info under 'jsPsych.pluginAPI.getKeyboardResponse').
				});
			}
		}

		//Function to end the trial proper
		function end_trial() {
			
			//Stop the dot motion animation
			stopDotMotion = true;
			
			//Store the number of frames
			numberOfFrames = frameRate.length;
			
			//Variable to store the frame rate array
			var frameRateArray = frameRate;
			
			//Calculate the average frame rate
			if(frameRate.length > 0){//Check to make sure that the array is not empty
				frameRate = frameRate.reduce((total,current) => total + current)/frameRate.length; //Sum up all the elements in the array
			}else{
				frameRate = 0; //Set to zero if the subject presses an answer before a frame is shown (i.e. if frameRate is an empty array)
			}

			//Kill the keyboard listener if keyboardListener has been defined
			if (typeof keyboardListener !== 'undefined') {
				jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
			}

			//Place all the data to be saved from this trial in one data object
			var trial_data = { 
				"rt": response.rt, //The response time
				"key_press": response.key, //The key that the subject pressed
				"correct": correctOrNot(), //If the subject response was correct
				"choices": trial.choices, //The set of valid keys
				"correct_choice": trial.correct_choice, //The correct choice
				"trial_duration": trial.trial_duration, //The trial duration 
				"response_ends_trial": trial.response_ends_trial, //If the response ends the trial
				"number_of_apertures": trial.number_of_apertures,
				"number_of_dots": trial.number_of_dots,
				"number_of_sets": trial.number_of_sets,
				"coherent_direction": trial.coherent_direction,
				"coherence": trial.coherence,
				"opposite_coherence": trial.opposite_coherence,
				"dot_radius": trial.dot_radius,
				"dot_life": trial.dot_life,
				"move_distance": trial.move_distance,
				"aperture_width": trial.aperture_width,
				"aperture_height": trial.aperture_height,
				"dot_color": trial.dot_color,
				"background_color": trial.background_color,
				"RDK_type": trial.RDK_type,
				"aperture_type": trial.aperture_type,
				"reinsert_type": trial.reinsert_type,
				"frame_rate": frameRate, //The average frame rate for the trial
				"frame_rate_array": JSON.stringify(frameRateArray), //The array of ms per frame in this trial, in the form of a JSON string
				"number_of_frames": numberOfFrames, //The number of frames in this trial
				"aperture_center_x": trial.aperture_center_x,
				"aperture_center_y": trial.aperture_center_y,
				"fixation_cross": trial.fixation_cross,
				"fixation_cross_width": trial.fixation_cross_width,
				"fixation_cross_height": trial.fixation_cross_height,
				"fixation_cross_color": trial.fixation_cross_color,
				"fixation_cross_thickness": trial.fixation_cross_thickness,
				"border": trial.border,
				"border_thickness": trial.border_thickness,
				"border_color": trial.border_color,
				"canvas_width": canvasWidth,
				"canvas_height": canvasHeight
				
			}
			
			//Remove the canvas as the child of the display_element element
			display_element.innerHTML='';
			
			//Restore the settings to JsPsych defaults
			body.style.margin = originalMargin;
			body.style.padding = originalPadding;
			body.style.backgroundColor = originalBackgroundColor

			//End this trial and move on to the next trial
			jsPsych.finishTrial(trial_data);
			
		} //End of end_trial

		//Function to record the first response by the subject
		function after_response(info) {

			//If the response has not been recorded, record it
			if (response.key == -1) {
				response = info; //Replace the response object created above
			}

			//If the parameter is set such that the response ends the trial, then kill the timeout and end the trial
			if (trial.response_ends_trial) {
				window.clearTimeout(timeoutID);
				end_trial();
			}

		} //End of after_response
		
		//Function that determines if the response is correct
		function correctOrNot(){
						
			//Check that the correct_choice has been defined
			if(typeof trial.correct_choice !== 'undefined'){
				//If the correct_choice variable holds an array
				if(trial.correct_choice.constructor === Array){ //If it is an array
					//If the elements are characters
					if(typeof trial.correct_choice[0] === 'string' || trial.correct_choice[0] instanceof String){
						trial.correct_choice = trial.correct_choice.map(function(x){return x.toUpperCase();}); //Convert all the values to upper case
						return trial.correct_choice.includes(String.fromCharCode(response.key)); //If the response is included in the correct_choice array, return true. Else, return false.
					}
					//Else if the elements are numbers (javascript character codes)
					else if (typeof trial.correct_choice[0] === 'number'){
						return trial.correct_choice.includes(response.key); //If the response is included in the correct_choice array, return true. Else, return false.
					}
				}
				//Else compare the char with the response key
				else{
					//If the element is a character
					if(typeof trial.correct_choice === 'string' || trial.correct_choice instanceof String){
						//Return true if the user's response matches the correct answer. Return false otherwise.
						return response.key == trial.correct_choice.toUpperCase().charCodeAt(0);
					}
					//Else if the element is a number (javascript character codes)
					else if (typeof trial.correct_choice === 'number'){
						console.log(response.key == trial.correct_choice);
						return response.key == trial.correct_choice;
					}
				}
			}
		}

		//----JsPsych Functions End----

		//----RDK Functions Begin----

		//Set up the variables for the apertures
		function setUpMultipleApertures(){
			nDotsArray = setParameter(nDots);
			nSetsArray = setParameter(nSets); 
			coherentDirectionArray = setParameter(coherentDirection); 
			coherenceArray = setParameter(coherence); 
			oppositeCoherenceArray = setParameter(oppositeCoherence); 
			dotRadiusArray = setParameter(dotRadius); 
			dotLifeArray = setParameter(dotLife); 
			moveDistanceArray = setParameter(moveDistance); 
			apertureWidthArray = setParameter(apertureWidth); 
			apertureHeightArray = setParameter(apertureHeight); 
			dotColorArray = setParameter(dotColor);  
			apertureCenterXArray = setParameter(apertureCenterX); 
			apertureCenterYArray = setParameter(apertureCenterY); 
			RDKArray = setParameter(RDK);
			apertureTypeArray = setParameter(apertureType);
			reinsertTypeArray = setParameter(reinsertType);
			fixationCrossArray = setParameter(fixationCross);
			fixationCrossWidthArray = setParameter(fixationCrossWidth);
			fixationCrossHeightArray = setParameter(fixationCrossHeight);
			fixationCrossColorArray = setParameter(fixationCrossColor);
			fixationCrossThicknessArray = setParameter(fixationCrossThickness);
			borderArray = setParameter(border);
			borderThicknessArray = setParameter(borderThickness);
			borderColorArray = setParameter(borderColor);
			
			currentSetArray = setParameter(0); //Always starts at zero


			//Loop through the number of apertures to make the dots
			for(currentApertureNumber = 0; currentApertureNumber < nApertures; currentApertureNumber++){
				
				//Initialize the parameters to make the 2d dot array (one for each aperture);
				initializeCurrentApertureParameters();
        
				//Make each 2d array and push it into the 3d array
				dotArray3d.push(makeDotArray2d());
			}
		}
		
		//Function to set the parameters of the array
		function setParameter(originalVariable){
			//Check if it is an array and its length matches the aperture then return the original array
			if(originalVariable.constructor === Array && originalVariable.length === nApertures){
				return originalVariable;
			}
			//Else if it is not an array, we make it an array with duplicate values
			else if(originalVariable.constructor !== Array){
				
				var tempArray = [];
				
				//Make a for loop and duplicate the values
				for(var i = 0; i < nApertures; i++){
					tempArray.push(originalVariable);
				}
				return tempArray;
			}
			//Else if the array is not long enough, then print out that error message
			else if(originalVariable.constructor === Array && originalVariable.length !== nApertures){
				console.error("If you have more than one aperture, please ensure that arrays that are passed in as parameters are the same length as the number of apertures. Else you can use a single value without the array");
			}
			//Else print a generic error
			else{
				console.error("A parameter is incorrectly set. Please ensure that the nApertures parameter is set to the correct value (if using more than one aperture), and all others parameters are set correctly.");
			}
		}
		
		//Function to set the global variables to the current aperture so that the correct dots are updated and drawn
		function initializeCurrentApertureParameters(){
			
			//Set the global variables to that relevant to the current aperture
			nDots = nDotsArray[currentApertureNumber];
			nSets = nSetsArray[currentApertureNumber]; 
			coherentDirection = coherentDirectionArray[currentApertureNumber]; 
			coherence = coherenceArray[currentApertureNumber]; 
			oppositeCoherence = oppositeCoherenceArray[currentApertureNumber]; 
			dotRadius = dotRadiusArray[currentApertureNumber]; 
			dotLife = dotLifeArray[currentApertureNumber]; 
			moveDistance = moveDistanceArray[currentApertureNumber]; 
			apertureWidth = apertureWidthArray[currentApertureNumber]; 
			apertureHeight = apertureHeightArray[currentApertureNumber]; 
			dotColor = dotColorArray[currentApertureNumber]; 
			apertureCenterX = apertureCenterXArray[currentApertureNumber]; 
			apertureCenterY = apertureCenterYArray[currentApertureNumber]; 
			RDK = RDKArray[currentApertureNumber];
			apertureType = apertureTypeArray[currentApertureNumber];
			reinsertType = reinsertTypeArray[currentApertureNumber];
			fixationCross = fixationCrossArray[currentApertureNumber];
			fixationCrossWidth = fixationCrossWidthArray[currentApertureNumber];
			fixationCrossHeight = fixationCrossHeightArray[currentApertureNumber];
			fixationCrossColor = fixationCrossColorArray[currentApertureNumber];
			fixationCrossThickness = fixationCrossThicknessArray[currentApertureNumber];
			border = borderArray[currentApertureNumber];
			borderThickness = borderThicknessArray[currentApertureNumber];
			borderColor = borderColorArray[currentApertureNumber];

			//Calculate the x and y jump sizes for coherent dots
			coherentJumpSizeX = calculateCoherentJumpSizeX(coherentDirection);
			coherentJumpSizeY = calculateCoherentJumpSizeY(coherentDirection);

			//Initialize the aperture parameters
			initializeApertureDimensions();

			//Calculate the number of coherent, opposite coherent, and incoherent dots
			nCoherentDots = nDots * coherence;
			nOppositeCoherentDots = nDots * oppositeCoherence;
			nIncoherentDots = nDots - (nCoherentDots + nOppositeCoherentDots);
			
			//If the 3d array has been made, then choose the 2d array and the current set
			dotArray2d = dotArray3d.length !==0 ? dotArray3d[currentApertureNumber] : undefined;
			
		}// End of initializeCurrentApertureParameters
		
		//Calculate coherent jump size in the x direction
		function calculateCoherentJumpSizeX(coherentDirection) {
			var angleInRadians = coherentDirection * Math.PI / 180;
			return moveDistance * Math.cos(angleInRadians);
		}

		//Calculate coherent jump size in the y direction
		function calculateCoherentJumpSizeY(coherentDirection) {
			var angleInRadians = -coherentDirection * Math.PI / 180; //Negative sign because the y-axis is flipped on screen
			return moveDistance * Math.sin(angleInRadians);
		}

		//Initialize the parameters for the aperture for further calculation
		function initializeApertureDimensions() {
			//For circle and square
			if (apertureType == 1 || apertureType == 3) {
				horizontalAxis = verticalAxis = apertureWidth/2;
			}
			//For ellipse and rectangle
			else if (apertureType == 2 || apertureType == 4) {
				horizontalAxis = apertureWidth / 2;
				verticalAxis = apertureHeight / 2;
			}
		}

		//Make the 2d array, which is an array of array of dots
		function makeDotArray2d() {
			//Declare an array to hold the sets of dot arrays
			var tempArray = []
			//Loop for each set of dot array
			for (var i = 0; i < nSets; i++) {
				tempArray.push(makeDotArray()); //Make a dot array and push it into the 2d array
			}

			return tempArray;
		}

		//Make the dot array
		function makeDotArray() {
			var tempArray = []
			for (var i = 0; i < nDots; i++) {
				//Initialize a dot to be modified and inserted into the array
				var dot = {
					x: 0, //x coordinate
					y: 0, //y coordinate
					vx: 0, //coherent x jumpsize (if any)
					vy: 0, //coherent y jumpsize (if any)
					vx2: 0, //incoherent (random) x jumpsize (if any)
					vy2: 0, //incoherent (random) y jumpsize (if any)
					latestXMove: 0, //Stores the latest x move direction for the dot (to be used in reinsertOnOppositeEdge function below)
					latestYMove: 0, //Stores the latest y move direction for the dot (to be used in reinsertOnOppositeEdge function below)
					lifeCount: Math.floor(randomNumberBetween(0, dotLife)), //Counter for the dot's life. Updates every time it is shown in a frame
					updateType: "" //String to determine how this dot is updated
				};
				
				//randomly set the x and y coordinates
				dot = resetLocation(dot);

				//For the same && random position RDK type
				if (RDK == 1) {
					//For coherent dots
					if (i < nCoherentDots) {
						dot = setvxvy(dot); // Set dot.vx and dot.vy
						dot.updateType = "constant direction";
					}
			        //For opposite coherent dots
			        else if(i >= nCoherentDots && i < (nCoherentDots + nOppositeCoherentDots)){
								dot = setvxvy(dot); // Set dot.vx and dot.vy
			          dot.updateType = "opposite direction";
			        }
					//For incoherent dots
					else {
						dot.updateType = "random position";
					}
				} //End of RDK==1

				//For the same && random walk RDK type
				if (RDK == 2) {
					//For coherent dots
					if (i < nCoherentDots) {
						dot = setvxvy(dot); // Set dot.vx and dot.vy
						dot.updateType = "constant direction";
					}
        			//For opposite coherent dots
        			else if(i >= nCoherentDots && i < (nCoherentDots + nOppositeCoherentDots)){
								dot = setvxvy(dot); // Set dot.vx and dot.vy
        			  dot.updateType = "opposite direction";
        			}
					//For incoherent dots
					else {
						dot.updateType = "random walk";
					}
				} //End of RDK==2

				//For the same && random direction RDK type
				if (RDK == 3) {
					//For coherent dots
					if (i < nCoherentDots) {
						dot = setvxvy(dot); // Set dot.vx and dot.vy
						dot.updateType = "constant direction";
					}
        			//For opposite coherent dots
        			else if(i >= nCoherentDots && i < (nCoherentDots + nOppositeCoherentDots)){
								dot = setvxvy(dot); // Set dot.vx and dot.vy
        			  dot.updateType = "opposite direction";
        			}
					//For incoherent dots
					else {
						setvx2vy2(dot); // Set dot.vx2 and dot.vy2
						dot.updateType = "random direction";
					}
				} //End of RDK==3

				//For the different && random position RDK type
				if (RDK == 4) {
					//For all dots
					dot = setvxvy(dot); // Set dot.vx and dot.vy
					dot.updateType = "constant direction or opposite direction or random position";
				} //End of RDK==4

				//For the different && random walk RDK type
				if (RDK == 5) {
					//For all dots
					dot = setvxvy(dot); // Set dot.vx and dot.vy
					dot.updateType = "constant direction or opposite direction or random walk";
				} //End of RDK==5

				//For the different && random direction RDK type
				if (RDK == 6) {
					//For all dots
					dot = setvxvy(dot); // Set dot.vx and dot.vy
					//Each dot will have its own alternate direction of motion
					setvx2vy2(dot); // Set dot.vx2 and dot.vy2
					dot.updateType = "constant direction or opposite direction or random direction";
				} //End of RDK==6

				tempArray.push(dot);
			} //End of for loop
			return tempArray;
		}
		
		//Function to update all the dots all the apertures and then draw them
		function updateAndDraw(){
      
        	//Three for loops that do things in sequence: clear, update, and draw dots.
			
			// Clear all the current dots
			for(currentApertureNumber = 0; currentApertureNumber < nApertures; currentApertureNumber++){
        
				//Initialize the variables for each parameter
				initializeCurrentApertureParameters(currentApertureNumber);
				
		        //Clear the canvas by drawing over the current dots
		        clearDots();
      		}
			
			// Update all the relevant dots
			for(currentApertureNumber = 0; currentApertureNumber < nApertures; currentApertureNumber++){
        
				//Initialize the variables for each parameter
				initializeCurrentApertureParameters(currentApertureNumber);
				
				//Update the dots
				updateDots();
      		}
			
			// Draw all the relevant dots on the canvas
			for(currentApertureNumber = 0; currentApertureNumber < nApertures; currentApertureNumber++){
        
				//Initialize the variables for each parameter
				initializeCurrentApertureParameters(currentApertureNumber);
				
				//Draw on the canvas
				draw();
			}
		} 
		
		//Function that clears the dots on the canvas by drawing over it with the color of the baclground
	    function clearDots(){
      
	    	//Load in the current set of dot array for easy handling
	    	var dotArray = dotArray2d[currentSetArray[currentApertureNumber]];
			    
			//Loop through the dots one by one and draw them
			for (var i = 0; i < nDots; i++) {
				dot = dotArray[i];
				ctx.beginPath();
				ctx.arc(dot.x, dot.y, dotRadius+1, 0, Math.PI * 2);
				ctx.fillStyle = backgroundColor;
				ctx.fill();
			}
		}

		//Draw the dots on the canvas after they're updated
		function draw() {
      
    		//Load in the current set of dot array for easy handling
    		var dotArray = dotArray2d[currentSetArray[currentApertureNumber]];
      
			//Loop through the dots one by one and draw them
			for (var i = 0; i < nDots; i++) {
				dot = dotArray[i];
				ctx.beginPath();
				ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
				ctx.fillStyle = dotColor;
				ctx.fill();
			}
      
		    //Draw the fixation cross if we want it
		    if(fixationCross === true){
		      
		    	//Horizontal line
		    	ctx.beginPath();
		    	ctx.lineWidth = fixationCrossThickness;
		    	ctx.moveTo(canvasWidth/2 - fixationCrossWidth, canvasHeight/2);
		    	ctx.lineTo(canvasWidth/2 + fixationCrossWidth, canvasHeight/2);
		    	ctx.fillStyle = fixationCrossColor;
		    	ctx.stroke();
		    	
		    	//Vertical line
		    	ctx.beginPath();
		    	ctx.lineWidth = fixationCrossThickness;
		    	ctx.moveTo(canvasWidth/2, canvasHeight/2 - fixationCrossHeight);
		    	ctx.lineTo(canvasWidth/2, canvasHeight/2 + fixationCrossHeight);
		    	ctx.fillStyle = fixationCrossColor;
		    	ctx.stroke();
		    }
      
	      	//Draw the border if we want it
	      	if(border === true){
	        
	        	//For circle and ellipse
	        	if(apertureType === 1 || apertureType === 2){
	          		ctx.lineWidth = borderThickness;
	          		ctx.strokeStyle = borderColor;
	          		ctx.beginPath();
	          		ctx.ellipse(apertureCenterX, apertureCenterY, horizontalAxis+(borderThickness/2), verticalAxis+(borderThickness/2), 0, 0, Math.PI*2);
	          		ctx.stroke();
	        	}//End of if circle or ellipse
	        
	        	//For square and rectangle
	        	if(apertureType === 3 || apertureType === 4){
	          		ctx.lineWidth = borderThickness;
	          		ctx.strokeStyle = borderColor;
	          		ctx.strokeRect(apertureCenterX-horizontalAxis-(borderThickness/2), apertureCenterY-verticalAxis-(borderThickness/2), (horizontalAxis*2)+borderThickness, (verticalAxis*2)+borderThickness);
	        	}//End of if square or 
        
      		}//End of if border === true
	        
		}//End of draw

		//Update the dots with their new location
		function updateDots() {
			
			//Cycle through to the next set of dots
			if (currentSetArray[currentApertureNumber] == nSets - 1) {
				currentSetArray[currentApertureNumber] = 0;
			} else {
				currentSetArray[currentApertureNumber] = currentSetArray[currentApertureNumber] + 1;
			}
      
    		//Load in the current set of dot array for easy handling
    		var dotArray = dotArray2d[currentSetArray[currentApertureNumber]];
			
			//Load in the current set of dot array for easy handling
			//dotArray = dotArray2d[currentSetArray[currentApertureNumber]]; //Global variable, so the draw function also uses this array

			//Loop through the dots one by one and update them accordingly
			for (var i = 0; i < nDots; i++) {
				var dot = dotArray[i]; //Load the current dot into the variable for easy handling
        
			    //Generate a random value
			    var randomValue = Math.random();

				//Update based on the dot's update type
				if (dot.updateType == "constant direction") {
					dot = constantDirectionUpdate(dot);
				} else if (dot.updateType == "opposite direction") {
					dot = oppositeDirectionUpdate(dot);
				} else if (dot.updateType == "random position") {
					dot = resetLocation(dot);
				} else if (dot.updateType == "random walk") {
					dot = randomWalkUpdate(dot);
				} else if (dot.updateType == "random direction") {
					dot = randomDirectionUpdate(dot);
				} else if (dot.updateType == "constant direction or opposite direction or random position") {
			        
					//Randomly select if the dot goes in a constant direction or random position, weighted based on the coherence level
					if (randomValue < coherence) {
						dot = constantDirectionUpdate(dot);
					}  else if(randomValue >= coherence && randomValue < (coherence + oppositeCoherence)){
						dot = oppositeDirectionUpdate(dot);
					}  else {
						dot = resetLocation(dot);
					}
				} else if (dot.updateType == "constant direction or opposite direction or random walk") {
					//Randomly select if the dot goes in a constant direction or random walk, weighted based on the coherence level
					if (randomValue < coherence) {
						dot = constantDirectionUpdate(dot);
					} else if(randomValue >= coherence && randomValue < (coherence + oppositeCoherence)){
						dot = oppositeDirectionUpdate(dot);
					} else {
						dot = randomWalkUpdate(dot);
					}
				} else if (dot.updateType == "constant direction or opposite direction or random direction") {
					//Randomly select if the dot goes in a constant direction or random direction, weighted based on the coherence level
					if (randomValue < coherence) {
						dot = constantDirectionUpdate(dot);
					} else if(randomValue >= coherence && randomValue < (coherence + oppositeCoherence)){
						dot = oppositeDirectionUpdate(dot);
					} else {
						dot = randomDirectionUpdate(dot);
					}
				}//End of if dot.updateType == ...

				//Increment the life count
				dot.lifeCount++;

				//Check if out of bounds or if life ended
				if (lifeEnded(dot)) {
					dot = resetLocation(dot);
				}

				//If it goes out of bounds, do what is necessary (reinsert randomly or reinsert on the opposite edge) based on the parameter chosen
				if (outOfBounds(dot)) {
					switch (reinsertType) {
						case 1:
							dot = resetLocation(dot);
							break;
						case 2:
							dot = reinsertOnOppositeEdge(dot);
							break;
					} //End of switch statement
				} //End of if

			} //End of for loop
		} //End of updateDots function

		//Function to check if dot life has ended
		function lifeEnded(dot) {
			//If we want infinite dot life
			if (dotLife < 0) {
				dot.lifeCount = 0; //resetting to zero to save memory. Otherwise it might increment to huge numbers.
				return false;
			}
			//Else if the dot's life has reached its end
			else if (dot.lifeCount >= dotLife) {
				dot.lifeCount = 0;
				return true;
			}
			//Else the dot's life has not reached its end
			else {
				return false;
			}
		}

		//Function to check if dot is out of bounds
		function outOfBounds(dot) {
			//For circle and ellipse
			if (apertureType == 1 || apertureType == 2) {
				if (dot.x < xValueNegative(dot.y) || dot.x > xValuePositive(dot.y) || dot.y < yValueNegative(dot.x) || dot.y > yValuePositive(dot.x)) {
					return true;
				} else {
					return false;
				}
			}
			//For square and rectangle
			if (apertureType == 3 || apertureType == 4) {
				if (dot.x < (apertureCenterX) - horizontalAxis || dot.x > (apertureCenterX) + horizontalAxis || dot.y < (apertureCenterY) - verticalAxis || dot.y > (apertureCenterY) + verticalAxis) {
					return true;
				} else {
					return false;
				}
			}

		}

		//Set the vx and vy for the dot to the coherent jump sizes of the X and Y directions
		function setvxvy(dot) {
			dot.vx = coherentJumpSizeX;
			dot.vy = coherentJumpSizeY;
			return dot;
		}

		//Set the vx2 and vy2 based on a random angle
		function setvx2vy2(dot) {
			//Generate a random angle of movement
			var theta = randomNumberBetween(-Math.PI, Math.PI);
			//Update properties vx2 and vy2 with the alternate directions
			dot.vx2 = Math.cos(theta) * moveDistance;
			dot.vy2 = -Math.sin(theta) * moveDistance;
			return dot;
		}

		//Updates the x and y coordinates by moving it in the x and y coherent directions
		function constantDirectionUpdate(dot) {
			dot.x += dot.vx;
			dot.y += dot.vy;
			dot.latestXMove = dot.vx;
			dot.latestYMove = dot.vy;
			return dot;
		}

	 	//Updates the x and y coordinates by moving it in the opposite x and y coherent directions
		function oppositeDirectionUpdate(dot) {
			dot.x -= dot.vx;
			dot.y -= dot.vy;
			dot.latestXMove = -dot.vx;
			dot.latestYMove = -dot.vy;
			return dot;
		}

		//Creates a new angle to move towards and updates the x and y coordinates
		function randomWalkUpdate(dot) {
			//Generate a random angle of movement
			var theta = randomNumberBetween(-Math.PI, Math.PI);
			//Generate the movement from the angle
			dot.latestXMove = Math.cos(theta) * moveDistance;
			dot.latestYMove = -Math.sin(theta) * moveDistance;
			//Update x and y coordinates with the new location
			dot.x += dot.latestXMove;
			dot.y += dot.latestYMove;
			return dot;
		}

		//Updates the x and y coordinates with the alternative move direction
		function randomDirectionUpdate(dot) {
			dot.x += dot.vx2;
			dot.y += dot.vy2;
			dot.latestXMove = dot.vx2;
			dot.latestYMove = dot.vy2;
			return dot;
		}

		//Calculates a random position on the opposite edge to reinsert the dot
		function reinsertOnOppositeEdge(dot) {
			//If it is a circle or ellipse
			if (apertureType == 1 || apertureType == 2) {
				//Bring the dot back into the aperture by moving back one step
				dot.x -= dot.latestXMove;
				dot.y -= dot.latestYMove;

				//Move the dot to the position relative to the origin to be reflected about the origin
				dot.x -= apertureCenterX;
				dot.y -= apertureCenterY;

				//Reflect the dot about the origin
				dot.x = -dot.x;
				dot.y = -dot.y;

				//Move the dot back to the center of the screen
				dot.x += apertureCenterX;
				dot.y += apertureCenterY;

			} //End of if apertureType == 1 | == 2

			//If it is a square or rectangle, re-insert on one of the opposite edges
			if (apertureType == 3 || apertureType == 4) {

				/* The formula for calculating whether a dot appears from the vertical edge (left or right edges) is dependent on the direction of the dot and the ratio of the vertical and horizontal edge lengths.
				E.g.  
				Aperture is 100 px high and 200px wide
				Dot is moving 3 px in x direction and 4px in y direction
				Weight on vertical edge (sides)           = (100/(100+200)) * (|3| / (|3| + |4|)) = 1/7
				Weight on horizontal edge (top or bottom) = (200/(100+200)) * (|4| / (|3| + |4|)) = 8/21
			
				The weights above are the ratios to one another.
				E.g. (cont.)
				Ratio (vertical edge : horizontal edge) == (1/7 : 8/21)
				Total probability space = 1/7 + 8/21 = 11/21
				Probability that dot appears on vertical edge   = (1/7)/(11/21) = 3/11
				Probability that dot appears on horizontal edge = (8/21)/(11/21) = 8/11
				*/

				//Get the absolute values of the latest X and Y moves and store them in variables for easy handling.
				var absX = Math.abs(dot.latestXMove);
				var absY = Math.abs(dot.latestYMove);
				//Calculate the direction weights based on direction the dot was moving
				var weightInXDirection = absX / (absX + absY);
				var weightInYDirection = absY / (absX + absY);
				//Calculate the weight of the edge the dot should appear from, based on direction of dot and ratio of the aperture edges
				var weightOnVerticalEdge = (verticalAxis / (verticalAxis + horizontalAxis)) * weightInXDirection;
				var weightOnHorizontalEdge = (horizontalAxis / (verticalAxis + horizontalAxis)) * weightInYDirection;


				//Generate a bounded random number to determine if the dot should appear on the vertical edge or the horizontal edge
				if (weightOnVerticalEdge > (weightOnHorizontalEdge + weightOnVerticalEdge) * Math.random()) { //If yes, appear on the left or right edge (vertical edge)
					if (dot.latestXMove < 0) { //If dots move left, appear on right edge
						dot.x = apertureCenterX + horizontalAxis;
						dot.y = randomNumberBetween((apertureCenterY) - verticalAxis, (apertureCenterY) + verticalAxis);
					} else { //Else dots move right, so they should appear on the left edge
						dot.x = apertureCenterX - horizontalAxis;
						dot.y = randomNumberBetween((apertureCenterY) - verticalAxis, (apertureCenterY) + verticalAxis);
					}
				} else { //Else appear on the top or bottom edge (horizontal edge)
					if (dot.latestYMove < 0) { //If dots move upwards, then appear on bottom edge
						dot.y = apertureCenterY + verticalAxis;
						dot.x = randomNumberBetween((apertureCenterX) - horizontalAxis, (apertureCenterX) + horizontalAxis)
					} else { //If dots move downwards, then appear on top edge
						dot.y = apertureCenterY - verticalAxis;
						dot.x = randomNumberBetween((apertureCenterX) - horizontalAxis, (apertureCenterX) + horizontalAxis)
					}
				}
			} //End of apertureType == 3
			return dot;
		} //End of reinsertOnOppositeEdge

		//Calculate the POSITIVE y value of a point on the edge of the ellipse given an x-value
		function yValuePositive(x) {
			var x = x - (apertureCenterX); //Bring it back to the (0,0) center to calculate accurately (ignore the y-coordinate because it is not necessary for calculation)
			return verticalAxis * Math.sqrt(1 - (Math.pow(x, 2) / Math.pow(horizontalAxis, 2))) + apertureCenterY; //Calculated the positive y value and added apertureCenterY to recenter it on the screen 
		}

		//Calculate the NEGATIVE y value of a point on the edge of the ellipse given an x-value
		function yValueNegative(x) {
			var x = x - (apertureCenterX); //Bring it back to the (0,0) center to calculate accurately (ignore the y-coordinate because it is not necessary for calculation)
			return -verticalAxis * Math.sqrt(1 - (Math.pow(x, 2) / Math.pow(horizontalAxis, 2))) + apertureCenterY; //Calculated the negative y value and added apertureCenterY to recenter it on the screen
		}

		//Calculate the POSITIVE x value of a point on the edge of the ellipse given a y-value
		function xValuePositive(y) {
			var y = y - (apertureCenterY); //Bring it back to the (0,0) center to calculate accurately (ignore the x-coordinate because it is not necessary for calculation)
			return horizontalAxis * Math.sqrt(1 - (Math.pow(y, 2) / Math.pow(verticalAxis, 2))) + apertureCenterX; //Calculated the positive x value and added apertureCenterX to recenter it on the screen
		}

		//Calculate the NEGATIVE x value of a point on the edge of the ellipse given a y-value
		function xValueNegative(y) {
			var y = y - (apertureCenterY); //Bring it back to the (0,0) center to calculate accurately (ignore the x-coordinate because it is not necessary for calculation)
			return -horizontalAxis * Math.sqrt(1 - (Math.pow(y, 2) / Math.pow(verticalAxis, 2))) + apertureCenterX; //Calculated the negative x value and added apertureCenterX to recenter it on the screen
		}

		//Calculate a random x and y coordinate in the ellipse
		function resetLocation(dot) {

			//For circle and ellipse
			if (apertureType == 1 || apertureType == 2) {
				var phi = randomNumberBetween(-Math.PI, Math.PI);
				var rho = Math.random();

				x = Math.sqrt(rho) * Math.cos(phi);
				y = Math.sqrt(rho) * Math.sin(phi);

				x = x * horizontalAxis + apertureCenterX;
				y = y * verticalAxis + apertureCenterY;

				dot.x = x;
				dot.y = y;
			}
			//For square and rectangle
			else if (apertureType == 3 || apertureType == 4) {
				dot.x = randomNumberBetween((apertureCenterX) - horizontalAxis, (apertureCenterX) + horizontalAxis); //Between the left and right edges of the square / rectangle
				dot.y = randomNumberBetween((apertureCenterY) - verticalAxis, (apertureCenterY) + verticalAxis); //Between the top and bottom edges of the square / rectangle
			}

			return dot;
		}

		//Generates a random number (with decimals) between 2 values
		function randomNumberBetween(lowerBound, upperBound) {
			return lowerBound + Math.random() * (upperBound - lowerBound);
		}
		
		//Function to make the dots move on the canvas
		function animateDotMotion() {
			//frameRequestID saves a long integer that is the ID of this frame request. The ID is then used to terminate the request below.
			var frameRequestID = window.requestAnimationFrame(animate);
			
			//Start to listen to subject's key responses
			startKeyboardListener(); 
									
			//Delare a timestamp
			var previousTimestamp;
			
			function animate() {
				//If stopping condition has been reached, then stop the animation
				if (stopDotMotion) {
					window.cancelAnimationFrame(frameRequestID); //Cancels the frame request
				}
				//Else continue with another frame request
				else {
					frameRequestID = window.requestAnimationFrame(animate); //Calls for another frame request
					
					//If the timer has not been started and it is set, then start the timer
					if ( (!timerHasStarted) && (trial.trial_duration > 0) ){
						//If the trial duration is set, then set a timer to count down and call the end_trial function when the time is up
						//(If the subject did not press a valid keyboard response within the trial duration, then this will end the trial)
						timeoutID = window.setTimeout(end_trial,trial.trial_duration); //This timeoutID is then used to cancel the timeout should the subject press a valid key
						//The timer has started, so we set the variable to true so it does not start more timers
						timerHasStarted = true;
					}
					
					updateAndDraw(); //Update and draw each of the dots in their respective apertures
					
					//If this is before the first frame, then start the timestamp
					if(previousTimestamp === undefined){
						previousTimestamp = performance.now();
					}
					//Else calculate the time and push it into the array
					else{
						var currentTimeStamp = performance.now(); //Variable to hold current timestamp
						frameRate.push(currentTimeStamp - previousTimestamp); //Push the interval into the frameRate array
						previousTimestamp = currentTimeStamp; //Reset the timestamp
					}
				}
			}
		}

		//----RDK Functions End----
	
		//----General Functions Begin//----
		
		//Function to assign the default values for the staircase parameters
		function assignParameterValue(argument, defaultValue){
			return typeof argument !== 'undefined' ? argument : defaultValue;
		}
		
		//----General Functions End//----


		//-------------------------------------
		//-----------FUNCTIONS END-------------
		//-------------------------------------


	}; // END OF TRIAL

	//Return the plugin object which contains the trial
	return plugin;
})();
