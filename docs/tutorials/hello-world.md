# jsPsych "Hello world" experiment

In the long tradition of **"Hello world!"** examples, this tutorial creates an experiment that outputs the phrase "Hello world!" to the browser. Though useless as an actual experiment, the process is helpful for learning the basics of using the jsPsych library. This tutorial will assume that you know very little about how to set up a web page.

## Step 1: Download the jsPsych library

Start by downloading the jsPsych library. The most recent version can always be found on the [GitHub releases page](https://github.com/jodeleeuw/jsPsych/releases).

*Note: the image below shows version 4.2, but the process is the same for the most recent version.*

![releasespage](/img/githubreleases.jpg)

## Step 2: Create a folder to store your experiment files

Create a folder on your computer to put the experiment files in. Once you've created the folder, open the downloaded archive from step 1, and move the extracted folder (called `jspsych-6.0.3` if using v6.0.3 of jsPsych) into the experiment folder. Here's what it looks like on a Windows machine:

![folder setup](/img/folder-setup.png)

## Step 3: Create a new HTML file

To edit jsPsych code you'll need a programming-friendly text editor. Some free options are:

* [Atom](https://atom.io) (Windows, OSX, Linux)
* [Notepad++](http://notepad-plus-plus.org/) (Windows)
* [TextMate](http://macromates.com/) (OSX)

Once you've got a text editor that you like, create a new file in the experiment folder called `experiment.html`

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

Add the above code to the experiment.html file and save it. If you then open the file in a web browser, you should see a blank page and the title of the page will be 'My experiment'.

## Step 5: Import the jsPsych library

To use jsPsych, add a `<script>` tag to import the library.

```html
<!DOCTYPE html>
<html>
	<head>
		<title>My experiment</title>
		<script src="jspsych-6.0.3/jspsych.js"></script>
	</head>
	<body></body>
</html>
```

You may also want to import the jsPsych stylesheet, which applies a basic set of visual styles to the experiment to make it visually pleasing. This requires adding a `<link>` tag to the `<head>` section of the document.

```html
<!DOCTYPE html>
<html>
	<head>
		<title>My experiment</title>
		<script src="jspsych-6.0.3/jspsych.js"></script>
		<link href="jspsych-6.0.3/css/jspsych.css" rel="stylesheet" type="text/css"></link>
	</head>
	<body></body>
</html>
```

## Step 6: Use the jspsych-html-keyboard-response plugin to print a message

For the demo, we want to show some text on the screen. This is exactly what the [jspsych-html-keyboard-response plugin](../plugins/jspsych-html-keyboard-response.md) is designed to do. To use the plugin, we need to load it with a `<script>` tag.

```html
<!DOCTYPE html>
<html>
	<head>
		<title>My experiment</title>
		<script src="jspsych-6.0.3/jspsych.js"></script>
		<script src="jspsych-6.0.3/plugins/jspsych-html-keyboard-response.js"></script>
		<link href="jspsych-6.0.3/css/jspsych.css" rel="stylesheet" type="text/css"></link>
	</head>
	<body></body>
</html>
```

Once the plugin is loaded, we can create an experiment using the plugin. To declare a trial that uses the html-keyboard-response plugin, we create a JavaScript object with the property `type` equal to `'html-keyboard-response'`. Then we can specify the other parameters of the plugin in the same object.

To add JavaScript code directly to the webpage we need to add a set of `<script>` tags after the `<body>` tags.

```html
<!DOCTYPE html>
<html>
	<head>
		<title>My experiment</title>
		<script src="jspsych-6.0.3/jspsych.js"></script>
		<script src="jspsych-6.0.3/plugins/jspsych-html-keyboard-response.js"></script>
		<link href="jspsych-6.0.3/css/jspsych.css" rel="stylesheet" type="text/css"></link>
	</head>
	<body></body>
	<script>

	var hello_trial = {
		type: 'html-keyboard-response',
		stimulus: 'Hello world!'
	}

	</script>
</html>
```

Now that we have the trial defined we just need to tell jsPsych to run an experiment consisting of this trial. This requires using the `jsPsych.init` function and specifying the `timeline` parameter.

```html
<!DOCTYPE html>
<html>
	<head>
		<title>My experiment</title>
		<script src="jspsych-6.0.3/jspsych.js"></script>
		<script src="jspsych-6.0.3/plugins/jspsych-html-keyboard-response.js"></script>
		<link href="jspsych-6.0.3/css/jspsych.css" rel="stylesheet" type="text/css"></link>
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

Once you've saved the file, open it in a browser. You should see "Hello world!" printed on the screen, and if you press a key on the keyboard, the text should disappear (ending the trial).
