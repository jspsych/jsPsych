# jsPsych "Hello world" experiment

In the long tradition of **"Hello world!"** examples, this tutorial creates an experiment that outputs the phrase "Hello world!" to the browser. Though useless as an actual experiment, the process is helpful for learning the basics of using the jsPsych library. This tutorial will assume that you know very little about how to set up a web page.

## Step 1: Download the jsPsych library

Start by downloading the jsPsych library. The most recent version can always be found on the [GitHub releases page](https://github.com/jodeleeuw/jsPsych/releases).

*Note: the image below shows version 4.2, but the process is the same for the most recent version.*

![releasespage](/img/githubreleases.jpg)

## Step 2: Create a folder to store your experiment files

Create a folder on your computer to put the experiment files in. Once you've created the folder, open the downloaded archive from step 1, and move the extracted folder (called `jspsych-7.0.0` if using v7.0.0 of jsPsych) into the experiment folder. Here's what it looks like on a Windows machine:

![folder setup](/img/folder-setup.png)

## Step 3: Create a new HTML file

To edit jsPsych code you'll need a programming-friendly text editor. Some free options are:

* [Atom](https://atom.io) (Windows, OSX, Linux)
* [VSCode](https://code.visualstudio.com/) (Windows, OSX, Linux)

Once you've got a text editor that you like, create two new files in the experiment folder called `experiment.html` and `experiment.js`

![folder setup](/img/folder-with-html.png)

## Step 4: Add the bare-minimum HTML code

There's some basic code that (nearly) all HTML documents have in common. Here's a typical bare-bones HTML document.

```html
<!DOCTYPE html>
<html>
	<head>
		<title>My experiment</title>
	</head>
	<body></body>
</html>
```

Add the above code to the `experiment.html` file and save it. If you then open the file in a web browser, you should see a blank page and the title of the page will be 'My experiment'.

## Step 5: Setup experiment:

To use jsPsych, import the library at the top in `experiment.js`: `import jsPsych from './jspsych-7.0.0/jspsych.js'`;

For the demo, we want to show some text on the screen. This is exactly what the [jspsych-html-keyboard-response plugin](../plugins/jspsych-html-keyboard-response.md) is designed to do.

To use the plugin, we need to import it in `experiment.js` as well: `import htmlKeyboardResponse from './jspsych-7.0.0/plugins/jspsych-html-keyboard-response.js'`

Once the plugin is loaded, we can create an experiment using the plugin. To declare a trial that uses the html-keyboard-response plugin, we create a JavaScript object with the property `type` equal to `'html-keyboard-response'`. Then we can specify the other parameters of the plugin in the same object.

```javascript
var hello_trial = {
		type: 'html-keyboard-response',
		stimulus: 'Hello world!'
	}
```

Now that we have the trial defined we just need to tell jsPsych to run an experiment consisting of this trial. This requires using the `jsPsych.init` function and specifying the `timeline` parameter.

```javascript
jsPsych.init({
		timeline: [hello_trial]
	})
```

Your `experiment.js` should look like this:
```javascript
	import jsPsych from './jspsych-7.0.0/jspsych.js';
	import htmlKeyboardResponse from './jspsych-7.0.0/plugins/jspsych-html-keyboard-response.js'

	var hello_trial = {
		type: htmlKeyboardResponse,
		stimulus: 'Hello world!'
	}

	jsPsych.init({
		timeline: [hello_trial]
	})
```

## Step 6: Modify the html file
To include the experiment in the html file, add a `<script>` tag with attribute `type="module"` and `src="experiment.js"`. You may also want to import the jsPsych stylesheet, which applies a basic set of visual styles to the experiment to make it visually pleasing. This requires adding a `<link>` tag to the `<head>` section of the document.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My experiment</title>
        <link href="jspsych-7.0.0/css/jspsych.css" rel="stylesheet" type="text/css"></link>
    </head>
    <body></body>
    <script type="module" src="experiment.js"></script>
</html>
```

## Step 7: Local testing

To get rid of the CORS block in some browsers, you have to setup a static server.

* Make sure [Node.js](https://nodejs.org/en/) is installed.

In the console of the IDE you are using (visual studio code, Atom etc.), or open up a terminal and `cd` to your project directory, run `npm i -g serve` to install the npm package 'serve' globally. 

Assuming you would like to serve a static site, single page application or just a static file (no matter if on your device or on the local network), this package is just the right choice for you.

After installing, run `serve ./` in the console. Open your browser and go to `http://localhost:8000/` (depends on the port which is served, you could see it in console). 

Open experiment.html, you should see "Hello world!" printed on the screen, and if you press a key on the keyboard, the text should disappear (ending the trial).