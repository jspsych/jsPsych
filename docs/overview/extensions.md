# Extensions

Extensions are jsPsych modules that can interface with any plugin to extend the functionality of the plugin. A canonical example of an extension is eye tracking. An eye tracking extension allows a plugin to gather gaze data and add it to the plugin's data object.

## Using an Extension

To use an extension in an experiment, you'll load the extension file via a `<script>` tag (just like adding a plugin) and then initialize the extension in the parameters of `initJsPsych()`.

```html
<head>
  <script src="https://unpkg.com/jspsych@7.3.4"></script>
  <script src="https://unpkg.com/@jspsych/extension-example@1.0.0"></script>
</head>
```

```js
initJsPsych({
  extensions: [
    {type: jsPsychExtensionExample, params: {...} }
  ]
})
```

To enable an extension during a trial, add the extension to the `extensions` list for the trial. Some extensions may also support or require an object of parameters to configure the extension:

```js
var trial = {
  extensions: [
    {type: jsPsychExtensionExample, params: {...} }
  ]
}
```

## List of Extensions

Extension | Description
------ | -----------
[jspsych&#8209;ext&#8209;webgazer.js](../extensions/webgazer.md) | Enables eye tracking using the [WebGazer](https://webgazer.cs.brown.edu/) library.

## Writing an Extension

See our [developer's guide for extensions](../developers/extension-development.md) for information about how to create a new extension.