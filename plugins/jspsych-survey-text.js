/* jspsych-survey-text
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw (March 2013)
 *
 */
 
(function($) {
	jsPsych.survey_text = (function(){
	
		var plugin = {};
		
		plugin.create = function(params) {
			var trials = [];
			for(var i = 0; i < params.questions.length; i++)
			{
				trials.push({
					type: "survey_text",
					questions: params.questions[i]					
				});
			}			
			return trials;
		}
		
		plugin.trial = function(display_element, block, trial, part) {
		
			// add likert scale questions
			for(var i = 0; i < trial.questions.length; i++)
			{
				// create div
				display_element.append($('<div>', { "id": 'surveytext'+i, "class": 'surveyquestion'}));
				
				// add question text
				$("#surveytext"+i).append('<p class="surveytext">'+trial.questions[i]+'</p>');
				
				// add text box
				$("#surveytext"+i).append('<input type="text" name="surveyresponse'+i+'"></input>');
			}

			// add submit button
			display_element.append($('<button>', {'id':'next','class':'surveytext'}));
			$("#next").html('Submit Answers');
			$("#next").click(function(){
				// measure response time
				endTime = (new Date()).getTime();
				response_time = endTime-startTime;
				
				// create object to hold responses
				var question_data = {};
				$("div.surveyquestion").each(function(index){
					var id = "Q"+index;
					var val = $(this).children('input').val();
					var obje = {};
					obje[id] = val;
					$.extend(question_data, obje);
				});
				
				// save data
				block.data[block.trial_idx] = $.extend({},{"trial_type": "survey_text", "trial_index": block.trial_idx, "rt": response_time}, question_data, trial.data);
					
				display_element.html('');	
				
				// next trial
				block.next();
			});
			
			startTime = (new Date()).getTime();
		}		
		
		return plugin;
	})();
})(jQuery);