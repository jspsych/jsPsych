# *jspsych-cloze

This plugin displays a text with certain words removed. Participants are asked to replace the missing items. Responses are recorded when clicking a button. Optionally, responses are evaluated and a function is called in case of differences, making it possible to inform participants about mistakes.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter     | Type     | Default Value      | Description                              |
| ------------- | -------- | ------------------ | ---------------------------------------- |
| text          | string   | *undefined*        | The cloze text to be displayed. Blanks are indicated by %% signs and automatically replaced by input fields. If there is a correct answer you want the system to check against, it must be typed between the two percentage signs (i.e. % correct solution %). |
| button_text   | string   | OK                 | Text of the button participants have to press for finishing the cloze test. |
| check_answers | boolean  | false              | Boolean value indicating if the answers given by participants should be compared against a correct solution given in the text (between % signs) after the button was clicked. If ```true```, answers are checked and in case of differences, the ```mistake_fn``` is called. In this case, the trial does not automatically finish. If ```false```, no checks are performed and the trial automatically ends when clicking the button. |
| mistake_fn    | function | ```function(){}``` | Function called if ```check_answers``` is set to ```true``` and there is a difference between the participants answers and the correct solution provided in the text. |

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name     | Type             | Value                       |
| -------- | ---------------- | --------------------------- |
| response | array of strings | Answers the partcipant gave |

## Examples

#### Simple cloze using default settings (no check against correct solution, no custom button text)

```javascript
var trial = {
	type: 'cloze',
	text: 'The %% is the largest terrestrial mammal. It lives in both %% and %%.'
};
```

#### More elaborate example (with check against correct solution, custom error handling and modified button text)

```javascript
var trial = {
    type: 'cloze',
    text: 'A rectangle has % 4 % corners and a triangle has % 3 %.',
    check_answers: true,
    button_text: 'Next',
    mistake_fn: function(){alert("Wrong answer. Please check again.")}
};
```