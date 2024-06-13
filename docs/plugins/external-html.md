# external-html

Current version: 1.1.3. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-external-html/CHANGELOG.md).

The HTML plugin displays an external HTML document (often a consent form). Either a keyboard response or a button press can be used to continue to the next trial. It allows the experimenter to check if conditions are met (such as indicating informed consent) before continuing.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter      | Type     | Default Value                | Description                              |
| -------------- | -------- | ---------------------------- | ---------------------------------------- |
| url            | string   | *undefined*                  | The URL of the page to display.          |
| cont_key       | string   | null                         | The key character the participant can use to advance to the next trial. If left as null, then the participant will not be able to advance trials using the keyboard. |
| cont_btn       | string   | null                         | The ID of a clickable element on the page. When the element is clicked, the trial will advance. |
| check_fn       | function | `function(){ return true; }` | This function is called with the jsPsych `display_element` as the only argument when the participant attempts to advance the trial. The trial will only advance if the function return `true`. This can be used to verify that the participant has correctly filled out a form before continuing, for example. |
| force_refresh  | boolean  | false                        | If `true`, then the plugin will avoid using the cached version of the HTML page to load if one exists. |
| execute_script | boolean  | false                        | If `true`, then scripts on the remote page will be executed. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name | Type    | Value                                    |
| ---- | ------- | ---------------------------------------- |
| url  | string  | The URL of the page.                     |
| rt   | numeric | The response time in milliseconds for the participant to finish the trial. |

## Simulation Mode

In `visual` simulation mode, the plugin cannot interact with any form elements on the screen other than the `cont_btn` specified in the trial parameters. If your `check_fn` requires other user interaction, for example, clicking a checkbox, then you'll need to disable simulation for the trial and complete the interaction manually.

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-external-html@1.1.3"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-external-html.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-external-html
```
```js
import externalHtml from '@jspsych/plugin-external-html';
```

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

???+ example "jsPsych code to load above page."
    === "Code"
        ```javascript
        // sample function that might be used to check if a participant has given
        // consent to participate.
        var check_consent = function(elem) {
            if (document.getElementById('consent_checkbox').checked) {
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
            type: jsPsychExternalHtml,
            url: "external_page.html",
            cont_btn: "start",
            check_fn: check_consent
        };
        ```
    === "Demo"
        <div style="text-align:center;">
            <iframe src="../../demos/jspsych-external-html-demo1.html" width="90%;" height="500px;" frameBorder="0"></iframe>
        </div>

    <a target="_blank" rel="noopener noreferrer" href="../../demos/jspsych-external-html-demo1.html">Open demo in new tab</a>
