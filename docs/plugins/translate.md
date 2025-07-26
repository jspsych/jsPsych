# plugin-translate

This plugin enables dynamic language selection during a jsPsych experiment using the i18next translation framework. It can either prompt participants to choose a language from a dropdown menu or automatically switch to a specified locale. Language resources can be supplied directly, and selected language data is saved for each trial. This plugin is useful for multi-language studies, international deployments, or experiments requiring runtime translation changes.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of `undefined` must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter              | Type         | Default Value | Description                                                                                                                                                                                               |
| ---------------------- | ------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stimulus`             | HTML\_STRING | `null`        | HTML content shown to participants when selecting a language. Only displayed if `set_locale` is not set. Useful for presenting instructions or prompts.                                                   |
| `resources`            | OBJECT       | `null`        | An object containing i18next-compatible language resources. Must be provided if i18next is not already initialized. Should be structured as `{ en: { translation: {...} }, de: { translation: {...} } }`. |
| `set_locale`           | STRING       | `null`        | If provided, the plugin switches immediately to this locale without displaying a language selection interface. Must be a valid locale code.                                                               |
| `button_text`          | STRING       | "Next"        | The label for the confirmation button shown when prompting for language selection.                                                                                                                        |
| `language_name_locale` | STRING       | "en"          | The locale to use for displaying language names in the dropdown menu. For example, "de" would display "Deutsch", "Englisch", etc.                                                                         |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial:

| Name     | Type   | Value                                                                |
| -------- | ------ | -------------------------------------------------------------------- |
| `locale` | STRING | The locale selected or set during the trial, e.g., "en", "de", "es". |

## Install

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

## Examples

### Prompt the participant to choose a language

```javascript
const trial = {
  type: jsPsychTranslate,
  stimulus: "<p>Please choose your language:</p>",
  resources: {
    en: { translation: { greeting: "Hello!" } },
    de: { translation: { greeting: "Hallo!" } }
  },
  button_text: "Continue",
  language_name_locale: "en"
};
```

### Automatically set locale without user prompt

```javascript
const trial = {
  type: jsPsychTranslate,
  set_locale: "de",
  resources: {
    en: { translation: { greeting: "Hello!" } },
    de: { translation: { greeting: "Hallo!" } }
  }
};
```

---

This plugin also exposes these static methods:

* `TranslatePlugin.t(key, options)` — access i18next translation directly.
* `TranslatePlugin.setLocale(locale)` — change language programmatically.
* `TranslatePlugin.language()` — returns current language.
* `TranslatePlugin.languages()` — returns supported languages.
* `TranslatePlugin.resolvedLanguage()` — returns resolved language from i18next.
