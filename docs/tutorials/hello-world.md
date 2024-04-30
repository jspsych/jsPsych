# jsPsych "Hello world" experiment

In the long tradition of **"Hello world!"** examples, this tutorial creates an experiment that outputs the phrase "Hello world!" to the browser. Though useless as an actual experiment, the process is helpful for learning the basics of using the jsPsych library.

## Choose your own (setup) adventure

Starting with the release of version 7.0 of jsPsych there are three different ways that you can add jsPsych to your project.
Which approach you choose will depend on what your goals are.

- [**I want the simplest possible setup**](#option-1-using-cdn-hosted-scripts). This approach involves using scripts that are hosted on a CDN. You do not need to download or install anything to start using jsPsych. The limitation is that you cannot customize the library. For most experiments, this approach will be sufficient.

- [**I want to be able to do some customization, but have a simple setup.**](#option-2-download-and-host-jspsych). This approach involves downloading a bundle of scripts that make up jsPsych. _If you used jsPsych prior to version 7.0, this will feel like the most familiar approach_. Having your own copy of the scripts means that you can make modifications to the library such as tweaking plugin behavior.

- [**I want to use modern JavaScript tooling, like `npm` and `import` statements.**](#option-3-using-npm) You can install jsPsych, plugins for jsPsych, and extensions for jsPsych from NPM. This approach allows you to integrate jsPsych into your favorite JavaScript frameworks and get the benefits of TypeScript, bundlers, and more.

## Option 1: Using CDN-hosted scripts

### Step 1: Create an HTML file

!!! tip
    To edit jsPsych code you'll need a programming-friendly text editor. A great free option is [Visual Studio Code](https://code.visualstudio.com/) (Windows, OSX, Linux).

Create a new file called `experiment.html`.

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

Add the above code to the `experiment.html` file and save it. If you open the file in a web browser, you should see a blank page and the title of the page will be 'My experiment'.

### Step 2: Load the jsPsych library

To use jsPsych, add a `<script>` tag to load the library. We'll load the library from a [CDN](https://unpkg.com/), which means that the library is hosted on another server and can be loaded without having your own copy.

```html hl_lines="5"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://unpkg.com/jspsych@7.3.4"></script>
  </head>
  <body></body>
</html>
```

Note that the URL for the jsPsych library includes the version number, which ensures that the behavior of your experiment won't change with any future updates to jsPsych.

You may also want to import the jsPsych stylesheet, which applies a basic set of visual styles to the experiment. This requires adding a `<link>` tag to the `<head>` section of the document.

```html hl_lines="6"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://unpkg.com/jspsych@7.3.4"></script>
    <link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
</html>
```

### Step 3: Create a script element and initialize jsPsych

To add JavaScript code directly to the webpage we need to add a pair of `<script>` tags after the `<body>` tags.

```html hl_lines="9 10"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://unpkg.com/jspsych@7.3.4"></script>
    <link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
  <script>
  </script>
</html>
```

To initialize jsPsych we use the `initJsPsych()` function and assign the output to a new variable.

```html hl_lines="10"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://unpkg.com/jspsych@7.3.4"></script>
    <link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
  <script>
    const jsPsych = initJsPsych();
  </script>
</html>
```

### Step 4: Use a plugin to print a message

For this demo we want to show some text on the screen. This is exactly what the [html-keyboard-response plugin](../plugins/html-keyboard-response.md) is designed to do. To use the plugin, we need to load it with a `<script>` tag.

```html hl_lines="6"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://unpkg.com/jspsych@7.3.4"></script>
    <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.3"></script>
    <link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
  <script>
    const jsPsych = initJsPsych();
  </script>
</html>
```

Once the plugin is loaded we can create a trial using the plugin. To declare a trial that uses the `html-keyboard-response` plugin, we create an object with the property `type` equal to `jsPsychHtmlKeyboardResponse`. We can specify the other parameters of the plugin in the same object. Here we use the `stimulus` parameter to include a message. You can see the full set of parameters for each plugin on its [documentation page](../plugins/html-keyboard-response.md).

```html hl_lines="13 14 15 16"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://unpkg.com/jspsych@7.3.4"></script>
    <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.3"></script>
    <link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
  <script>
    const jsPsych = initJsPsych();

    const hello_trial = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: 'Hello world!'
    }
  </script>
</html>
```

### Step 5: Run the experiment

Now that we have the trial defined we need to tell jsPsych to run an experiment consisting of this trial. This requires using the `jsPsych.run` function and passing in a [timeline](../overview/timeline.md). For a simple experiment like this one, the timeline is just an array containing the list of trials to run.

```html hl_lines="18"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="https://unpkg.com/jspsych@7.3.4"></script>
    <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.3"></script>
    <link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
  <script>
    const jsPsych = initJsPsych();

    const hello_trial = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: 'Hello world!'
    }

    jsPsych.run([hello_trial]);
  </script>
</html>
```

Once you've saved the file, open it in a browser. You should see "Hello world!" printed on the screen, and if you press a key on the keyboard, the text should disappear (ending the trial).

## Option 2: Download and host jsPsych

### Step 1: Download jsPsych

Start by downloading the latest release of jsPsych. Here's a [direct link (jspsych.zip)](https://www.github.com/jspsych/jspsych/releases/latest/download/jspsych.zip). The most recent version can always be found at the top of the [GitHub releases page](https://github.com/jspsych/jsPsych/releases).
Note that even the releases that are for a particular plugin or extension will contain the full set of files needed to run jsPsych locally in the `dist archive (zip)` release asset. 
You should download the zip file for whatever the most recently released package is.
This will ensure that you have the most recent version of all the packages associated with jsPsych.

### Step 2: Create a folder to store your experiment files

Create a folder on your computer to put the experiment files in. We'll call this "MyExperiment" for the tutorial. Add a subfolder called `jspsych`. Once you've created the folder, open the downloaded archive from step 1 and copy the contents of the `dist` folder into the `jspsych` folder. It should look like this:

```
📂 MyExperiment
--  📂 jspsych
----  📄 jspsych.js
----  📄 plugin-animation.js
----  📄 plugin-audio-keyboard-response.js
----  ...
```

### Step 3: Create an HTML file

!!! tip
    To edit jsPsych code you'll need a programming-friendly text editor. A great free option is [Visual Studio Code](https://code.visualstudio.com/) (Windows, OSX, Linux).

Create a new file called `experiment.html` in the `MyExperiment` folder. The directory structure should look like this:

```
📂 MyExperiment
--  📄 experiment.html
--  📂 jspsych
```

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

Add the above code to the `experiment.html` file and save it. If you open the file in a web browser, you should see a blank page and the title of the page will be 'My experiment'.

### Step 4: Load the jsPsych library

To use jsPsych, add a `<script>` tag to load the library. Set the `src` attribute to the path to the `jspsych.js` file.

```html hl_lines="5"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="jspsych/jspsych.js"></script>
  </head>
  <body></body>
</html>
```

You may also want to import the jsPsych stylesheet, which applies a basic set of visual styles to the experiment. This requires adding a `<link>` tag to the `<head>` section of the document.

```html hl_lines="6"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="jspsych/jspsych.js"></script>
    <link href="jspsych/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
</html>
```

### Step 5: Create a script element and initialize jsPsych

To add JavaScript code directly to the webpage we need to add a pair of `<script>` tags after the `<body>` tags.

```html hl_lines="9 10"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="jspsych/jspsych.js"></script>
    <link href="jspsych/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
  <script>
  </script>
</html>
```

To initialize jsPsych we use the `initJsPsych()` function and assign the output to a new variable.

```html hl_lines="10"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="jspsych/jspsych.js"></script>
    <link href="jspsych/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
  <script>
    const jsPsych = initJsPsych();
  </script>
</html>
```

### Step 6: Use a plugin to print a message

For this demo we want to show some text on the screen. This is exactly what the [html-keyboard-response plugin](../plugins/html-keyboard-response.md) is designed to do. To use the plugin, we need to load it with a `<script>` tag.

```html hl_lines="6"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="jspsych/jspsych.js"></script>
    <script src="jspsych/plugin-html-keyboard-response.js"></script>
    <link href="jspsych/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
  <script>
    const jsPsych = initJsPsych();
  </script>
</html>
```

Once the plugin is loaded we can create a trial using the plugin. To declare a trial that uses the `html-keyboard-response` plugin, we create an object with the property `type` equal to `jsPsychHtmlKeyboardResponse`. We can specify the other parameters of the plugin in the same object. Here we use the `stimulus` parameter to include a message. You can see the full set of parameters for each plugin on its [documentation page](../plugins/html-keyboard-response.md).

```html hl_lines="13 14 15 16"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="jspsych/jspsych.js"></script>
    <script src="jspsych/plugin-html-keyboard-response.js"></script>
    <link href="jspsych/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
  <script>
    const jsPsych = initJsPsych();

    const hello_trial = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: 'Hello world!'
    }
  </script>
</html>
```

### Step 7: Run the experiment

Now that we have the trial defined we need to tell jsPsych to run an experiment consisting of this trial. This requires using the `jsPsych.run` function and passing in a [timeline](../overview/timeline.md). For a simple experiment like this one, the timeline is just an array containing the list of trials to run.

```html hl_lines="18"
<!DOCTYPE html>
<html>
  <head>
    <title>My experiment</title>
    <script src="jspsych/jspsych.js"></script>
    <script src="jspsych/plugin-html-keyboard-response.js"></script>
    <link href="jspsych/jspsych.css" rel="stylesheet" type="text/css" />
  </head>
  <body></body>
  <script>
    const jsPsych = initJsPsych();

    const hello_trial = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: 'Hello world!'
    }

    jsPsych.run([hello_trial]);
  </script>
</html>
```

Once you've saved the file, open it in a browser. You should see "Hello world!" printed on the screen, and if you press a key on the keyboard, the text should disappear (ending the trial).

## Option 3: Using NPM

If you are electing to use `npm` to install jsPsych we will assume that you already are familiar with Node.js and generally know what you are doing with web development.
We will also assume that you are using a [webpack](https://webpack.js.org/) or a similar bundler.

!!! info
    You may want to check out the [jsPsych Builder](https://github.com/bjoluc/jspsych-builder) CLI utility.
    jsPsych Builder allows you to automate the experiment setup, spin up a development server, and transpile and bundle scripts and styles using webpack.
    Using jsPsych Builder will automate some of the steps in this tutorial, so if you prefer that option, you may want to switch to the getting started instructions on the jsPsych Builder GitHub page.

### Step 1: Install jspsych

Run `npm install jspsych`.

This installs the core jsPsych package.
Plugins and extensions are installed separately.

### Step 2: Import the `initJsPsych` function and create a new `JsPsych` instance

We create a new instance of the `JsPsych` class by calling `initJsPsych`.
The instance can optionally be configured via [a variety of options](../reference/jspsych.md#initjspsych), passed as an object to `initJsPsych`.

```js
import {initJsPsych} from 'jspsych';

const jsPsych = initJsPsych();
```

### Step 3: Static markup and CSS

jsPsych requires nothing but a body element in your HTML document.
For the jsPsych stylesheet, depending on your bundler setup, you can either directly `import 'jspsych/css/jspsych.css'` into your JavaScript file or add a link tag (like `<link href="path/to/jspsych.css" rel="stylesheet" type="text/css" />`) to your HTML document's head.

### Step 4: Install and import a plugin

Install the `html-keyboard-response` plugin with:

`npm install @jspsych/plugin-html-keyboard-response`

Then import the `htmlKeyboardResponse` plugin class.

```js
import {initJsPsych} from 'jspsych';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

const jsPsych = initJsPsych();
```

### Step 5: Create a trial

Once the plugin is imported we can create a trial using the plugin.
To declare a trial that uses the `html-keyboard-response` plugin, we create an object with the property `type` equal to `htmlKeyboardResponse`.
We can specify the other parameters of the plugin in the same object.
Here we use the `stimulus` parameter to include a message.
You can see the full set of parameters for each plugin on its [documentation page](../plugins/html-keyboard-response.md).

```js
import {initJsPsych} from 'jspsych';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

const jsPsych = initJsPsych();

const trial = {
  type: htmlKeyboardResponse,
  stimulus: 'Hello world!',
}
```

### Step 6: Run

Now that we have the trial defined we need to tell jsPsych to run an experiment consisting of this trial. This requires using the `jsPsych.run` function and passing in a [timeline](../overview/timeline.md). For a simple experiment like this one, the timeline is just an array containing the list of trials to run.

```js
import {initJsPsych} from 'jspsych';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

const jsPsych = initJsPsych();

const trial = {
  type: htmlKeyboardResponse,
  stimulus: 'Hello world!',
}

jsPsych.run([trial]);
```
