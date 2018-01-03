# jsPsych.turk

The jsPsych.turk module contains functions for interacting with Mechanical Turk. 

---
## jsPsych.turk.submitToTurk

```
jsPsych.turk.submitToTurk(data)
```

### Parameters

Parameter | Type | Description
----------|------|------------
data | object | The `data` parameter is an object of `key: value` pairs. Any pairs in the `data` parameter will be saved by Mechanical Turk, and can be downloaded in a CSV file through the Mechanical Turk interface.

### Return value

Returns nothing.

### Description 

This method will submit a HIT to Mechanical Turk, causing the HIT to finish. 

This method will only work when called from within the mechanical turk website. If you are using an external HIT to send workers to your own server, this method will not work on an externally hosted page. It will work if your external content is loaded in the iframe on the Mechanical Turk website.

### Example

```html

<p>Enter the code you were given:</p>
<input type="text" id="code"></input>
<button onclick="sendData();">Submit HIT</button>

<script>
// this content must be loaded in the iframe on the mechanical turk website.
// usually, this means that the content is part of your 'recruitment ad', the
// page the workers can see when they are deciding whether or not to accept a HIT.
// one option is to include a simple form on this page that workers submit, with a
// special code that they get at the end of the experiment.

function sendData() {
  jsPsych.turk.submitToTurk({
    code: document.getElementById('code').value
  });
}
</script>
```

---

## jsPsych.turk.turkInfo

```
jsPsych.turk.turkInfo()
```

### Parameters

None.

### Return value

Returns an object with six properties:

* `.assignmentId` contains the assignment ID string of the HIT.
* `.hitId` contains the HIT ID.
* `.workerId` contains the worker ID of the worker completing the HIT.
* `.turkSubmitTo` contains the URL for submitting the HIT. This parameter is used in the `jsPsych.turk.submitToTurk` method, and is probably not useful outside of that context.
* `.previewMode` is a boolean value indicating whether or not the worker has accepted the HIT yet. If the page is viewed inside Mechancial Turk and the worker has not clicked 'Accept HIT' then this will be true. If the page is viewed outside Mechanical Turk or the worker has acccepted the HIT, then it will be false.
* `.outsideTurk` is a boolean value indicating if the page is being viewed within Mechanical Turk, or if it is being viewed from another source (e.g., someone directly going to the page URL instead of going through mturk).

### Description 

This method returns basic information about the current Mechanical Turk session, including the worker ID, assignment ID, and HIT ID.

### Example

```javascript

var turkInfo = jsPsych.turk.turkInfo();

alert('Worker ID is: ' + turkInfo.workerId);

alert('Assignment ID is: ' + turkInfo.assignmentId);

alert('HIT ID is: ' + turkInfo.hitId);

// true if the page is viewed within Mechanical Turk, 
// but worker has not accepted the HIT yet.
// false if the page is viewed outside Mechanical Turk,
// OR the worker has accepted the HIT.
alert('Preview mode? ' + turkInfo.previewMode); 

// true if the page is viewed outside mechanical turk,
// false otherwise.
alert('Outside turk? ' + turkInfo.outsideTurk);
```



