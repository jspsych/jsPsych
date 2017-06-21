const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('button-response', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-button-response.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['button-response']).not.toBe('undefined');
	});

	test('displays image by default', function(){
		var trial = {
			type: 'button-response',
			stimulus: '../media/blue.png'
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src="../media/blue.png" id="jspsych-button-response-stimulus">')
	});

	test('displays html when is_html is true', function(){
    	var trial = {
      		type: 'button-response',
      		stimulus: '<p>button</p>',
      		choices: ['HAPPY'],
      		is_html: true,
    	}

   		jsPsych.init({
      		timeline: [trial]
    	});

    	expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id=\"jspsych-button-response-stimulus\"><p>button</p></div>');
  	});

  	test('displays buttons in button array', function(){
  		var trial = {
  			type: 'button-response',
  			button_html: ['img/button1.png', 'img/button2.png'],
  			choices: ['HAPPY', 'SAD'],
  		}

  		jsPsych.init({
  			timeline: [trial]
  		});

  		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<div class=\"jspsych-button-response-button\" style=\"display: inline-block; margin:0px 8px\" id=\"jspsych-button-response-button-0\" data-choice=\"0\">img/button1.png</div><div class=\"jspsych-button-response-button\" style=\"display: inline-block; margin:0px 8px\" id=\"jspsych-button-response-button-1\" data-choice=\"1\">img/button2.png</div>'));
  	});

  	test('prompt should append html below stimulus', function(){
    	var trial = {
      		type: 'button-response',
      		stimulus: '<p>hello</p>',
      		is_html: true,
      		choices: ['HAPPY'],
      		prompt: '<div id="foo">this is the prompt</div>'
   		}

    	jsPsych.init({
      		timeline: [trial]
    	});

    	expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id=\"foo\">this is the prompt</div>');
    });

    test('timing_stim should set visibility of content to hidden after time has elapsed', function(){
    	var trial = {
      		type: 'button-response',
      		stimulus: '<p>hello</p>',
      		is_html: true,
      		choices: ['HAPPY'],
      		timing_stim: 500
    	}

    	jsPsych.init({
      		timeline: [trial]
    	});

    	expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-button-response-stimulus"><p>hello</p></div>');

    	jest.runAllTimers();

    	expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-button-response-stimulus" style="visibility: hidden;"><p>hello</p></div>');
  	});

  	test('timing_response should end trial after time has elapsed', function(){
		var trial = {
      		type: 'button-response',
      		stimulus: '<p>hello</p>',
      		is_html: true,
      		choices: ['HAPPY'],
      		timing_response: 500
   		}

    	jsPsych.init({
      		timeline: [trial]
    	});

    	expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="jspsych-button-response-stimulus"><p>hello</p></div>');

    	jest.runAllTimers();

    	expect(jsPsych.getDisplayElement().innerHTML).toBe('');
  	});

  	test('trial should not end when response_ends_trial is false and stimulus should get responded class', function(){
    	var trial = {
      		type: 'button-response',
      		stimulus: '<p>hello</p>',
      		is_html: true,
      		choices: ['HAPPY'],
      		response_ends_trial: false,
      		timing_response: 500
    	}

    	jsPsych.init({
      		timeline: [trial]
    	});

  		document.querySelector('#jspsych-button-response-button-0').click();
			console.log(jsPsych.getDisplayElement().innerHTML);

    	expect(jsPsych.getDisplayElement().querySelector('#jspsych-button-response-stimulus').className).toMatch("responded");

    	jest.runAllTimers();
  	});
});
