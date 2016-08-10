# Exclude Participants Based on Browser Features

Online subjects will use many different kinds of browsers. Depending on the experiment, it may be important to specify a minimum feature set of the browser. jsPsych makes this straightforward. Simply specify certain exclusion criteria in the `jsPsych.init` method call. If a subject's browser doesn't meet the criteria, the experiment will not start and the subject will see a message explaining the problem.

Current exclusion options include:
* Minimum browser width & height
* Support for the WebAudio API
