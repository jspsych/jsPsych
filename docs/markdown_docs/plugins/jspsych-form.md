# jspsych-form plugin

The form plugin displays a form element from either the same document or loads it from a different url. After submission all form fields are stored within the trial's data.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
url | string | '' | The URL of the file to read form from. If empty, form is read from current document.
container | string | *undefined* | DOM selector for the element holding the form. The contents of the first selected element will be displayed. The first form element found will be activated for the trial.
load_fn | function | `function(html){ return html; }` | Form load callback. Given the html string of the form to load. Return the modified html string to be used by the plugin. Can be used for templating.
check_fn | function | `function(){ return true; }` | Form validation callback. Given the trial_data object with all form values and the form node as arguments. Return true to finish trial, return false to cancel.
force_refresh | boolean | false | Force to load the file from the server again by appending a current timestamp to the url.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
url | string | The URL of the file the form has been read from.
container | string | The DOM selector the form has been selected with.
rt | numeric | The response time in milliseconds for the subject to finish the trial.

Additionally every `input` (except `type=file`), `select`, `textarea` and `button` element in the form is added, if both the element's `name` is set and response value has been given.

## Examples

### Loading a consent form from external file

##### This content would be in a file called 'external_page.html'
```html
<div id="consent">
  <form>
    <p>
      This is a demo experiment, with this minimal consent form being loaded
      as an external html document. To continue, click the checkbox below
      and hit "Start Experiment".
    </p>
    <p>
      <input type="checkbox" id="consent_checkbox" name="consent_given" value="yes" />
      I agree to take part in this study.
    </p>
    <button type="submit" id="start">Start Experiment</button>
  </form>
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

// declare the trial.
var trial = {
  type: 'form',
  url: 'external_page.html',
  container: '#consent',
  check_fn: check_consent
};
```

### Loading a form from within the same document, using a template

```html
<!-- storing html snippets in <script type="text/html"> elements is a good way to keep the code in the same document, while not having the snippet active in the DOM all the time. -->
<script type="text/html" id="form-template-age">
  <form>
    <!-- Unfortunately, the required attribute doesn't work in Safari. -->
    <label>How old are you, {{name}}? <input type="numeric" min="1" max="110" name="age" required /></label><br/>
    <button type="submit">Next</button>
  </form>
</script>
```

```javascript
// declare the trial.
var trial = {
  type: 'form',
  container: '#form-template-age',
  // This is just a simple replacement. Better templating could be done with libraries, such as MustacheJS, for example: https://github.com/janl/mustache.js
  load_fn: function(html) { return html.replace('{{name}}', 'Bob'); }
};
```