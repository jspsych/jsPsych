# jsPsych Modularization

## Part 1: Creating a blank experiment

Follow steps in the [Hello World tutorial](../tutorials/hello-world.md). At the end of the Hello World tutorial, you should have an experiment page that looks like this:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My experiment</title>
        <script src="jspsych-6.0.5/jspsych.js"></script>
        <script src="jspsych-6.0.5/plugins/jspsych-html-keyboard-response.js"></script>
        <link href="jspsych-6.0.5/css/jspsych.css" rel="stylesheet" type="text/css"></link>
    </head>
    <body></body>
    <script>

    var hello_trial = {
        type: 'html-keyboard-response',
        stimulus: 'Hello world!'
    }

    jsPsych.init({
        timeline: [hello_trial]
    })

    </script>
</html>
```

## Part 2: Modify plugins

In `jspsych-html-keyboard-response.js`:

Import jsPsych at the top: `import jsPsych from '../jspsych.js';` 

Change `jsPsych.plugins["html-keyboard-response"]` to `const htmlKeyboardResponse`

Export the plugin at the end: `export default htmlKeyboardResponse`

## Part 3: Modify html

Remove `<script src="jspsych-6.1.0/jspsych.js"></script>` and `<script src="jspsych-6.1.0/plugins/jspsych-html-keyboard-response.js"></script>` in `experiment.html`

In the `<scirpt>` tag below, add an attribute `type="module"`. Import jsPsych and htmlKeyboardResponse plugin in the script tag, the `experiment.html` now should look like this:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My experiment</title>
        <link href="jspsych-6.1.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
    </head>
    <body></body>
    <script type="module">
        import jsPsych from './jspsych-6.1.0/jspsych.js';
        import htmlKeyboardResponse from './jspsych-6.1.0/plugins/jspsych-html-keyboard-response.js'

        var hello_trial = {
            type: htmlKeyboardResponse,
            stimulus: 'Hello world!'
        }

        jsPsych.init({
            timeline: [hello_trial]
        })
    </script>
</html>
```

Alternatively:

You can create a file `experiment.js` and move the code wrapped in the script tag, change the script tag in `experiment.html` by adding a src attribute: `<script src="experiment.js" type="module></script>`

## Part 4: Local testing

To get rid of the CORS block in some browsers, you have to setup a static server.

Make sure [Node.js](https://nodejs.org/en/) is installed.

Run `npm i -g serve`

Under to the project directory, run `serve ./`

Go to `http://localhost:5000/` and open `experiment.html`

And you should see the experiment running.