# jsPsych.prolific

The jsPsych.prolific module contains functions for interacting with Prolific Academic. 

---
## jsPsych.prolific.submit

```
jsPsych.prolific.submit(code)
```

### Parameters

Parameter | Type | Description
----------|------|------------
code | string | The `code` parameter is a string that will be send to Prolific Academic as the completion code for this session.

### Return value

Returns nothing.

### Description 

This method will submit a completion code to Prolific Academic, causing the session to be marked as completed. 

This method will only work when the experiment is either (1) loaded within Prolific Academic, or (2) has been loaded through the "Open Study in New Window" button on the Prolific Academic experiment page or (3) either the `study` or `study_id` URL parameter are set manually. Otherwise the study to submit to can not be identified and this method will return without any action.

### Example

#### Submit to PA after the experiment

```javascript

    jsPsych.init({
      timeline: [ /* timeline definition */ ],
      on_finish: function() {
        jsPsych.prolific.submit('MYCODE');
      }
    });

```

---

## jsPsych.prolific.info

```
jsPsych.prolific.info()
```

### Parameters

None.

### Return value

Returns an object with six properties:

* `.session` contains the session ID. This has to be attached to the experiment's URL on Prolific Academic with `sessionId={{%SESSION_ID%}}`.
* `.participant` contains the prolific ID of the participant taking part in your study. This has to be attached to the experiment's URL on Prolific Academic with `prolificId={{%PROLIFIC_PID%}}`.
* `.study` contains the study ID. This is the 24 character code given in the completion URL on Prolific Academic, in the part after `submissions/`.

### Description 

This method returns basic information about the current Prolific Academic session, including the worker ID, assignment ID, and HIT ID. prolificId={{%PROLIFIC_PID%}}&sessionId={{%SESSION_ID%}}

The `.study` property will only be set, when the experiment is either (1) loaded within Prolific Academic, or (2) loaded through the "Open Study in New Window" button on the Prolific Academic experiment page or (3) either the `study` or `study_id` URL parameter are set manually.

### Example

```javascript
    
    var prolificInfo = jsPsych.prolific.info();
    alert('Participant ID is: ' + prolificInfo.participant);
    alert('Session ID is: ' + prolificInfo.session);
    alert('Study ID is: ' + prolificInfo.study);
    
```