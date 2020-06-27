/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of images
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */
 
jsPsych.plugins['my-free-sort'] = (function() {

    var plugin = {};
  
      plugin.info = {
      name: 'my-free-sort',
      description: '',
        parameters: {
        stimuli: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Stimuli',
          default: undefined,
          array: true,
          description: 'Word to be displayed.'
        },
        list_length: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'List Length',
          default: null,
          description: 'The implicit number of slots for items',
        },
        prompt: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Prompt',
          default: null,
          description: 'It can be used to provide a reminder about the action the subject is supposed to take.'
        },
        prompt_location: {
          type: jsPsych.plugins.parameterType.SELECT,
          pretty_name: 'Prompt location',
          options: ['above','below'],
          default: 'above',
          description: 'Indicates whether to show prompt "above" or "below" the sorting area.'
        },
        button_label: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Button label',
          default:  'Submit',
          description: 'The text that appears on the button to continue to the next trial.'
        }
      }
    }
  
    plugin.trial = function(display_element, trial) {
  
      /*-----------------------------------------Creating the Environment-----------------------------------------*/
      var time_elapsed = jsPsych.totalTime();
      var start_time = performance.now(); //time elapsed since origin (window-load)
      var html = "";
      var coords = 40;
      
      // check if prompt exists above arena
      if (trial.prompt !== null && trial.prompt_location == "above") {
        html += trial.prompt;
      }
  
      if (trial.list_length == null) {
          trial.list_length = trial.stimuli.length;
      }
  
      var sort_width = document.documentElement.clientWidth*.92;
      var sort_height = document.documentElement.clientHeight*.92;
  
      var stim_width = .2*(sort_width);
      var stim_height = .8*(sort_height / trial.list_length);
      var padding = .2*(sort_height / trial.list_length);

      var offset = 3;
  
      //creating the arena (div defining drag boundary)
      html += '<div '+
        'id="jspsych-free-sort-arena" '+
        'class="jspsych-free-sort-arena" '+
        'style="position: relative; width:'+sort_width+'px; height:'+sort_height+'px; border:2px solid #444;"'+
        '></div>';
      var arena = display_element.querySelector("#jspsych-free-sort-arena");  
      
      // check if prompt exists below arena
      if (trial.prompt !== null && trial.prompt_location == "below") {
        html += trial.prompt;
      } 
      
      //draw
      display_element.innerHTML = html; 
  
      //create draggable-word-elements
      for (var i = 0; i < trial.stimuli.length; i++) { 
        var top_coord = i*stim_height + (i+.5)*padding;
        display_element.querySelector("#jspsych-free-sort-arena").innerHTML += '<div ' + 
        'class="jspsych-free-sort-draggable" '+
        'draggable="false" '+
        'data-snapped=-1 ' +
        'data-id='+ i + ' ' +
        'style="position: absolute; ' +
        'display: flex; justify-content: center; ' +
        'align-items: center; text-align: center; ' +
        'vertical-align: middle; cursor: move; width:' + stim_width + 'px; ' +
        'height:' + stim_height + 'px; left:' + stim_width + 'px; ' + 
        'top:' + top_coord + 'px;">' + trial.stimuli[i] + //adding word
        '</div>';
      }
      
      //list of initial word locations
      var init_locations = [];
      var dragItems = display_element.querySelectorAll('.jspsych-free-sort-draggable')
      for(var i = 0; i < trial.stimuli.length; i++) { 
        init_locations.push({ 
          'word': dragItems[i].innerHTML, 
          "x": parseInt(dragItems[i].style.left), 
          "y": parseInt(dragItems[i].style.top) 
        });
      }
  
      //targets for draggables
      for (var i = 0; i < trial.stimuli.length; i++) { 
          var top_coord = i*stim_height + (i+.5)*padding;
          display_element.querySelector('#jspsych-free-sort-arena').innerHTML +='<div '+
          'id="jspsych-target" '+
          'class="jspsych-target" '+
          'data-filled=-1 ' +
          'data-id=' + i + ' ' +
          'style="position: absolute; ' +
          'width:' + stim_width + 'px; ' +
          'height:'  + stim_height + 'px; ' +
          'top: '+ top_coord +'px; ' +
          'left: '+ offset*stim_width +'px;  ' +
          'border:2px solid red; margin:0px;"'+
          '></div>';
      }
      
      display_element.innerHTML += '<button id="jspsych-free-sort-done-btn" class="jspsych-btn">'+trial.button_label+'</button>'; 
      
      var maxz = 1; //used to resolve overlapping issues
      var draggables = display_element.querySelectorAll('.jspsych-free-sort-draggable'); 
      var targets = display_element.querySelectorAll('.jspsych-target'); 
      var RTs = []; //list for storing time data
  
      //reposition the clicked elem 
      for(var i=0;i<draggables.length; i++){
        draggables[i].addEventListener('mousedown', function(event) {  //listener for when mouse is clicked over element
  
          var x = event.clientX - event.currentTarget.offsetLeft; // click to elem left. (click x-coord from page left) - (div left to parent (arena) left)
          var y = event.clientY - event.currentTarget.offsetTop; // click to elem top. (click y-coord from page top) - (div top to parent (arena) top)
          var elem = event.currentTarget; 
  
          // FIXME: shouldn't be an issue, but could overflow. No need to have infinitely incrementing z stack
          elem.style.zIndex = ++maxz; //ensures elem currently being dragged is granted stacking priority in a case of overlap
  
          RTs.push({
            'word': elem.innerHTML,
            'time': performance.now()-start_time,
            'target': elem.dataset.snapped,
            'mode': 'leaving',
          })
  
          if(elem.dataset.snapped != -1) {
            var ind = elem.dataset.snapped;
            targets[ind].style.borderColor = 'red';
            targets[ind].dataset.filled = -1;
            elem.dataset.snapped = -1;
          }
  
          // repos elem by dist from left of arena (x) and dist from top of arena (y) 
          // lowest of nums: either (arena height - elem height) or the larger of 0 or (dist from click (x,y coord) to top of currently viewable window - click to elem corner/top)
          // seemingly, these do the same thing (click to window top - click to elem top = elem top to window top) and (arena height-elem height = dist from elem to arena y coord)
          var mousemoveevent = function(e) { 
            elem.style.top =  Math.max(1, Math.min(sort_height - stim_height, (e.clientY - y))) + 'px';  
            elem.style.left = Math.max(1, Math.min(sort_width - stim_width, (e.clientX - x))) + 'px';
          }
          document.addEventListener('mousemove', mousemoveevent); //add mouse-move post click listener to doc. func (above) positions elem according to mouse move
  
          var mouseleaveevent = function(e) {
              elem.removeEventListener('mouseup', mouseupevent);
              document.removeEventListener('mousemove', mousemoveevent);
              
              var ind = e.currentTarget.dataset.id;
              e.currentTarget.style.left = (init_locations[ind].x+'px'); 
              e.currentTarget.style.top = (init_locations[ind].y+'px');
  
              //event times for case
              var end_t = performance.now()
              RTs.push({
                'word': e.currentTarget.innerHTML,
                'time': end_t-start_time,
                'target': -1,
                'mode': 'dropped',
              })         
  
              display_element.querySelector("#jspsych-free-sort-arena").removeEventListener('mouseleave', mouseleaveevent);
          }
          display_element.querySelector('#jspsych-free-sort-arena').addEventListener('mouseleave', mouseleaveevent);
          
          var mouseupevent = function(e){ //when click ends, end movement listener (so elem stays where it is) and add data to 'moves' object in data. finally, end self
            document.removeEventListener('mousemove', mousemoveevent); 
            display_element.querySelector("#jspsych-free-sort-arena").removeEventListener('mouseleave', mouseleaveevent);
          
            for(var j=0; j<targets.length; j++){ 
              // TODO: funcify
              var in_target = false;
              if(e.clientX - parseInt(e.currentTarget.parentNode.offsetLeft) >= parseInt(targets[j].style.left)
                  && e.clientX - parseInt(e.currentTarget.parentNode.offsetLeft) <= parseInt(targets[j].style.left) + stim_width 
                  && e.clientY - parseInt(e.currentTarget.parentNode.offsetTop) >= parseInt(targets[j].style.top) 
                  && e.clientY - parseInt(e.currentTarget.parentNode.offsetTop) <= parseInt(targets[j].style.top) + stim_height) {
                in_target = true;
              }
  
              var target_empty = targets[j].dataset.filled == -1;
              
              //Case: elem is in range and target hasn't been snapped ==> snap to (assume) target's position
              if(in_target && target_empty){ 
                e.currentTarget.style.left = (parseInt(targets[j].style.left) + offset)+'px'; 
                e.currentTarget.style.top = (parseInt(targets[j].style.top) + offset)+'px'; 
  
                targets[j].style.borderColor = 'lightblue';
                targets[j].dataset.filled = e.currentTarget.dataset.id;
                e.currentTarget.dataset.snapped = targets[j].dataset.id;
  
                var end_t = performance.now(); 
                  
                //collecting event times for case
                RTs.push({
                  'word': e.currentTarget.innerHTML,
                  'time': end_t-start_time,
                  'target': j,
                  'mode': 'entering',
                }) 
                e.currentTarget.removeEventListener('mouseup', mouseupevent);
                return;
              }
              //Case: elem is in range and target has been snapped ==> return to default position
              else if (in_target && !target_empty){  
                var ind = e.currentTarget.dataset.id;
                e.currentTarget.style.left = (init_locations[ind].x+'px'); 
                e.currentTarget.style.top = (init_locations[ind].y+'px');
  
                //event times for case
                var end_t = performance.now()
                RTs.push({
                  'word': e.currentTarget.innerHTML,
                  'time': end_t-start_time,
                  'target': j,
                  'mode': 'full',
                })         
                e.currentTarget.removeEventListener('mouseup', mouseupevent);
                return;
              }
            }  
  
            var ind = e.currentTarget.dataset.id;
            e.currentTarget.style.left = (init_locations[ind].x+'px'); 
            e.currentTarget.style.top = (init_locations[ind].y+'px');
  
            //event times for case
            var end_t = performance.now()
            RTs.push({
              'word': e.currentTarget.innerHTML,
              'time': end_t-start_time,
              'target': -1,
              'mode': 'missed',
            })         
            e.currentTarget.removeEventListener('mouseup', mouseupevent);
          }
          elem.addEventListener('mouseup', mouseupevent); //add click-finish listener to doc  
        });
      }
  
      /*-----------------------------------------Continue Button: Ending the Experiment-----------------------------------------*/
  
      //continue button ends experiment, but only if all the boxes have been filled
      display_element.querySelector('#jspsych-free-sort-done-btn').addEventListener('click', function(){ 
  
        for(z=0;z<targets.length;z++){ 
          if(targets[z].style.borderColor != 'lightblue'){
            alert("fill all the boxes before pressing " + trial.button_label + "!");
            return;
          }
        };
          
        var end_time = performance.now();
        var final_locations = [];
        var matches = display_element.querySelectorAll('.jspsych-free-sort-draggable');
        for(var i=0; i<matches.length; i++){
          final_locations.push({
            "word": matches[i].innerHTML, 
            "x": parseInt(matches[i].style.left), //elem left side to parent (arena) left side: string to int
            "y": parseInt(matches[i].style.top) 
          });
        }
        
        //sort words by y value. a and b are two adjacent final_location object-literals, compared by their y values. sort_locs = comparison function.
        function sort_locs(a,b){
          return a.y > b.y ? 1 : b.y > a.y ? -1 : 0; 
        }
        final_locations.sort(sort_locs);
        
        //display original word order alongside new word order for easy order comparison
        original_wordorder = [];
        recalled_wordorder = [];
        for(var i=0; i<matches.length; i++){
          original_wordorder.push(trial.stimuli[i]); // init_locations[i].word);
          recalled_wordorder.push(final_locations[i].word);
        }
  
        //categorizing dataset by whether word was... 
  
        //JSON data object
        var trial_data = { 
          "init_locations": init_locations,
          "final_locations": final_locations,
          "original_wordorder": original_wordorder,
          "final_wordorder": recalled_wordorder,
          "drag_events": RTs,
          "start_time": time_elapsed
        }; 
  
        // advance to next part
        display_element.innerHTML = '';
        jsPsych.finishTrial(trial_data);
      });
    };
    return plugin;
  })();
