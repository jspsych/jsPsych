# Exclude Participants Based on Browser Features

Online subjects will use many different kinds of browsers. Depending on the experiment, it may be important to specify a minimum feature set of the browser. jsPsych makes this straightforward. Simply specify certain exclusion criteria in the `jsPsych.init` method call. If a subject's browser doesn't meet the criteria the experiment will not start and the subject will see a message explaining the problem. For size restrictions the subject will see a message that displays the current size of their browser window and the minimum size needed to start the experiment, giving the subject an opportunity to enlarge the browser window to continue.

Current exclusion options:
* Minimum browser width & height
* Support for the WebAudio API

## Examples

#### Exclude browsers that are not at least 800x600 pixels

```javascript
jsPsych.init({
  timeline: exp,
  exclusions: {
    min_width: 800,
    min_height: 600
  }
});
```

#### Exclude browsers that do not have access to the WebAudio API

```javascript
jsPsych.init({
  timeline: exp,
  exclusions: {
    audio: true
  }
});
```
