# plugin-translate

## Overview

This plugin enables dynamic language selection during a jsPsych experiment using the i18next translation framework. It can either prompt participants to choose a language from a dropdown menu or automatically switch to a specified locale. Language resources can be supplied directly, and selected language data is saved for each trial. This plugin is useful for multi-language studies, international deployments, or experiments requiring runtime translation changes.

## Loading

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-translate@VERSION_HERE"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-translate.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-translate
```
```js
import jsPsychTranslate from '@jspsych/plugin-translate';
```
## Compatibility

`plugin-translate` requires jsPsych v8.0.0 or later.

## Documentation

See [documentation](/plugin-translate/README.md)

## Author / Citation

Courtney B. Hilton...