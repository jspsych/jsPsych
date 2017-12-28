const root = '../../';

jest.useFakeTimers();

describe('free-sort plugin', function(){

	beforeEach(function(){
		require(root + 'jspsych.js');
		require(root + 'plugins/jspsych-free-sort.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['free-sort']).not.toBe('undefined');
	});

	test('should display stimuli', function(){
		var trial = {
			type: 'free-sort',
			stimuli: ['img/happy_face_1.jpg','img/happy_face_2.jpg','img/happy_face_3.jpg','img/happy_face_4.jpg']
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('src=\"img/happy_face_1.jpg\" data-src=\"img/happy_face_1.jpg\"'));
		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('src=\"img/happy_face_2.jpg\" data-src=\"img/happy_face_2.jpg\"'));
		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('src=\"img/happy_face_3.jpg\" data-src=\"img/happy_face_3.jpg\"'));
		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('src=\"img/happy_face_4.jpg\" data-src=\"img/happy_face_4.jpg\"'));
	});

	test('should be able to adjust the height and width of free-sort area', function(){
		var trial = {
			type: 'free-sort',
			stimuli: ['img/happy_face_1.jpg','img/happy_face_2.jpg','img/happy_face_3.jpg','img/happy_face_4.jpg'],
			sort_area_height: 500,
			sort_area_width: 700,
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('class=\"jspsych-free-sort-arena\" style=\"position: relative; width:700px; height:500px;'));
	});

	test('should be able to adjust the height and width of stimuli', function(){
		var trial = {
			type: 'free-sort',
			stimuli: ['img/happy_face_1.jpg','img/happy_face_2.jpg','img/happy_face_3.jpg','img/happy_face_4.jpg'],
			stim_height: 200,
			stim_width: 200,
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<img src=\"img/happy_face_1.jpg\" data-src=\"img/happy_face_1.jpg\" class=\"jspsych-free-sort-draggable\" draggable=\"false\" style=\"position: absolute; cursor: move; width:200px; height:200px'));
	});

	test('should display prompt', function(){
		var trial = {
			type: 'free-sort',
			stimuli: ['img/happy_face_1.jpg','img/happy_face_2.jpg','img/happy_face_3.jpg','img/happy_face_4.jpg'],
			prompt: '<p>This is a prompt</p>'
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p>This is a prompt</p>'));
	});

	test('should display prompt at bottom if prompt_location is "below"',function(){
		var trial = {
			type: 'free-sort',
			stimuli: ['img/happy_face_1.jpg','img/happy_face_2.jpg','img/happy_face_3.jpg','img/happy_face_4.jpg'],
			prompt: '<p>This is a prompt</p>',
			prompt_location: 'below',
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<p>This is a prompt</p><button id=\"jspsych-free-sort-done-btn\"'));
	});

	test('should be able to change label of button', function(){
		var trial = {
			type: 'free-sort',
			stimuli: ['img/happy_face_1.jpg','img/happy_face_2.jpg','img/happy_face_3.jpg','img/happy_face_4.jpg'],
			button_label: 'Finito'

		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch(new RegExp('<button id=\"jspsych-free-sort-done-btn\" class=\"jspsych-btn\">Finito</button>'));
	});

});
