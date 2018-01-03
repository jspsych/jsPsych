# jspsych-external-html plugin

The HTML plugin displays an external HTML document (often a consent form). Either a keyboard response or a button press can be used to continue to the next trial. It allows the experimenter to check if conditions are met (such as indicating informed consent) before continuing.

## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
url | string | *undefined* | The URL of the page to display.
cont_key | numeric | null | The key code a key to advance to the next trial. If left as null, then the subject will not be able to advance trials using the keyboard.
cont_btn | string | null | The ID of a clickable element on the page. When the element is clicked, the trial will advance.
check_fn | function | `function(){ return true; }` | This function is called with the jsPsych `display_element` as the only argument when the subject attempts to advance the trial. The trial will only advance if the function return `true`. This can be used to verify that the subject has correctly filled out a form before continuing, for example.
force_refresh | boolean | false | If `true`, then the plugin will avoid using the cached version of the HTML page to load if one exists.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
url | string | The URL of the page.
rt | numeric | The response time in milliseconds for the subject to finish the trial.

## Examples

### Loading a consent form

##### This content would be in a file called 'external_page.html'
```html
<div id="consent">
  <p>
    This is a demo experiment, with this minimal consent form being loaded
    as an external html document. To continue, click the checkbox below
    and hit "Start Experiment".
  </p>
  <p>
    <input type="checkbox" id="consent_checkbox" />
    I agree to take part in this study.
  </p>
  <button type="button" id="start">Start Experiment</button>
</div>
```

##### jsPsych code to load above page.
```javascript
// sample function that might be used to check if a subject has given
// consent to participate.
var check_consent = function(elem) {
  if ($('#consent_checkbox').is(':checked')) {
    return true;
  }
  else {
    alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
    return false;
  }
  return false;
};


// declare the block.
var trial = {
  type:'external-html',
  url: "external_page.html",
  cont_btn: "start",
  check_fn: check_consent
};
```
