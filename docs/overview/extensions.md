# Extensions

In jsPsych, extensions allow one to extend the functionality of various plugins, giving individual plugins the ability to collect more data, display additional stimuli, and more. A canonical example of an extension is [eye tracking](../extensions/webgazer.md), which allow plugins to gather gaze data and add it to the their respective data objects. For a full list of extensions directly included in the jsPsych release, see [here](../extensions/list-of-extensions.md).

## Using an Extension

To use an extension in an experiment, you'll load the extension file via a `<script>` tag (just like adding a plugin) and then initialize the extension in the parameters of `initJsPsych()`.

```html
<head>
  <script src="https://unpkg.com/jspsych@8.2.2"></script>
  <script src="https://unpkg.com/@jspsych/extension-example@1.0.0"></script>
</head>
```

```js
initJsPsych({
  extensions: [
    { type: jsPsychExtensionExample, params: {...} }
  ]
})
```

To enable an extension during a trial, add the extension to the `extensions` list for the trial. Some extensions may also support or require an object of parameters to configure the extension:

```js
var trial = {
  extensions: [
    { type: jsPsychExtensionExample, params: {...} }
  ]
}
```

## Writing an Extension

See our [developer's guide for extensions](../developers/extension-development.md) for information about how to create a new extension.