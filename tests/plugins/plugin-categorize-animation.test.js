const root = '../../';
const utils = require('../testing-utils.js');

jest.useFakeTimers();

describe('categorize-animation plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-categorize-animation.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['categorize-animation']).not.toBe('undefined');
	});

	test('displays stimulus every 500ms', function(){
		var trial = {
			type: 'categorize-animation',
			stimuli: ['img/happy_face_1.jpg', 'img/sad_face_1.jpg'],
			key_answer: 68
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"img/happy_face_1.jpg\" class=\"jspsych-categorize-animation-stimulus\">');
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"img/sad_face_1.jpg\" class=\"jspsych-categorize-animation-stimulus\">')
	});

	test('prompt should display after animation', function(){
		var trial = {
			type: 'categorize-animation',
			stimuli: ['img/happy_face_1.jpg', 'img/sad_face_1.jpg'],
			key_answer: 68,
			prompt: "<p>Press d if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>"
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		jest.runTimersToTime(1500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<p>Press d if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>');
	});

	test('should display correct if key_answer is pressed', function(){
		var trial = {
			type: 'categorize-animation',
			stimuli: ['img/happy_face_1.jpg', 'img/sad_face_1.jpg'],
			key_answer: 68,
			choices: [68, 83],
			prompt: "<p>Press d if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>"
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		jest.runTimersToTime(1500);
		utils.pressKey(68);
		jest.runTimersToTime(1000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('Correct.');
	});

	test('should display incorrect if different key is pressed', function(){
		var trial = {
			type: 'categorize-animation',
			stimuli: ['img/happy_face_1.jpg', 'img/sad_face_1.jpg'],
			key_answer: 68,
			choices: [68, 83],
			prompt: "<p>Press d if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>"
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		jest.runTimersToTime(1500);
		utils.pressKey(83);
		jest.runTimersToTime(1000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('Wrong.');
	});

	test('text answer should replace %ANS%', function(){
		var trials = {
    		type: 'categorize-animation',
    		stimuli: ['img/happy_face_1.jpg', 'img/sad_face_3.jpg'],
    		key_answer: 68,
    		choices: [68, 83],
    		text_answer: 'different',
    		correct_text: "<p>Correct. The faces had %ANS% expressions.</p>",
    		incorrect_text: "<p>Incorrect. The faces had %ANS% expressions.</p>",
    		prompt: "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
  		};

  		jsPsych.init({
    			timeline: [trials],
					auto_preload: false
  		});

		jest.runTimersToTime(1500);
		utils.pressKey(68);
		jest.runTimersToTime(1000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<p>Correct. The faces had different expressions.</p>');
	});

	test('correct text displays when when key_answer is pressed', function(){
		var trials = {
    		type: 'categorize-animation',
    		stimuli: ['img/happy_face_1.jpg', 'img/sad_face_3.jpg'],
    		key_answer: 68,
    		choices: [68, 83],
    		correct_text: "<p>You pressed the correct key</p>",
    		incorrect_text: "<p>Incorrect.</p>",
    		prompt: "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
  		};

  		jsPsych.init({
    			timeline: [trials],
					auto_preload: false
  		});

		jest.runTimersToTime(1500);
		utils.pressKey(68);
		jest.runTimersToTime(1000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<p>You pressed the correct key</p>');
	});

	test('correct text displays when when key_answer is pressed', function(){
		var trials = {
    		type: 'categorize-animation',
    		stimuli: ['img/happy_face_1.jpg', 'img/sad_face_3.jpg'],
    		key_answer: 68,
    		choices: [68, 83],
    		correct_text: "<p>You pressed the correct key</p>",
    		incorrect_text: "<p>Incorrect. You pressed the wrong key.</p>",
    		prompt: "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
  		};

  		jsPsych.init({
    			timeline: [trials],
					auto_preload: false
  		});

		jest.runTimersToTime(1500);
		utils.pressKey(83);
		jest.runTimersToTime(1000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<p>Incorrect. You pressed the wrong key.</p>');
	});

	test('duration to display image is based on frame_time', function(){
		var trials = {
    		type: 'categorize-animation',
    		stimuli: ['img/happy_face_1.jpg', 'img/sad_face_1.jpg'],
    		key_answer: 68,
    		choices: [68, 83],
    		frame_time: 1000,
    		correct_text: "<p>You pressed the correct key</p>",
    		incorrect_text: "<p>Incorrect. You pressed the wrong key.</p>",
    		prompt: "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
  		};

  		jsPsych.init({
    		timeline: [trials],
				auto_preload: false
  		});

		jest.runTimersToTime(1000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"img/happy_face_1.jpg\" class=\"jspsych-categorize-animation-stimulus\">');
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"img/happy_face_1.jpg\" class=\"jspsych-categorize-animation-stimulus\">');
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"img/sad_face_1.jpg\" class=\"jspsych-categorize-animation-stimulus\">');
	});

	test('sequence reps', function(){
		var trials = {
    		type: 'categorize-animation',
    		stimuli: ['img/happy_face_1.jpg', 'img/sad_face_1.jpg'],
    		key_answer: 68,
    		choices: [68, 83],
    		frame_time: 1000,
    		sequence_reps: 2,
    		correct_text: "<p>You pressed the correct key</p>",
    		incorrect_text: "<p>Incorrect. You pressed the wrong key.</p>",
    		prompt: "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
  		};

  		jsPsych.init({
    		timeline: [trials],
				auto_preload: false
  		});

		jest.runTimersToTime(1000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"img/happy_face_1.jpg\" class=\"jspsych-categorize-animation-stimulus\">');
		jest.runTimersToTime(1000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"img/sad_face_1.jpg\" class=\"jspsych-categorize-animation-stimulus\">');
		jest.runTimersToTime(1000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"img/happy_face_1.jpg\" class=\"jspsych-categorize-animation-stimulus\">');
		jest.runTimersToTime(1000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"img/sad_face_1.jpg\" class=\"jspsych-categorize-animation-stimulus\">');
	});

	test('subject can response before animation is completed', function(){
		var trials = {
    		type: 'categorize-animation',
    		stimuli: ['img/happy_face_1.jpg', 'img/sad_face_1.jpg'],
    		key_answer: 68,
    		choices: [68, 83],
    		frame_time: 1000,
    		sequence_reps: 2,
    		correct_text: "<p>You pressed the correct key</p>",
    		incorrect_text: "<p>Incorrect. You pressed the wrong key.</p>",
    		prompt: "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
    		allow_response_before_complete: true,
  		};

  		jsPsych.init({
    		timeline: [trials],
				auto_preload: false
  		});

		jest.runTimersToTime(1500);
		utils.pressKey(68);
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<img src=\"img/sad_face_1.jpg\" class=\"jspsych-categorize-animation-stimulus\"><p>You pressed the correct key</p>');
	});

	test('display should clear after feeback_duration is done', function(){
		var trials = {
    		type: 'categorize-animation',
    		stimuli: ['img/happy_face_1.jpg', 'img/sad_face_1.jpg'],
    		key_answer: 68,
    		choices: [68, 83],
    		frame_time: 500,
    		feeback_duration: 500,
    		correct_text: "<p>You pressed the correct key</p>",
    		incorrect_text: "<p>Incorrect. You pressed the wrong key.</p>",
    		prompt: "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
  		};

  		jsPsych.init({
    		timeline: [trials],
				auto_preload: false
  		});

		jest.runTimersToTime(1500);
		utils.pressKey(68);
		jest.runTimersToTime(500);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('<p>You pressed the correct key</p>');
		jest.runTimersToTime(2000);
		expect(jsPsych.getDisplayElement().innerHTML).toBe('');
	});

});
