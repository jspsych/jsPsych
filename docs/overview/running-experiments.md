# Running Experiments

You can run your jsPsych experiment:

**Offline**, by opening the HTML file directly in the browser using the `file://` protocol.

**Online**, by hosting the files on a web server using the `http://` or `https://` protocol.

The way that you run your experiment will have consequences for certain aspects about how the experiment works, and what your experiment will be able to do. This page explains what you need to know about both of these options.

!!! info
    If you are looking for a tool to automate deployment-related tasks, check out the [jsPsych Builder](https://github.com/bjoluc/jspsych-builder) CLI utility.
    It automatically bundles scripts and style sheets, configures media preloading, and yields a zip file that contains all files for deployment (online or offline).
    jsPsych Builder can also directly build JATOS experiment files (.jzip) that you can upload to a JATOS server (see [this section](#hosting-the-experiment-and-saving-the-data) below for more info about JATOS and other server options).

## Offline

You can run your jsPsych experiment offline by opening the HTML file directly in a web browser, for instance by double-clicking on it. This uses the `file://` protocol. It's usually the fastest and easiest way to run through an experiment, and is very useful while writing and testing the code. 

At some point you will need to move your experiment files onto a server and send the data to a database, since this is how you will ultimately collect the data (unless you're planning to collect data on your local computer). There are some important differences between the way the experiment runs offline compared to online via a web server. 

Note that, unless noted, here we're using the word "server" to mean either a _local_ server (which runs on your computer and only makes the experiment files available from within that computer, and is often used during development), or a _remote_ server (which does not run on your computer and does share your experiment files over the internet).

### Cross-origin requests (CORS) and safe mode

Web browsers have a security policy called [cross-origin resource sharing (CORS)](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) that determines whether the webpage can request files that come from a different origin (i.e. protocol, host/domain, and port). This isn't a problem when your study runs _online_, because in that case your experiment files all have the same origin. However, when you run your experiment _offline_, the CORS policy blocks some jsPsych features that require [loading local files](https://security.stackexchange.com/questions/190266/why-chrome-blocks-ajax-locally/190321#190321). If your experiment uses these features, then [CORS errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors) will prevent the experiment from running. 

To prevent these errors, jsPsych uses a 'safe mode' when it detects that the HTML page is running via the `file://` protocol, and if so, automatically disables the features that don't work in that context. Specifically, when a jsPsych experiment runs offline:

* **Web Audio is disabled** (even if `use_webaudio` is set to `true` in `initJsPsych`). The WebAudio API option is used by default because it allows more precise measurement of response times relative to the onset of the audio. But because WebAudio doesn't work offline, audio will be played using HTML5 audio instead. This is equivalent to setting  `use_webaudio`  to `false` in `initJsPsych`.
* **Video preloading is disabled** (both automatic and manual preloading via the `preload` plugin). Videos will still play when you run your experiment offline, but they will load _during_ the experiment, which might cause noticeable delays before video playback starts.

This safe mode feature is controlled by the `override_safe_mode` parameter in [`initJsPsych`](../reference/jspsych.md#initjspsych), which defaults to `false`. If you leave this setting as the default, then you won't need to worry about CORS errors while running your experiment offline, or remembering to change your `initJsPsych` settings when you move the experiment online.

It's possible to override jsPsych's safe mode by setting `override_safe_mode` to `true` in `initJsPsych`. One reason you might do this is if you've disabled web security features in your browser (see [here](https://alfilatov.com/posts/run-chrome-without-cors/) and [here](https://stackoverflow.com/questions/4819060/allow-google-chrome-to-use-xmlhttprequest-to-load-a-url-from-a-local-file) for instructions in Chrome), which is safe to do if you know what you're doing. If your experiment does not use Web Audio or preloaded videos, then jsPsych's safe mode feature will not have any effect. 

The `override_safe_mode` parameter also has no effect when your experiment is running online a web server, because the page will be loaded via the `http://` or `https://` protocol.

### Media loading

While running your experiment offline, any media files are likely to load very quickly because they are stored on your own computer's disk. Therefore you may not notice problems with file loading delays while running your experiment locally (either offline or on a _local_ server) because the files will load fast enough that they never cause disruption. However, when your experiment is hosted on a _remote_ server, the files will need to be transferred over the internet, which means they will take longer to load - in some cases much longer. Loading delays are most noticeable with media files: images, audio, and video. As explained on the [Media Preloading](media-preloading.md) page, loading delays during your experiment can cause problems for stimulus display and response times. 

It is important to test your experiment to ensure that any media files are preloading successfully and not being requested again during the experiment. You can use the Network tab in your browser's developer tools to see when files are loaded and to simulate a slow internet connection (see [here](https://developers.google.com/web/tools/chrome-devtools/network) for Chrome Network tab documentation). If you are preloading many and/or large files, such as videos, you may want to increase the `max_load_time` parameter in [`the preload plugin`](../plugins/preload.md) so that participants with slow/unreliable internet connections will be able to take part in your experiment.

### Permanent data storage

As explained in the [Data Storage, Aggregation, and Manipulation](data.md#data-in-jspsych-permanent-and-non-permanent-data) page, jsPsych stores information in the participant's browser. While running an experiment offline, you won't be able to send the data to a database. However you can still see the data that jsPsych collects by saving it as a local file (using [`jsPsych.data.get().localSave`](../reference/jspsych-data.md#localsave)), displaying it in the webpage at the end of the experiment (using [`jsPsych.data.displayData`](../reference/jspsych-data.md#jspsychdatadisplaydata)), or printing it to the browser's console (using [`console.log`](https://www.w3schools.com/jsref/met_console_log.asp)). 

Permanent data storage is also necessary when the code that runs the experiment depends on information that can't be known in advance, and that changes throughout data collection. Some common examples of this in cognitive behavioral research are **version counterbalancing**, where the experiment code needs to access and update the history of version assignment in order to determine which version should be assigned, and **multi-session/training studies**, where the experiment might need to access and update information about each participant like their current session number, task difficulty level, etc. 

Doing these things in an automated way requires the use of a server. While developing and testing your experiment offline, you might choose to simulate some of these things and then implement them properly once you move your experiment online. For instance, you could [randomize](../reference/jspsych-randomization.md#jspsychrandomizationsamplewithoutreplacement) instead of counterbalancing version assignment:

```js
var versions = [1,2];
var random_version = jsPsych.randomization.sampleWithoutReplacement(versions,1)[0];
```

And use [URL query parameters](../reference/jspsych-data.md#jspsychdatageturlvariable) to pass in variables like session number and difficulty level:

```js
// add the variables onto the end of the URL that appears in the browser when you open the file 
// e.g., file:///C:/my_experiment.html?id=1&sess=2&diff=3
var participant_id = jsPsych.data.getURLVariable('id');
var session = jsPsych.data.getURLVariable('sess');
var difficulty = jsPsych.data.getURLVariable('diff');
```





## Online

### Hosting the Experiment and Saving the Data

jsPsych is a front-end JavaScript library that runs entirely on the participant's computer. To run a jsPsych experiment over the internet, the files need to be hosted on a public web server so that participants can access the experiment using a web browser. When the participant completes the experiment in the browser, all of the data that jsPsych collects is stored on the participant's computer in the browser's memory. To get access to this data, it needs to be sent from the participant's browser back to the web server and stored in a database or a file.

To be maximally flexible, jsPsych doesn't provide a single built-in solution for the web server component of your experiment. This makes jsPsych compatible with a wide range of hosting services and tools, allowing researchers to choose the web server option that best suit their needs. 

Some options for running your jsPsych experiment online include:

* [Cognition.run](https://www.cognition.run/) - A free service designed specifically for hosting jsPsych experiments, with an easy-to-use interface. 
* [JATOS](https://www.jatos.org/Whats-JATOS.html) - A free program that runs on your own server and provides a GUI for setting up experiments and accessing the data. Offers lots of features for creating more complex experiments and managing multiple researchers.
* [Pavlovia](https://pavlovia.org/) - A paid hosting service for web-based experiments, run by the PsychoPy team. Experiment files are managed on a GitLab repository. Participants will access the experiment through a link to Pavlovia.
* [PsiTurk](https://psiturk.org/) - Python-based program to help you host your experiment on your own computer and collect data from MTurk (see Recruiting Participants below). Relatively easy for a DIY option.
* [Pushkin](https://languagelearninglab.gitbook.io/pushkin/) - A set of tools to help you set up your own virtual laboratory for online experiments. This option differs from the others in that it helps you set up a complete website that may contain many different experiments, information about the laboratory, participant logins, and other features that are targeted at hosting large-scale data collection efforts.
* Full DIY - You can setup your own web server and database and handle the communication yourself. Traditional web server 'stacks' include [LAMP](https://www.digitalocean.com/community/tutorial_collections/how-to-install-lamp)/[LEMP](https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-on-ubuntu-20-04) (Linux operating system, Apache or Nginx server application, MySQL database, and PHP programming language). Other common web server frameworks include [Flask](https://flask.palletsprojects.com/) (Python) and [Node.js](https://nodejs.org/) (JavaScript).

### Recruiting Participants

Once your experiment is running online, you could recruit participants in the same way that you would for lab-based studies. For instance, if your institution uses SONA, you can advertise your web-based study link on SONA. SONA allows you to automactically embed a unique ID in online study URLs, which you can then save in your data using [jsPsych's URL query parameters function](../reference/jspsych-data.md#jspsychdatageturlvariable). SONA will also generate a completion URL that you can redirect participants to at the end of the study, and this will mark them as having completed the study in SONA.

To take full advantage of hosting an experiment online, many researchers advertise their experiments more widely. Social media and other media outlets provide one option for reaching a large number of potential participants. There are also some commercial platforms that you can use to advertise your study and pay anonymous online participants. These recruitment platforms charge a fee for use. The advantages of these platforms are that they handle the participant payments and allow you to specify pre-screening criteria. The most commonly used recruitment platforms in online behavioral research are:

* [Prolific](https://www.prolific.co/): An online labor market designed specifically for web-based research. 
* [Amazon Mechanical Turk (MTurk)](https://www.mturk.com/): An online labor market designed for advertising paid 'human intelligence tasks'. This service was designed for use by commercial businesses but has been used by behavioral researchers for many years.

Like SONA, Prolific and MTurk use URL query parameters to get participant information, and redirection to specific URLs to mark participants as having finished the study. jsPsych includes [convenience functions for interacting with MTurk participants](../reference/jspsych-turk.md). Information about integrating with Prolific can be found in the researcher support section of their website.
