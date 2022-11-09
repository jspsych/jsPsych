# Exclude Participants Based on Browser Features
*Changed in 7.1*

Online participants will use many different kinds of browsers. 
Depending on the experiment, it may be important to specify a minimum feature set of the browser. 

As of v7.1 of jsPsych, the recommended way to do this is using the [browser-check plugin](../plugins/browser-check.md). 
This plugin can record many features of the participant's browser and exclude participants who do not meet a defined set of inclusion criteria.
Please see the [browser-check plugin documentation](../plugins/browser-check.md) for more details.

The prior approach of using the `exclusions` parameter in `initJsPsych()` is deprecated and will be removed in `v8.0`. 
You can find the documentation for it in the [7.0 docs](https://www.jspsych.org/7.0/overview/exclude-browser).
