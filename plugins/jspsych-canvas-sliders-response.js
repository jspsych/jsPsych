/**
 * jspsych-canvas-sliders-response
 *
 * a jspsych plugin for free response to questions presented using canvas
 * drawing tools. This version uses multiple sliders to record responses. All
 * slider values will be included in the final data.
 * Sliders can be designated into groups of various kinds. These groups specify
 * which sliders need to be moved before the trial can be completed, and
 * which sliders get reset when other sliders are moved. E.g. one may want to
 * give a participant a split confidence scale where a response is required on
 * one of two sliders (but not both). Setting these two sliders to have the
 * same require_change group and the same exclusive_group identifier will
 * accomplish this.
 *
 * the canvas drawing is done by a function which is supplied as the stimulus.
 * this function is passed the id of the canvas on which it will draw.
 *
 * the canvas can either be supplied as customised HTML, or a default one
 * can be used. If a customised on is supplied, its ID must be specified
 * in a separate variable.
 *
 * Matt Jaquiery - https://github.com/mjaquiery/ - Feb 2018
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['canvas-sliders-response'] = (function() {

    let plugin = {};

    plugin.info = {
        name: 'canvas-sliders-response',
        description: 'Collect multiple slider responses to stimuli '+
        'drawn on an HTML canvas',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The function to be called with the canvas ID. '+
                'This should handle drawing operations.'
            },
            canvasHTML: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Canvas HTML',
                default: null,
                description: 'HTML for drawing the canvas. '+
                'Overrides canvas width and height settings.'
            },
            canvasId: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Canvas ID',
                default: false,
                description: 'ID for the canvas. Only necessary when '+
                'supplying canvasHTML. This is required so that the ID '+
                'can be passed to the stimulus function.'
            },
            canvasWidth: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Canvas width',
                default: 300,
                description: 'Sets the width of the canvas.'
            },
            canvasHeight: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Canvas height',
                default: 150,
                description: 'Sets the height of the canvas.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Content to display below the stimulus.'
            },
            sliderCount: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider count',
                default: undefined,
                description: 'Number of sliders to draw.'
            },
            min: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Min slider',
                default: [0],
                array: true,
                description: 'Sets the minimum value of the sliders. '+
                'Format is an array of length sliderCount. '+
                'Shorter arrays will be padded with the final value.'
            },
            max: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Max slider',
                default: [100],
                array: true,
                description: 'Sets the maximum value of the sliders. '+
                'Format is an array of length sliderCount. '+
                'Shorter arrays will be padded with the final value.'
            },
            reversed: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Reverse scored',
                default: [false],
                array: true,
                description: 'Reverse scored sliders have their answer '+
                'reported as max-answer rather than as simply answer. '+
                'Format is an array of length sliderCount. '+
                'Shorter arrays will be padded with the final value.'
            },
            start: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider starting value',
                default: [50],
                array: true,
                description: 'Sets the starting value of the sliders. '+
                'Format is an array of length sliderCount. '+
                'Shorter arrays will be padded with the final value.'
            },
            step: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Step',
                default: [1],
                array: true,
                description: 'Sets the step of the sliders. '+
                'Format is an array of length sliderCount. '+
                'Shorter arrays will be padded with the final value.'
            },
            labels: {
                type: jsPsych.plugins.parameterType.COMPLEX,
                pretty_name:'Labels',
                default: [[]],
                array: true,
                description: 'Labels of the sliders. '+
                'Format is an array of length sliderCount. '+
                'Shorter arrays will be padded with the final value. '+
                'Each array entry must be an array of strings for the labels '+
                'which apply to that slider.'
            },
            require_change: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Require change',
                default: [0],
                array: true,
                description: 'Whether one of these sliders must have been changed '+
                'before a response is accepted. Format is an array of ints, where '+
                'non-zero ints specify slider sets. At least one slider in each '+
                'set must be changed before the response is accepted.'
            },
            require_change_warning: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Require change warning',
                default: ['<span style="color: red;">'+
                'At least one of the bars must have been moved to continue.'
                +'</span>'],
                array: true,
                description: 'HTML to display when not enough sliders have been '+
                'moved to continue',
            },
            slider_arrangement: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider arrangement',
                default: null,
                array: true,
                description: 'Sliders with the same slider arrangement value '+
                'will be placed on the same row, with those appearing first '+
                'placed to the left of those appearing later.'
            },
            slider_prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                array: true,
                description: 'Any content here will be displayed below the sliders. '+
                'Format is an array of length sliderCount. '+
                'Shorter arrays will be padded with the final value.'
            },
            slider_name: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Slider name',
                default: [null],
                array: true,
                description: 'Name of the slider (used in the results reporting'+
                    ' only). Sliders with missing values in this array will not'+
                    ' have a name associated with them in the results.'
            },
            slider_col_spacing: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider column spacing',
                default: [25],
                array: true,
                description: 'Spacing between columns within each row of sliders. '+
                'Added as a margin to the left and right of each slider. '+
                'Each entry in the array refers to an individual row. '+
                'Shorter arrays will be padded with the final value.'
            },
            exclusive_group: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Exclusive slider response group',
                default: [0],
                description: 'Whether changing one slider resets the other sliders '+
                'in this group to their starting values. Group 0 are not exclusive'
            },
            slider_class_touched: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Slider class (touched)',
                default: ['jspsych-sliders-response-slider-touched'],
                array: true,
                description: 'Class to apply to a slider when changed. Applied within an exclusive_group.'
            },
            slider_class_untouched: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Slider class (untouched)',
                array: true,
                default: ['jspsych-sliders-response-slider-untouched'],
                description: 'Class to apply to a slider when reset. Applied within an exclusive_group.'
            },
            button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default:  'Continue',
                array: false,
                description: 'Label of the button to advance.'
            },
            stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to hide the stimulus.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show the trial.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, trial will end when user makes a response.'
            },
        }
    };

    plugin.trial = function(display_element, trial) {
        let canvas = '';
        // Use the supplied HTML for constructing the canvas, if supplied
        if(trial.canvasId !== false) {
            canvas = trial.canvasHTML;
        } else {
            // Otherwise create a new default canvas
            trial.canvasId = 'jspsych-canvas-sliders-response-canvas';
            canvas = '<canvas id="'+trial.canvasId+'" height="'+trial.canvasHeight+
                '" width="'+trial.canvasWidth+'"></canvas>';
        }
        let html = '<div id="jspsych-canvas-sliders-response-wrapper" class="jspsych-sliders-response-wrapper">';
        html += '<div id="jspsych-canvas-sliders-response-stimulus">'+canvas+'</div>';
        // Prompt text
        if (trial.prompt !== null) {
            html += '<div id="jspsych-canvas-sliders-response-prompt">'+trial.prompt+'</div>';
        }

        // Sliders
        // Define the sliders
        const sliders = [];
        let max_slider_row = null;
        for (let i=0; i<trial.sliderCount; i++) {
            sliders.push({
                min: (trial.min.length > i)? trial.min[i] :
                    trial.min[trial.min.length-1],
                max: (trial.max.length > i)?  trial.max[i] :
                    trial.max[trial.max.length-1],
                reversed: (trial.reversed.length > i)? trial.reversed[i] :
                    trial.reversed[trial.reversed.length-1],
                start: (trial.start.length > i)? trial.start[i] :
                    trial.start[trial.start.length-1],
                step: (trial.step.length > i)? trial.step[i] :
                    trial.step[trial.step.length-1],
                labels: (trial.labels.length > i)? trial.labels[i] :
                    trial.labels[trial.labels.length-1],
                require_change: (trial.require_change.length > i)?
                    trial.require_change[i] :
                    trial.require_change[trial.require_change.length-1],
                require_change_warning: (trial.require_change_warning.length > i)?
                    trial.require_change_warning[i] :
                    trial.require_change_warning[trial.require_change_warning.length-1],
                exclusive_group: (trial.exclusive_group.length > i)?
                    trial.exclusive_group[i] :
                    trial.exclusive_group[trial.exclusive_group.length-1],
                name: (typeof trial.slider_name[i] === 'undefined')?
                    null : trial.slider_name[i]
            });
            let slider = sliders.pop();
            if (trial.slider_arrangement !== null) {
                slider.arrangement = (trial.slider_arrangement.length > i)?
                    trial.slider_arrangement[i] :
                    trial.slider_arrangement[trial.slider_arrangement.length-1];
                if (max_slider_row === null || slider.arrangement > max_slider_row) {
                    max_slider_row = slider.arrangement;
                }
            } else {
                slider.arrangement = 0;
            }
            if (trial.slider_prompt !== null) {
                slider.prompt = (trial.slider_prompt.length > i)?
                    trial.slider_prompt[i] :
                    trial.slider_prompt[trial.slider_prompt.length-1];
            } else {
                slider.prompt = "";
            }
            if (trial.slider_class_touched !== null) {
                slider.class_touched = (trial.slider_class_touched.length > slider.exclusive_group)?
                    trial.slider_class_touched[slider.exclusive_group] :
                    trial.slider_class_touched[trial.slider_class_touched.length-1];
            } else {
                slider.class_touched = null;
            }
            if (trial.slider_class_untouched !== null) {
                slider.class_untouched = (trial.slider_class_untouched.length > slider.exclusive_group)?
                    trial.slider_class_untouched[slider.exclusive_group] :
                    trial.slider_class_untouched[trial.slider_class_untouched.length-1];
            } else {
                slider.class_untouched = null;
            }
            slider.changedTime = NaN;
            sliders.push(slider)
        }
        let row_count = (max_slider_row === null)? 1 : max_slider_row+1;
        html += '<div class="jspsych-sliders-response-container">';
        // Loop the rows of sliders
        for (let i=0; i<row_count; i++) {
            let col = 0;
            html += '<div id="jspsych-sliders-response-slider-row'+i+'" class="'+
                'jspsych-sliders-row">';
            for(let s=0; s<sliders.length; s++) {
                let slider = sliders[s];
                if (max_slider_row === null || slider.arrangement === i) {
                    // Draw the slider
                    let colCount = slider.labels.length * 2;
                    let tdWidth = 100/colCount;
                    html += '<div id="jspsych-sliders-response-slider-col'+
                        col+'" class="jspsych-sliders-col">';
                    // Draw sliders in tables because rigid formatting is important here
                    html += '<table id="jspsych-sliders-response-table'+s+'" class="jspsych-sliders-table">';
                    // prompt
                    html += '<tr class="jspsych-sliders-prompt"><td colspan="'+colCount+
                        '" style="width: 100%;" id="jspsych-sliders-response-slider-prompt'+s+
                        '" class="jspsych-sliders-prompt">'+
                        slider.prompt+'</td></tr>';
                    // slider
                    let spacer = (colCount===2)? '' : '<td class="jspsych-sliders-spacer" style="width: '+
                        tdWidth.toString()+'%;"></td>';
                    let colSpan = colCount===2? 2 : colCount/2;
                    html += '<tr class="jspsych-sliders-slider">'+
                        spacer+
                        '<td colspan="'+(colSpan).toString()+'" style="width: '+(tdWidth*colSpan).toString()+'%;" '+
                        'class="jspsych-sliders-slider" id="jspsych-canvas-sliders-response-sliderCell'+s+'"'+
                        ' ><input type="range" value="'+slider.start+
                        '" min="'+slider.min+'" max="'+slider.max+
                        '" step="'+slider.step+'" '+
                        'id="jspsych-canvas-sliders-response-slider'+s+'" '+
                        'class="jspsych-sliders-response-slider"/></td>'+
                        spacer+
                        '</tr>';
                    // labels
                    html += '<tr id="jspsych-canvas-sliders-response-labels'+s
                        +'" class="jspsych-sliders-response-labels">';
                    for(let j=0; j < slider.labels.length; j++){
                        let width = 100/slider.labels.length;
                        let left_offset = j * width;
                        let widthStr = (j === slider.labels.length-1)?
                            "" : 'width: '+(100/slider.labels.length).toString()+'%;';
                        html += '<td colspan="2" style="width: '+(tdWidth*2).toString()+
                            '%;" class="jspsych-sliders-response-label"'+
                            ' id="jspsych-canvas-sliders-response-labelS'+s+'L'+j+'">';
                        html += '<span class="jspsych-sliders-response-label">'+slider.labels[j]+'</span>';
                        html += '</td>'
                    }
                    html += '</tr>';
                    html += '</table>';
                    html += '</div>';
                    col++;
                }
            }
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';

        // warning area if sliders are missed
        html += '<div id="jspsych-canvas-sliders-response-warnings"></div>';

        // add submit button
        html += '<button id="jspsych-canvas-sliders-response-next" class="jspsych-btn">'+trial.button_label+'</button>';

        // basic styling
        html += '<style type="text/css">table.jspsych-sliders-table {width: 100%}'+
            'div.jspsych-sliders-row {display: inline-flex; width: 100%}'+
            'div.jspsych-sliders-col {width: 100%}</style>';

        display_element.innerHTML += html;

        let response = {
            startTime: performance.now(),
            rt: null,
            response: null,
            stimulus_properties: null
        };

        // Execute the supplied drawing function
        response.stimulus_properties = trial.stimulus(trial.canvasId);

        // Swap the touched and reset classes on the slider
        function swapClass(el, classIn, classOut) {
            let cls = el.className;
            if (classIn !== null && cls.search(classIn) === -1) {
                cls += cls[cls.length-1]===' '? classIn : ' '+classIn;
            }
            if (classOut !== null && cls.search(classOut) !== -1) {
                cls = cls.replace(classOut, '');
            }
            el.className = cls;
            return el;
        }

        // Add listeners to the sliders
        function onSliderChange() {
            let slider = {};
            for (let i=0; i<sliders.length; i++) {
                let id = 'jspsych-canvas-sliders-response-slider'+i;
                if (id===this.id) {
                    slider = sliders[i];
                    swapClass(this, slider.class_touched, slider.class_untouched);
                    slider.changedTime = performance.now();
                    break;
                }
            }
            if(slider.exclusive_group !== 0) {
                swapSliderChangeFunction(true);
                for (let i=0; i<sliders.length; i++) {
                    let id = 'jspsych-canvas-sliders-response-slider'+i;
                    if (id !== this.id &&
                        slider.exclusive_group === sliders[i].exclusive_group) {
                        let other = display_element.querySelector('#'+id);
                        other.value = sliders[i].start;
                        swapClass(other, slider.class_untouched, slider.class_touched);
                    }
                }
                swapSliderChangeFunction();
            }
        }

        function swapSliderChangeFunction(remove=false) {
            for (let i=0; i<sliders.length; i++) {
                let s = display_element.querySelector('#jspsych-canvas-sliders-response-slider'+i);
                if (remove) {
                    s.removeEventListener('change', onSliderChange);
                } else {
                    s.addEventListener('change', onSliderChange);
                }
            }
        }

        swapSliderChangeFunction();

        display_element.querySelector('#jspsych-canvas-sliders-response-next').addEventListener('click', function() {
            // Validate the sliders (did they move everything they were supposed to?)
            let groups = [];
            let warnings = [];
            for (let i=0; i<sliders.length; i++) {
                let slider = sliders[i];
                if (slider.require_change !== 0) {
                    if (!isNaN(slider.changedTime)) {
                        // this group is okay!
                        groups.push(slider.require_change);
                    } else {
                        // note the warning string
                        warnings[slider.require_change] = slider.require_change_warning;
                    }
                }
            }
            let halt = false;
            let warn_html = '';
            warnings.forEach(function (w,i) {
                if (groups.indexOf(i) === -1) {
                    // not moved sliders in this group yet
                    halt = true;
                    warn_html += w;
                }
            });
            // Issue the warnings
            if (halt) {
                display_element.querySelector('#jspsych-canvas-sliders-response-warnings').innerHTML = warn_html;
                return;
            }
            // measure response time
            response.rt = performance.now() - response.startTime;
            let answers = [];
            for (let i=0; i<sliders.length; i++) {
                let value = display_element.querySelector('#jspsych-canvas-sliders-response-slider'+i).value;
                let slider = sliders[i];
                slider.value = slider.reversed? slider.max - value : value;
                answers.push({
                    id: i,
                    name: slider.name,
                    answer: slider.value,
                    prompt: slider.prompt,
                    lastChangedTime: slider.changedTime
                });
            }
            response.response = answers;

            if(trial.response_ends_trial){
                end_trial();
            } else {
                display_element.querySelector('#jspsych-canvas-sliders-response-next').disabled = true;
            }

        });

        function end_trial(){

            jsPsych.pluginAPI.clearAllTimeouts();

            // save data
            let trialdata = {
                "startTime": response.startTime,
                "rt": response.rt,
                "response": response.response,
                "stimulus_properties": response.stimulus_properties
            };

            if(trial.stimulus_duration !== null)
                trialdata.stimulusOffTime = response.stimulusOffTime;

            display_element.innerHTML = '';

            // next trial
            jsPsych.finishTrial(trialdata);
        }

        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                display_element.querySelector('#jspsych-canvas-sliders-response-stimulus').style.visibility = 'hidden';
                response.stimulusOffTime = performance.now() - response.startTime;
            }, trial.stimulus_duration);
        }

        // end trial if trial_duration is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        }
    };

    return plugin;
})();
