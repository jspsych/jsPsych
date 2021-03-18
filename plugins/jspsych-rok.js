/*
		
	ROK plugin for JsPsych
	----------------------

	We would appreciate it if you cited this paper when you use the ROK:
	... to be added
	
	----------------------
	
	Copyright (C) 2021 Younes Strittmatter
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	

	
*/


jsPsych.plugins["rok"] = (function () {

    let plugin = {};
    jsPsych.pluginAPI.registerPreload('rok', 'stimulus_image', 'image');
    jsPsych.pluginAPI.registerPreload('rok', 'background_image', 'image');


    plugin.info = {
        name: "rok",
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
                default: 0,
                description: "The length of stimulus presentation. Zero for endless loop"
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: "Response ends trial",
                default: true,
                description: "If true, then any valid key will end the trial"
            },
            number_of_oobs: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Number of oriented objectes",
                default: 300,
                description: "The number of oriented objects per set in the stimulus"
            },
            coherent_movement_direction: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Coherent movement direction",
                default: 0,
                description: "The direction of coherent motion in degrees (0 degre meaning right)"
            },
            coherent_orientation: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Coherent object orientation",
                default: 0,
                description: "The orientation of the objects in degree (0 degree meaning right)"
            },
            coherence_movement: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Movement coherence",
                default: 50,
                description: "The percentage of oriented objects moving in the coherent direction"
            },
            coherence_orientation: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Orientation coherence",
                default: 50,
                description: "The percentage of objects that are oriented in the coherent orientation"
            },
            coherence_movement_opposite: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Opposite movement coherence",
                default: 0,
                description: "The percentage of oriented objects moving in the direction opposite of the coherent direction"
            },
            coherence_orientation_opposite: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Opposite orientation coherence",
                default: 0,
                description: "The percentage of objects that are oriented opposite of the coherent orientation"
            },
            movement_speed: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Movement Speed",
                default: 10,
                description: "The movement speed of the oobs in (percentage of aperature_width)/second"
            },
            movement_speed_randomisation: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Movement speed randomisation",
                default: 0,
                description: "The percentage of randomisation in movement speed " +
                    "(0 meaning all orientated objects move with speed defined in movement_speed," +
                    " 100 meaning movement speeds from 0 to 2x movement_speed)"
            },
            oob_size: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Object size",
                default: 2,
                description: "The size of the orientated objects in percentage of aperture_width"
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
            oob_color: {
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
            },
            stimulus_type: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Stimulus type",
                default: 0,
                description: "Apperance of stimulus (0-triangles, 1-circles, 2-squares, 3-birds, 4-image)"
            },
            aperture_shape: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "aperture shape",
                default: 0,
                description: "Shade of aperture (0 - rectangular, 1 - elliptic)"
            },
            random_movement_type: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Random movement type",
                default: 0,
                description: "Type of random movement (0 direction is random but fixed, 1 movement direction of incoherent oobs changes over time)"
            },
            random_orientation_type: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Random orientation type",
                default: 0,
                description: "Type of random movement (0 - orientation is random but fixed, 1 - orientation of incoherent oobs changes over time)"
            },
            number_of_apertures: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Number of apertures",
                default: 1,
                description: "Number of apertures. If greater then one, other parameters of trial should be arrays"
            },
            aperture_position_left: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Horizontal position of aperature",
                default: 50,
                description: "Position of midpoint of aperture in x direction in percentage of window width (50 being middle)" +
                    ""
            },
            aperture_position_top: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Vertical position of aperature",
                default: 50,
                description: "Position of midpoint of aperture in y direction in percentage of window width (0 being top, 50 being middle, 100 being bot)"
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: "Prompt",
                default: null,
                description: "Prompt that is presented above the stimulus"
            },
            fade_out: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Fade out on edges",
                default: 0,
                description: "Fade the oobs on the edges of the aperture"
            },
            stimulus_image: {
                type: jsPsych.plugins.parameterType.IMAGE,
                pretty_name: "Stimuli pictures",
                default: null,
                description: "Pictures of stimuli, can be key-framed(animated) or randomised, see documentation"
            },
            background_image: {
                type: jsPsych.plugins.parameterType.IMAGE,
                pretty_name: "Background image",
                default: null,
                description: "Background image, can be key-framed(animated) or randomised, see documentation"
            },
            stimulus_image_keyframes: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Keyframes of stimulus pictures",
                default: 1,
                description: "Number of keyframes in stimulus images"
            },
            background_image_keyframes: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Keframse of background pictures",
                default: 1,
                description: "Number of keyframes in background pictures"
            },
            stimulus_keyframe_time: {
                type: jsPsych.plugins.parameterType.FLOAT,
                pretty_name: "Keyframe time",
                default: .1,
                description: "Time between keyframes"
            },
            stimulus_mirror: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Mirror image time",
                default: 0,
                description: "Mirror image instead of rotating (1 - x axis, 2 - y axis)"
            },
            experiment_congruency_mode: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Experiment congruency mode",
                default: 0,
                description: "Sets experiment to congruency mode: experiment_main_task has to be  set (0 = movement or 1 = orientation) if this is set to 1 or 2. The" +
                    "congruency of the task does only apply to coherent oobs of main task. If this is set to 1 the remaining oobs secondary feature (the non task feature) is set at random." +
                    "If this is set to 2 the remaining oobs have the same direction and orientation"
            },
            experiment_main_task: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Main task when experiment is set to congruency mode",
                default: 0,
                description: "Sets the main task when experiment is in congruency mode. The congruency of the other task then only" +
                    "applies to non random oobs of main task"
            },
            units: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: "Units in which size and speed of oobs is expressed",
                default: null,
                description: "Units in which size and speed of oobs is expressed (null - percentage of aperture width, px - pixels"
            }
        }
    };


    //BEGINNING OF TRIAL
    plugin.trial = function (display_element, trial) {


        //--------------------------------------
        //---------SET PARAMETERS BEGIN---------
        //--------------------------------------


        trial.choices = assignParameterValue(trial.choices, plugin.info.parameters.choices.default);
        trial.correct_choice = assignParameterValue(trial.correct_choice, plugin.info.parameters.correct_choice.default);
        trial.trial_duration = assignParameterValue(trial.trial_duration, plugin.info.parameters.trial_duration.default);
        trial.response_ends_trial = assignParameterValue(trial.response_ends_trial, plugin.info.parameters.response_ends_trial.default);
        trial.number_of_oobs = assignParameterValue(trial.number_of_oobs, plugin.info.parameters.number_of_oobs.default);
        trial.coherent_movement_direction = assignParameterValue(trial.coherent_movement_direction, plugin.info.parameters.coherent_movement_direction.default);
        trial.coherent_orientation = assignParameterValue(trial.coherent_orientation, plugin.info.parameters.coherent_orientation.default);
        trial.coherence_movement = assignParameterValue(trial.coherence_movement, plugin.info.parameters.coherence_movement.default);
        trial.coherence_orientation = assignParameterValue(trial.coherence_orientation, plugin.info.parameters.coherence_orientation.default);
        trial.coherence_movement_opposite = assignParameterValue(trial.coherence_movement_opposite, plugin.info.parameters.coherence_movement_opposite.default);
        trial.coherence_orientation_opposite = assignParameterValue(trial.coherence_orientation_opposite, plugin.info.parameters.coherence_orientation_opposite.default);
        trial.movement_speed = assignParameterValue(trial.movement_speed, plugin.info.parameters.movement_speed.default);
        trial.movement_speed_randomisation = assignParameterValue(trial.movement_speed_randomisation, plugin.info.parameters.movement_speed_randomisation.default);
        trial.oob_size = assignParameterValue(trial.oob_size, plugin.info.parameters.oob_size.default);
        trial.aperture_width = assignParameterValue(trial.aperture_width, plugin.info.parameters.aperture_width.default);
        trial.aperture_height = assignParameterValue(trial.aperture_height, plugin.info.parameters.aperture_height.default);
        trial.oob_color = assignParameterValue(trial.oob_color, plugin.info.parameters.oob_color.default);
        trial.background_color = assignParameterValue(trial.background_color, plugin.info.parameters.background_color.default);
        trial.border = assignParameterValue(trial.border, plugin.info.parameters.border.default);
        trial.border_thickness = assignParameterValue(trial.border_thickness, plugin.info.parameters.border_thickness.default);
        trial.border_color = assignParameterValue(trial.border_color, plugin.info.parameters.border_color.default);
        trial.stimulus_type = assignParameterValue(trial.stimulus_type, plugin.info.parameters.stimulus_type.default);
        trial.aperture_shape = assignParameterValue(trial.aperture_shape, plugin.info.parameters.aperture_shape.default);
        trial.random_movement_type = assignParameterValue(trial.random_movement_type, plugin.info.parameters.random_movement_type.default);
        trial.random_orientation_type = assignParameterValue(trial.random_orientation_type, plugin.info.parameters.random_orientation_type.default);
        trial.number_of_apertures = assignParameterValue(trial.number_of_apertures, plugin.info.parameters.number_of_apertures.default);
        trial.aperture_position_left = assignParameterValue(trial.aperture_position_left, plugin.info.parameters.aperture_position_left.default);
        trial.aperture_position_top = assignParameterValue(trial.aperture_position_top, plugin.info.parameters.aperture_position_top.default);
        trial.prompt = assignParameterValue(trial.prompt, plugin.info.parameters.prompt.default);
        trial.fade_out = assignParameterValue(trial.fade_out, plugin.info.parameters.fade_out.default);
        trial.stimulus_image = assignParameterValue(trial.stimulus_image, plugin.info.parameters.stimulus_image.default);
        trial.background_image = assignParameterValue(trial.background_image, plugin.info.parameters.background_image.default);
        trial.stimulus_image_keyframes = assignParameterValue(trial.stimulus_image_keyframes, plugin.info.parameters.stimulus_image_keyframes.default);
        trial.background_image_keyframes = assignParameterValue(trial.background_image_keyframes, plugin.info.parameters.background_image_keyframes.default);
        trial.stimulus_keyframe_time = assignParameterValue(trial.stimulus_keyframe_time, plugin.info.parameters.stimulus_keyframe_time.default);
        trial.stimulus_mirror = assignParameterValue(trial.stimulus_mirror, plugin.info.parameters.stimulus_mirror.default);
        trial.experiment_congruency_mode = assignParameterValue(trial.experiment_congruency_mode, plugin.info.parameters.experiment_congruency_mode.default);
        trial.experiment_main_task = assignParameterValue(trial.experiment_main_task, plugin.info.parameters.experiment_main_task.default);
        trial.units = assignParameterValue(trial.units, plugin.info.parameters.units.default);

        //--------------------------------------
        //----------SET PARAMETERS END----------
        //--------------------------------------

        //--------Set up canvases BEGIN -------
        let nApertures = trial.number_of_apertures;


        //Create canvas elements and append it to the DOM
        var canvasArray = [];
        var containerArray = [];
        if (nApertures > 1) {
            for (let i = 0; i < nApertures; i++) {
                containerArray.push(document.createElement('div'));
                canvasArray.push(document.createElement('canvas'));
            }
        } else {
            containerArray.push(document.createElement('div'));
            canvasArray.push(document.createElement('canvas'));
        }
        for (let i = 0; i < nApertures; i++) {
            let imgPath = getValueFromArrayOrNot(trial.background_image, i);
            if (imgPath != null) {

                containerArray[i].style.backgroundImage = 'url(' + getValueFromArrayOrNot(trial.background_image, i) + ')';
                containerArray[i].style.backgroundRepeat = 'no-repeat';
                containerArray[i].style.backgroundSize = 'cover';
            }
            display_element.appendChild(containerArray[i]);
            containerArray[i].appendChild(canvasArray[i]);
            if (Array.isArray(trial.prompt)) {
                let p = document.createElement('div');
                p.style.margin = '5px';
                p.style.padding = '0';
                containerArray[i].appendChild(p);
                p.style.textAlign = "center";
                p.innerHTML = trial.prompt[i];
            } else if (trial.prompt != null && !Array.isArray(trial.prompt)) {
                let p = document.createElement('div');
                p.style.margin = '5px';
                p.style.padding = '0';
                containerArray[i].appendChild(p);
                p.style.textAlign = "center";
                p.innerHTML = trial.prompt;
            }
        }


        //Get body element from jsPsych
        let body = document.getElementsByClassName("jspsych-display-element")[0];

        //Save the current settings to be restored later
        let originalMargin = body.style.margin;
        let originalPadding = body.style.padding;
        let originalBackgroundColor = body.style.backgroundColor;

        //Remove the margins and paddings of the display_element
        body.style.margin = 0;
        body.style.padding = 0;


        //Remove the margins and padding of the canvas
        for (let i = 0; i < nApertures; i++) {
            containerArray[i].style.margin = '0px';
            containerArray[i].style.margin = '0px';
            canvasArray[i].style.margin = '0px';
            canvasArray[i].style.padding = '0px';
        }

        //Set background color of body to be the same as
        body.style.backgroundColor = trial.background_color;

        //Get the contexts of the canvases
        let ctxArray = [];
        for (let i = 0; i < nApertures; i++) {
            ctxArray.push(canvasArray[i].getContext('2d'));
        }


        //Set canvases width, height, position and color;
        for (let i = 0; i < nApertures; i++) {
            canvasArray[i].width = getValueFromArrayOrNot(trial.aperture_width, i);
            canvasArray[i].height = getValueFromArrayOrNot(trial.aperture_height, i);
            canvasArray[i].style.backgroundColor = getValueFromArrayOrNot(trial.brackground_color, i);
            containerArray[i].style.position = "absolute";

            if (Array.isArray(trial.aperture_position_left) && Array.isArray(trial.aperture_position_top)) {
                containerArray[i].style.top = trial.aperture_position_top[i].toString() + "%";
                containerArray[i].style.left = trial.aperture_position_left[i].toString() + "%";
            } else {
                if (nApertures > 1) {
                    let x;
                    if (nApertures % 2 == 0) {
                        x = i * (100 / nApertures) + (100 / (2 * nApertures));
                    } else {
                        x = i * (100 / (nApertures + 1)) + (100 / (2 * (nApertures - 1)));
                    }
                    containerArray[i].style.top = "50%";
                    containerArray[i].style.left = x.toString() + "%";
                } else {
                    containerArray[i].style.top = trial.aperture_position_top.toString() + "%";
                    containerArray[i].style.left = trial.aperture_position_left.toString() + "%";
                }
            }

            const rect = containerArray[i].getBoundingClientRect();

            let t = Math.round(50 * canvasArray[i].height / rect.height);


            containerArray[i].style.transform = "translate(-50%, -" + t.toString() + "%)";
        }


        //--------Set up canvases END-------


        //--------rok variables and function calls begin--------


        //Initialize stopping condition for animation function that runs in a loop
        let stopOobMotion = false;

        //Variable to control the frame rate, to ensure that the first frame is skipped because it follows a different timing
        let firstFrame = true;

        //Variable to start the timer
        let timerHasStarted = false;

        //Initialize object to store the response data. Default values of -1 are used if the trial times out and the subject has not pressed a valid key
        let response = {
            rt: -1,
            key: -1
        };

        //Declare a global timeout ID to be initialized below in animateDotMotion function and to be used in after_response function
        let timeoutID;

        //Declare global variable to be defined in startKeyboardListener function and to be used in end_trial function
        let keyboardListener;

        //Declare global variable to store the frame rate of the trial
        let frameRate = []; //How often the monitor refreshes, in ms. Currently an array to store all the intervals. Will be converted into a single number (the average) in end_trial function.

        //variable to store how many frames were presented.
        let numberOfFrames = 0;

        // get the images if specified
        let img = [];
        if (trial.stimulus_image != null) {
            let imgSrc = trial.stimulus_image;
            if (!Array.isArray(imgSrc)) {
                let i = document.createElement('img');
                i.src = imgSrc;
                img.push(i);
            } else {
                for (let j = 0; j < imgSrc.length; j++) {
                    let iS = imgSrc[j];
                    if (!Array.isArray(iS)) {
                        let i = document.createElement('img');
                        i.src = iS;
                        img.push(i);
                    } else {
                        let i = [];
                        for (let k = 0; k < iS[j].length; k++) {
                            let p = document.createElement('img');
                            p.src = iS[k];
                            i.push(p);
                        }
                        img.push(i);
                    }

                }
            }
        }

        let oobs = [];


        //Calculate the number of coherent, opposite coherent, and incoherent oobs for movement/orientation
        for (let i = 0; i < nApertures; i++) {
            let nOob = getValueFromArrayOrNot(trial.number_of_oobs, i);

            let tmpCoherenceMovement = getValueFromArrayOrNot(trial.coherence_movement, i);
            let tmpOppositeCoherenceMovement = getValueFromArrayOrNot(trial.coherence_movement_opposite, i);
            let tmpCoherenceOrientation = getValueFromArrayOrNot(trial.coherence_orientation, i);
            let tmpOppositeCoherenceOrientation = getValueFromArrayOrNot(trial.coherence_orientation_opposite, i);

            let experimentMode = getValueFromArrayOrNot(trial.experiment_congruency_mode, i);
            let mainTask = getValueFromArrayOrNot(trial.experiment_main_task, i);


            let tmpOrientation = [];
            let tmpMovementDirection = [];

            if (experimentMode === 0) {
                let [nCoherentMovement, nCoherentOppositeMovement,
                    nIncoherentMovement] = getNumbers(tmpCoherenceMovement, tmpOppositeCoherenceMovement, nOob);
                let [nCoherentOrientation, nCoherentOppositeOrientation,
                    nIncoherentOrientation] = getNumbers(tmpCoherenceOrientation, tmpOppositeCoherenceOrientation, nOob);
                for (let j = 0; j < nCoherentMovement; j++) {
                    tmpMovementDirection.push(1);
                }
                for (let j = 0; j < nCoherentOppositeMovement; j++) {
                    tmpMovementDirection.push(-1);
                }
                for (let j = 0; j < nIncoherentMovement; j++) {
                    tmpMovementDirection.push(0);
                }
                for (let j = 0; j < nCoherentOrientation; j++) {
                    tmpOrientation.push(1);
                }
                for (let j = 0; j < nCoherentOppositeOrientation; j++) {
                    tmpOrientation.push(-1);
                }
                for (let j = 0; j < nIncoherentOrientation; j++) {
                    tmpOrientation.push(0);
                }
                shuffleArray(tmpOrientation);
                shuffleArray(tmpMovementDirection);
            } else if (mainTask === 0) {
                let [nCoherentMovement, nCoherentOppositeMovement,
                    nIncoherentMovement] = getNumbers(tmpCoherenceMovement, tmpOppositeCoherenceMovement, nOob);
                let nCoherentOrientation = Math.floor(tmpCoherenceOrientation / 100 * nCoherentMovement);
                let nCoherentOppositeOrientation = Math.floor(tmpOppositeCoherenceOrientation / 100 * nCoherentMovement);
                if (tmpCoherenceOrientation + tmpOppositeCoherenceOrientation === 100) {
                    nCoherentOppositeOrientation = nCoherentMovement - nCoherentOrientation;
                }
                for (let j = 0; j < nCoherentMovement; j++) {
                    tmpMovementDirection.push(1);
                }
                for (let j = 0; j < nCoherentOppositeMovement; j++) {
                    tmpMovementDirection.push(-1);
                }
                for (let j = 0; j < nIncoherentMovement; j++) {
                    tmpMovementDirection.push(0);
                }
                for (let j = 0; j < nCoherentOrientation; j++) {
                    tmpOrientation.push(1);
                }
                for (let j = 0; j < nCoherentOppositeOrientation; j++) {
                    tmpOrientation.push(-1);
                }

                for (let j = 0; j < nOob - (nCoherentOrientation + nCoherentOppositeOrientation); j++) {
                    tmpOrientation.push(0);
                }
            } else if (mainTask === 1) {
                let [nCoherentOrientation, nCoherentOppositeOrientation,
                    nIncoherentOrientation] = getNumbers(tmpCoherenceOrientation, tmpOppositeCoherenceOrientation, nOob);
                let nCoherentMovement = Math.floor(tmpCoherenceMovement / 100 * nCoherentOrientation);
                let nCoherentOppositeMovement = Math.floor(tmpOppositeCoherenceMovement / 100 * nCoherentOrientation);
                if (tmpCoherenceMovement + tmpOppositeCoherenceMovement === 100) {
                    nCoherentOppositeMovement = nCoherentOrientation - nCoherentMovement;
                }
                for (let j = 0; j < nCoherentOrientation; j++) {
                    tmpOrientation.push(1);
                }
                for (let j = 0; j < nCoherentOppositeOrientation; j++) {
                    tmpOrientation.push(-1);
                }
                for (let j = 0; j < nIncoherentOrientation; j++) {
                    tmpOrientation.push(0);
                }
                for (let j = 0; j < nCoherentMovement; j++) {
                    tmpMovementDirection.push(1);
                }
                for (let j = 0; j < nCoherentOppositeMovement; j++) {
                    tmpMovementDirection.push(-1);
                }
                if (experimentMode === 1) {
                    for (let j = 0; j < nOob - (nCoherentMovement + nCoherentOppositeMovement); j++) {
                        tmpMovementDirection.push(0);
                    }
                } else {
                    for (let j = 0; j < nOob - (nCoherentMovement + nCoherentOppositeMovement); j++) {
                        tmpOrientation.push(tmpOrientation[j + nCoherentMovement + nCoherentOppositeMovement]);
                    }
                }
            }


            let oobColor = getValueFromArrayOrNot(trial.oob_color, i);

            let stimulusType = getValueFromArrayOrNot(trial.stimulus_type, i);
            if (stimulusType === 3) {
                oobColor = standardColor(oobColor);
            }
            let apertureType = getValueFromArrayOrNot(trial.aperture_shape, i);
            let speed = getValueFromArrayOrNot(trial.movement_speed, i);
            let speedRandomisation = getValueFromArrayOrNot(trial.movement_speed_randomisation, i);
            let size = getValueFromArrayOrNot(trial.oob_size, i);

            let isFade = getValueFromArrayOrNot(trial.fade_out, i);


            for (let j = 0; j < nOob; j++) {
                let randomWalk = 0;
                let randomOrient = 0;
                let orientation = getValueFromArrayOrNot(trial.coherent_orientation, i);
                if (tmpOrientation[j] === -1) {
                    orientation += 180;
                } else if (tmpOrientation[j] === 0) {
                    orientation = Math.floor((Math.random() * 360));
                    randomOrient = getValueFromArrayOrNot(trial.random_orientation_type, i);

                }
                let movementDirection = getValueFromArrayOrNot(trial.coherent_movement_direction, i);
                if (tmpMovementDirection[j] === -1) {
                    movementDirection += 180;
                } else if (tmpMovementDirection[j] === 0) {
                    movementDirection = Math.floor((Math.random() * 360));
                    randomWalk = getValueFromArrayOrNot(trial.random_movement_type, i);
                }
                if (experimentMode === 2 && mainTask === 0 && tmpOrientation[j] === 0 && tmpMovementDirection[j] != 1) {
                    orientation = movementDirection;
                } else if (experimentMode === 2 && mainTask === 1 && tmpMovementDirection[j] === 0 && tmpOrientation[j] != 1) {
                    movementDirection = orientation;
                }

                let oob;


                if (stimulusType === 0) {
                    oob = new Oob(size, oobColor, orientation, movementDirection, speed, speedRandomisation, apertureType, randomWalk, randomOrient, isFade, canvasArray[i], ctxArray[i], trial.units);
                } else if (stimulusType === 1) {
                    oob = new OobCircle(size, oobColor, orientation, movementDirection, speed, speedRandomisation, apertureType, randomWalk, randomOrient, isFade, canvasArray[i], ctxArray[i], trial.units);
                } else if (stimulusType === 2) {
                    oob = new OobSquare(size, oobColor, orientation, movementDirection, speed, speedRandomisation, apertureType, randomWalk, randomOrient, isFade, canvasArray[i], ctxArray[i], trial.units);
                } else if (stimulusType === 3) {
                    oob = new OobBird(size, oobColor, orientation, movementDirection, speed, speedRandomisation, apertureType, randomWalk, randomOrient, isFade, canvasArray[i], ctxArray[i], trial.units);
                } else if (stimulusType === 4) {
                    let imageArray, keyframes, keyframeTime, mirrorType;
                    if (nApertures === 1) {
                        imageArray = img;
                        keyframes = trial.stimulus_image_keyframes;
                        keyframeTime = trial.stimulus_keyframe_time;
                        mirrorType = trial.stimulus_mirror;
                    } else {
                        imageArray = getValueFromArrayOrNot(img, i);
                        keyframes = getValueFromArrayOrNot(trial.stimulus_image_keyframes, i);
                        keyframeTime = getValueFromArrayOrNot(trial.stimulus_keyframe_time, i);
                        mirrorType = getValueFromArrayOrNot(trial.stimulus_mirror, i);
                    }

                    oob = new OobImage(size, oobColor, orientation, movementDirection, speed, speedRandomisation, apertureType, randomWalk, randomOrient, isFade, imageArray, keyframes, keyframeTime, mirrorType, canvasArray[i], ctxArray[i], trial.units);
                }
                oobs.push(oob);
            }


        }

        //start animation
        animateDotMotion();


        //--------RDK variables and function calls end--------


        //-------------------------------------
        //-----------FUNCTIONS BEGIN-----------
        //-------------------------------------

        //----JsPsych Functions Begin----


        //Function to start the keyboard listener
        function startKeyboardListener() {
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
            stopOobMotion = true;

            //Store the number of frames
            numberOfFrames = frameRate.length;

            //Variable to store the frame rate array
            let frameRateArray = frameRate;

            //Calculate the average frame rate
            if (frameRate.length > 0) {//Check to make sure that the array is not empty
                frameRate = frameRate.reduce((total, current) => total + current) / frameRate.length; //Sum up all the elements in the array
            } else {
                frameRate = 0; //Set to zero if the subject presses an answer before a frame is shown (i.e. if frameRate is an empty array)
            }

            //Cancel the keyboard listener if keyboardListener has been defined
            if (typeof keyboardListener !== 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }


            //Place all the data to be saved from this trial in one data object
            let trial_data = {
                "rt": response.rt, //The response time
                "key_press": response.key, //The key that the subject pressed
                "correct": correctOrNot(), //If the subject response was correct
                "choices": trial.choices, //The set of valid keys
                "correct_choice": trial.correct_choice, //The correct choice
                "trial_duration": trial.trial_duration, //The trial duration
                "response_ends_trial": trial.response_ends_trial, //If the response ends the trial
                "number_of_oobs": trial.number_of_oobs,
                "coherent_movement_direction": trial.coherent_movement_direction,
                "coherence_movement": trial.coherence_movement,
                "opposite_coherence_movement": trial.coherence_movement_opposite,
                "coherent_orientation": trial.coherent_orientation,
                "coherence_orientation": trial.coherence_orientation,
                "opposite_coherence_orientation": trial.coherence_orientation_opposite,
                "movement_speed": trial.movement_speed,
                "oob_size": trial.oob_size,
                "oob_color": trial.oob_color,
                "movement_speed_randomisation": trial.movement_speed_randomisation,
                "aperture_width": trial.aperture_width,
                "aperture_height": trial.aperture_height,
                "oob_color": trial.oob_color,
                "background_color": trial.background_color,
                "frame_rate": frameRate, //The average frame rate for the trial
                "frame_rate_array": JSON.stringify(frameRateArray), //The array of ms per frame in this trial, in the form of a JSON string
                "number_of_frames": numberOfFrames, //The number of frames in this trial
                "stimulus_type": trial.stimulus_type,
                "aperture_shape": trial.aperture_shape,
                "random_movemet_type": trial.random_movement_type,
                "random_orientation_type": trial.random_orientation_type,
                "number_of_apertures": trial.number_of_apertures,
                "prompt": trial.prompt,
                "aperture_position_left": trial.aperture_position_left,
                "aperture_position_top": trial.aperture_position_top
            };

            //Clear the body
            display_element.innerHTML = '';

            //Restore the settings to JsPsych defaults
            body.style.margin = originalMargin;
            body.style.padding = originalPadding;
            body.style.backgroundColor = originalBackgroundColor;

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
        function correctOrNot() {

            //Check that the correct_choice has been defined
            if (typeof trial.correct_choice !== 'undefined') {
                //If the correct_choice variable holds an array
                if (trial.correct_choice.constructor === Array) { //If it is an array
                    //If the elements are characters
                    if (typeof trial.correct_choice[0] === 'string' || trial.correct_choice[0] instanceof String) {
                        trial.correct_choice = trial.correct_choice.map(function (x) {
                            return x.toUpperCase();
                        }); //Convert all the values to upper case
                        return trial.correct_choice.includes(String.fromCharCode(response.key)); //If the response is included in the correct_choice array, return true. Else, return false.
                    }
                    //Else if the elements are numbers (javascript character codes)
                    else if (typeof trial.correct_choice[0] === 'number') {
                        return trial.correct_choice.includes(response.key); //If the response is included in the correct_choice array, return true. Else, return false.
                    }
                }
                //Else compare the char with the response key
                else {
                    //If the element is a character
                    if (typeof trial.correct_choice === 'string' || trial.correct_choice instanceof String) {
                        //Return true if the user's response matches the correct answer. Return false otherwise.
                        return response.key == trial.correct_choice.toUpperCase().charCodeAt(0);
                    }
                    //Else if the element is a number (javascript character codes)
                    else if (typeof trial.correct_choice === 'number') {
                        return response.key == trial.correct_choice;
                    }
                }
            }
        }


        //Function that clears the dots on the canvas by drawing over it with the color of the baclground

        function update(deltaTime) {
            for (let i = 0; i < oobs.length; i++) {
                oobs[i].update(deltaTime);
            }
        }

        //Draw the dots on the canvas after they're updated
        function draw() {
            for (let i = 0; i < canvasArray.length; i++) {
                ctxArray[i].clearRect(0, 0, canvasArray[i].width, canvasArray[i].height);
            }
            for (let i = 0; i < oobs.length; i++) {
                oobs[i].draw();
            }
        }//End of draw


        //Function to make the dots move on the canvas
        function animateDotMotion() {
            //frameRequestID saves a long integer that is the ID of this frame request. The ID is then used to terminate the request below.
            let frameRequestID = window.requestAnimationFrame(animate);

            //Start to listen to subject's key responses
            startKeyboardListener();

            //Declare a timestamp
            let previousTimestamp;
            let dT = 0;


            function animate() {
                //If stopping condition has been reached, then stop the animation
                if (stopOobMotion) {
                    window.cancelAnimationFrame(frameRequestID); //Cancels the frame request
                }
                //Else continue with another frame request
                else {
                    frameRequestID = window.requestAnimationFrame(animate); //Calls for another frame request

                    //If the timer has not been started and it is set, then start the timer
                    if ((!timerHasStarted) && (trial.trial_duration > 0)) {
                        //If the trial duration is set, then set a timer to count down and call the end_trial function when the time is up
                        //(If the subject did not press a valid keyboard response within the trial duration, then this will end the trial)
                        timeoutID = window.setTimeout(end_trial, trial.trial_duration); //This timeoutID is then used to cancel the timeout should the subject press a valid key
                        //The timer has started, so we set the variable to true so it does not start more timers
                        timerHasStarted = true;
                    }

                    update(dT);

                    draw(); //Draw each of the dots in their respective apertures

                    //If this is before the first frame, then start the timestamp
                    if (previousTimestamp === undefined) {
                        previousTimestamp = performance.now();
                    }
                    //Else calculate the time and push it into the array
                    else {
                        let currentTimeStamp = performance.now(); //Variable to hold current timestamp
                        if (document.hasFocus()) {
                            dT = currentTimeStamp - previousTimestamp;
                        } else {
                            dT = 0;
                            previousTimestamp = performance.now();
                        }

                        frameRate.push(currentTimeStamp - previousTimestamp); //Push the interval into the frameRate array
                        previousTimestamp = currentTimeStamp; //Reset the timestamp

                    }
                }
            }
        }

        //----RDK Functions End----

        //----General Functions Begin//----

        //Function to assign the default values for the staircase parameters
        function assignParameterValue(argument, defaultValue) {
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

function getValueFromArrayOrNot(arrayOrNot, l) {
    if (Array.isArray(arrayOrNot)) {
        return arrayOrNot[l];
    }
    return arrayOrNot;
}

function standardColor(color) {
    let cvs = document.createElement('canvas');
    cvs.height = 1;
    cvs.width = 1;
    let ctx = cvs.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    return ctx.getImageData(0, 0, 1, 1).data;
}

function brighten(color, value) {
    let col = [0, 0, 0, 255];
    for (let i = 0; i < 3; i++) {
        let tmp = color[i] + value;
        tmp = tmp > 255 ? 255 : tmp;
        tmp = tmp < 0 ? 0 : tmp;
        col[i] = tmp;
    }
    return col;
}


function byteToHex(num) {
    // Turns a number (0-255) into a 2-character hex number (00-ff)
    return ('0' + num.toString(16)).slice(-2);
}


function stdColorToHex(color) {
    // Convert any CSS color to a hex representation
    // Examples:
    // colorToHex('red')            # '#ff0000'
    // colorToHex('rgb(255, 0, 0)') # '#ff0000'
    let hex;
    hex = [0, 1, 2].map(
        function (idx) {
            return byteToHex(color[idx]);
        }
    ).join('');
    return "#" + hex;
}

function getX(angle) {
    let rad = angle * Math.PI / 180;
    return Math.cos(rad);
}

function getY(angle) {
    let rad = angle * Math.PI / 180;
    return -Math.sin(rad);
}

function getNumbers(per, perOpp, n) {
    let nC = Math.round(per / 100 * n);
    let nCO;
    if (per + perOpp == 100) {
        nCO = n - nC;
    } else {
        nCO = Math.round(perOpp / 100 * n);
    }
    let nR = n - nC - nCO;
    if (nC + nCO > 100 && per == 50) {
        nC = 100 - nCO;
    }
    return [nC, nCO, nR];
}

function shuffleArray(arr) {
    arr.sort(() => Math.random() - 0.5);
}

function shuffleArraysParalell(arrays) {
    for (let j = arrays[0].length - 1; j > 0; j--) {
        for (let i = 0; i < arrays.length; i++) {
            const k = Math.floor(Math.random() * (j + 1));
            [arrays[i][j], arrays[i][k]] = [arrays[i][k], arrays[i][j]];
        }
    }
}

function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}


/// O(rientated) ob(ject)
class Oob {
    constructor(size, color, orientation, movementDirection, speed, randomisation, apertureType, isRandomWalk, isRandomOrientated, isFade, canvas, ctx, units) {
        this.canvas = canvas;
        if (units === 'px') {

        }
        this.size = canvas.width * size / 100;
        if (units === 'px') {
            this.size = size;
        }
        this.color = color;
        this.ctx = ctx;
        this.pos = {};
        this.vel = {};
        if (apertureType == 0) {
            this.pos.x = Math.random() * canvas.width;
            this.pos.y = Math.random() * canvas.height;
        }
        if (apertureType == 1) {
            let angle = Math.random() * 2 * Math.PI;
            let r = Math.sqrt(Math.sqrt(Math.random())) - .5;
            this.pos.x = r * Math.sin(angle) * canvas.width + canvas.width / 2;
            this.pos.y = r * Math.cos(angle) * canvas.height + canvas.height / 2;
        }
        this.speedRes = canvas.width * speed / 100 * (1 + (randomisation / 100 * Math.random() - randomisation / 100));
        if (units === 'px') {
            this.speedRes =  speed* (1 + (randomisation / 100 * Math.random() - randomisation / 100));
        }
        this.orientation = orientation;
        this.movementDirection = movementDirection;
        this.setVel();
        // corners of triangle rel
        this.ld = {};
        this.lu = {};
        this.r = {};
        this.setOrient();
        this.isRandomWalk = isRandomWalk;
        this.rW = (Math.random() - .5) * 10;
        this.isRandomOrientated = isRandomOrientated;
        this.rO = (Math.random() - .5) * 10;
        this.apertureType = apertureType;
        this.timeToChangeMovement = Math.random();
        this.timeToChangeOrientation = Math.random();
        this.isFade = isFade;
        this.alpha = 1.;
    }

    setVel() {
        this.vel.x = getX(this.movementDirection) * this.speedRes;
        this.vel.y = getY(this.movementDirection) * this.speedRes;
    }

    setOrient() {
        this.ld.x = getX(this.orientation + 270) * this.size;
        this.ld.y = getY(this.orientation + 270) * this.size;
        this.lu.x = getX(this.orientation + 90) * this.size;
        this.lu.y = getY(this.orientation + 90) * this.size;
        this.r.x = getX(this.orientation) * this.size;
        this.r.y = getY(this.orientation) * this.size;
    }

    randomMovement(deltaTime) {
        this.movementDirection += this.rW * deltaTime / 1000;
        this.setVel();
        this.timeToChangeMovement += deltaTime / 1000;
        let d = (1. - this.timeToChangeMovement);
        if (d < 0) {
            this.rW = (Math.random() - .5) * 30;
            this.timeToChangeMovement = -d;
        }
    }

    randomOrientation(deltaTime) {
        this.orientation += this.rO * deltaTime / 1000;
        if (this.orientation < 0) {
            this.orientation = 360 - this.orientation;
        } else if (this.orientation > 360) {
            this.orientation = this.orientation - 360;
        }
        this.setOrient();
        this.timeToChangeOrientation += deltaTime / 1000;
        let d = (1. - this.timeToChangeOrientation);
        if (d < 0) {
            this.rO = (Math.random() - .5) * 60;
            this.setOrient();
            this.timeToChangeOrientation = -d;
        }
    }

    handleOutOfBounds() {
        if (this.apertureType == 0) {
            this.alpha = .1;
            if (this.pos.x < -this.size) {
                this.pos.x = this.canvas.width + this.size;
            } else if (this.pos.x > this.canvas.width + this.size) {
                this.pos.x = -this.size;
            }
            if (this.pos.y < -this.size) {
                this.pos.y = this.canvas.height + this.size;
            } else if (this.pos.y > this.canvas.height + this.size) {
                this.pos.y = -this.size;
            }
            let d = Math.min(this.pos.x - this.size, this.pos.y - this.size, this.canvas.width - (this.pos.x + this.size), this.canvas.height - (this.pos.y + this.size));
            if ((d < this.canvas.width / 20) && (this.isFade)) {
                this.alpha = d / (this.canvas.width / 20);
                if (this.alpha < 0) this.alpha = 0;
            } else {
                this.alpha = 1.;
            }
        }
        if (this.apertureType == 1) {
            this.alpha = .1;
            let a = this.canvas.width / 2;
            let b = this.canvas.height / 2;
            let x = this.pos.x - a;
            let y = this.pos.y - b;
            let d = x * x / (a * a) + y * y / (b * b);
            if (d > .7 && this.isFade) {
                this.alpha = (1 - d) / .3;
                if (this.alpha < 0) this.alpha = 0;
            } else {
                this.alpha = 1.;
            }
            if (d > 1) {// (a + this.size / 2) * (a + this.size / 2) + (b + this.size / 2) * (b + this.size / 2)) {
                x *= -.99;
                y *= -.99;
                this.pos.x = x + a;
                this.pos.y = y + b;
            }
        }
    }


    // deltaTime is given in ms!
    update(deltaTime) {
        // updatePosition
        this.pos.x += this.vel.x * deltaTime / 1000;
        this.pos.y += this.vel.y * deltaTime / 1000;
        if (this.isRandomWalk) this.randomMovement(deltaTime);
        if (this.isRandomOrientated) this.randomOrientation(deltaTime);
        this.handleOutOfBounds();


    }

    draw() {
        this.ctx.globalAlpha = this.alpha;
        this.ctx.beginPath();
        let x = this.pos.x + this.ld.x;
        let y = this.pos.y + this.ld.y;
        this.ctx.moveTo(x, y);
        x = this.pos.x + this.lu.x;
        y = this.pos.y + this.lu.y;
        this.ctx.lineTo(x, y);
        x = this.pos.x + this.r.x;
        y = this.pos.y + this.r.y;
        this.ctx.lineTo(x, y);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

class OobBird extends Oob {
    constructor(size, color, orientation, movementDirection, speed, randomisation, apertureType, isRandomWalk, isRandomOrientated, isFade, canvas, ctx, units) {
        super(size, color, orientation, movementDirection, speed, randomisation, apertureType, isRandomWalk, isRandomOrientated, isFade, canvas, ctx, units);
        this.animationTime = Math.random();
        this.animationFrame = 4;
        if (this.animationTime < .8) this.animationFrame = 3;
        if (this.animationTime < .6) this.animationFrame = 2;
        if (this.animationTime < .4) this.animationFrame = 1;
        if (this.animationTime < .2) this.animationFrame = 0;
        this.animationTime *= .1;
        this.animdir = 1;
        let stdColor = color;
        this.makeColors(stdColor, orientation);

    }

    makeColors(color, orientation) {
        this.colorsLeft = [];
        this.colorsRight = [];
        let brightenStartR = Math.round(-getY(orientation) * 5);
        let brightenStartL = Math.round(getX(orientation) * 5)
        let colR = brighten(color, brightenStartR);
        let colL = brighten(color, brightenStartL);
        this.colorsRight.push(stdColorToHex(colR));
        this.colorsLeft.push(stdColorToHex(colL));
        for (let i = 0; i < 6; i++) {
            colR = brighten(colR, brightenStartR);
            colL = brighten(colL, brightenStartL);
            this.colorsRight.push(stdColorToHex(colR));
            this.colorsLeft.push(stdColorToHex(colL));
        }
    }


    update(deltaTime) {
        super.update(deltaTime);
        this.animationTime += deltaTime / 1000;
        let d = .1 - this.animationTime;
        if (d < 0) {
            this.animationFrame += this.animdir;
            this.animationTime = -d;
            if (this.animationFrame > 5 || this.animationFrame < 1) {
                this.animationTime -= .1;
                this.animdir *= -1;
            }

        }
        //this.animationFrame = 5;
    }

    draw() {
        this.ctx.globalAlpha = this.alpha;
        let px = this.pos.x + .2 * this.r.x;
        let py = this.pos.y + .2 * this.r.y;
        this.ctx.beginPath();
        this.ctx.moveTo(px, py);
        let x = this.pos.x + this.ld.x / (this.animationFrame * .1 + 1);
        let y = this.pos.y + this.ld.y / (this.animationFrame * .1 + 1);
        this.ctx.lineTo(x, y);
        x = this.pos.x + this.r.x;
        y = this.pos.y + this.r.y;
        this.ctx.lineTo(x, y);
        this.ctx.fillStyle = this.colorsRight[this.animationFrame];
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(px, py);
        x = this.pos.x + this.lu.x / (this.animationFrame * .1 + 1);
        y = this.pos.y + this.lu.y / (this.animationFrame * .1 + 1);
        this.ctx.lineTo(x, y);
        x = this.pos.x + this.r.x;
        y = this.pos.y + this.r.y;
        this.ctx.lineTo(x, y);
        this.ctx.fillStyle = this.colorsLeft[this.animationFrame];
        this.ctx.fill();
    }
}

class OobCircle extends Oob {
    draw() {
        this.ctx.globalAlpha = this.alpha;
        this.ctx.beginPath();
        this.ctx.arc(this.pos.x, this.pos.y, this.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

class OobSquare extends Oob {
    draw() {
        this.ctx.globalAlpha = this.alpha;
        this.ctx.beginPath();
        let x = this.pos.x - this.size / 2;
        let y = this.pos.y - this.size / 2;
        this.ctx.moveTo(x, y);
        x = this.pos.x + this.size / 2;
        y = this.pos.y - this.size / 2;
        this.ctx.lineTo(x, y);
        x = this.pos.x + this.size / 2;
        y = this.pos.y + this.size / 2;
        this.ctx.lineTo(x, y);
        x = this.pos.x - this.size / 2;
        y = this.pos.y + this.size / 2;
        this.ctx.lineTo(x, y);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

    }
}

class OobImage extends Oob {
    constructor(size, color, orientation, movementDirection, speed, randomisation, apertureType, isRandomWalk, isRandomOrientated, isFade, imageArray, keyframes, keyframeTime, mirrorType, canvas, ctx, units) {
        super(size, color, orientation, movementDirection, speed, randomisation, apertureType, isRandomWalk, isRandomOrientated, isFade, canvas, ctx, units);
        if (Array.isArray(imageArray)) {
            let i = Math.floor(Math.random() * imageArray.length);
            this.img = imageArray[i];
            this.keyframes = getValueFromArrayOrNot(keyframes, i);
            this.keyframeTime = getValueFromArrayOrNot(keyframeTime, i);
            this.mirrorType = getValueFromArrayOrNot(mirrorType, i);
        } else {
            this.img = imageArray;
            this.keyframes = keyframes;
            this.keyframeTime = keyframeTime;
            this.mirrorType = mirrorType;
        }
        this.imgWidth = this.img.naturalWidth / this.keyframes;
        this.imgHeight = this.img.naturalHeight;
        this.actualKeyframe = Math.floor(Math.random() * this.keyframes);
        this.animationTime = Math.random() * this.keyframeTime;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.animationTime += deltaTime / 1000;
        let d = this.keyframeTime - this.animationTime;
        if (d < 0) {
            this.animationTime = -d;
            this.actualKeyframe++;
            if (this.actualKeyframe >= this.keyframes) this.actualKeyframe = 0;
        }
    }


    draw() {
        this.ctx.globalAlpha = this.alpha;
        this.ctx.translate(this.pos.x, this.pos.y);
        if (this.mirrorType === 0) {
            this.ctx.rotate(-Math.PI * this.orientation / 180);
        } else if (this.mirrorType == 1) {
            if (this.orientation > 90 && this.orientation < 270) {
                this.ctx.rotate(-Math.PI * (this.orientation - 180) / 180);
            } else {
                this.ctx.rotate(-Math.PI * this.orientation / 180);
            }
        }
        this.ctx.translate(-this.pos.x, -this.pos.y);
        if (this.mirrorType === 0) {
            this.ctx.drawImage(this.img, this.actualKeyframe * this.imgWidth, 0, this.imgWidth, this.imgHeight, this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size);
        } else if (this.mirrorType === 1) {
            if (this.orientation > 90 && this.orientation < 270) {
                this.ctx.drawImage(this.img, (this.actualKeyframe) * this.imgWidth, this.imgHeight / 2, this.imgWidth, this.imgHeight / 2, this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size);
            } else {
                this.ctx.drawImage(this.img, this.actualKeyframe * this.imgWidth, 0, this.imgWidth, this.imgHeight / 2, this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size);
            }

        }
        this.ctx.translate(this.pos.x, this.pos.y);
        if (this.mirrorType === 0) {
            this.ctx.rotate(Math.PI * this.orientation / 180);
        } else if (this.mirrorType === 1) {
            if (this.orientation > 90 && this.orientation < 270) {
                this.ctx.rotate(Math.PI * (this.orientation - 180) / 180);
            } else {
                this.ctx.rotate(Math.PI * this.orientation / 180);
            }
        }
        this.ctx.translate(-this.pos.x, -this.pos.y);
    }
}

