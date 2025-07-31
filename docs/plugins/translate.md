# plugin-translate

This plugin enables dynamic language selection during a jsPsych experiment using the i18next translation framework. It can either prompt participants to choose a language from a dropdown menu or automatically switch to a specified locale. Language resources can be supplied directly, and selected language data is saved for each trial. This plugin is useful for multi-language studies, international deployments, or experiments requiring runtime translation changes.

The first `jsPsychPluginTranslate` trial in the timeline will set up (initialize) the translations. After that trial runs, you can access the translations throughout the rest of the experiment.

1. **Initialize translations with a `jsPsychPluginTranslate` trial.** This trial must include the translation resources and a default/initial language. It can prompt the participant to choose their language, or just set the language directly.

2. **Use the translations during the experiment.** After initializing translations with a `jsPsychPluginTranslate` trial, you can use the `jsPsychPluginTranslate` [class methods](#class-methods) in other parts of your experiment to retrieve translated text from the translation resources, based on the current locale. You can also change and retrieve the current locale at any point after initialization.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of `undefined` must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter              | Type         | Default Value | Description                                                                                                                                                                                               |
| ---------------------- | ------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stimulus`             | HTML\_STRING | `null`        | HTML content shown to participants when selecting a language. Only displayed if `set_locale` is not set. Useful for presenting instructions or prompts.                                                   |
| `resources`            | OBJECT       | `null`        | An object containing i18next-compatible language resources. Must be provided if i18next is not already initialized. Should be structured as `{ en: { translation: {...} }, de: { translation: {...} } }`. |
| `set_locale`           | STRING       | `null`        | If provided, the plugin switches immediately to this locale without displaying a language selection interface. Must be a valid locale code.                                                               |
| `button_text`          | STRING       | "Next"        | The label for the confirmation button shown when prompting for language selection.                                                                                                                        |
| `language_name_locale` | STRING       | "en"          | The locale to use for displaying language names in the dropdown menu. For example, "de" would display "Deutsch", "Englisch", etc.

## Class Methods

This plugin exposes these static methods on the `jsPsychPluginTranslate` class:

* `t(key, options)` — access i18next translation directly.
* `setLocale(locale)` — change language programmatically.
* `language()` — returns current language.
* `languages()` — returns supported languages.
* `resolvedLanguage()` — returns resolved language from i18next.

After the translations have been initialized with a `jsPsychPluginTranslate` trial, these methods can be used in the experiment code to retrieve a translated string (`t`), change the language (`setLocale`), and get the current language settings (`language`/`languages`/`resolvedLanguage`).

!!! info
    The `jsPsychPluginTranslate` methods must be called _after_ translations have been initialized with a `jsPsychPluginTranslate` trial, so they should be used inside a function, such as in a [dynamic parameter](../overview/dynamic-parameters/) or in an [event-related callback function](../overview/events/).

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

### Initialize translations and prompt the participant to choose a language

This example will show the stimulus and a dropdown menu with all locale (language) options listed in the resources. The language names that correspond to the locale codes will be shown according to the 'language_name_locale' value (in this case, "English" for "en" and "German" for "de"). After the participant selects a language and clicks the next button, translations will be initialized and the language will be set to the participant's response.

```javascript
const init_user_set_language = {
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

After this `init_user_set_language` trial runs, calling `jsPsychTranslate.t` with a key from the resources (e.g. "greeting") will return the translated string based on the locale set by the participant.

```javascript
const translated_greeting = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => jsPsychPluginTranslate.t("greeting")
};
```

Note that this uses a dynamic parameter for the `stimulus` because `jsPsychTranslate.t` can only be called after the translations have been initialized with a `jsPsychPluginTranslate` trial.

The `translated_greeting` trial will show "Hello!" as the stimulus if the participant selected English, or "Hallo!" if the participant selected German.

### Initialize translations and set locale without prompt

This example will intialize translations and set the language to German, without displaying anything to the participant.

```javascript
const init_set_language = {
  type: jsPsychTranslate,
  set_locale: "de",
  resources: {
    en: { translation: { greeting: "Hello!" } },
    de: { translation: { greeting: "Hallo!" } }
  }
};
```

After this `init_set_language` trial runs, you can call `jsPsychTranslate.t` to retrive a translated string from the resources, based on the `set_locale` value. In this example the language is set to German, so the `translated_greeting` trial below would show "Hallo!" as the stimulus.

```javascript
const translated_greeting = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => jsPsychPluginTranslate.t("greeting")
};
```

Note that this uses a dynamic parameter for the `stimulus` because `jsPsychTranslate.t` can only be called after the translations have been initialized with a `jsPsychPluginTranslate` trial.

### After initialization, change the locale without user prompt

The translation resources only need to be defined the first time you run the trial. After that, you can change the language during the experiment with a trial that just sets the `set_locale` value.

```javascript
const change_language = {
  type: jsPsychTranslate,
  set_locale: "es"
};
```

After this `change_language` trial runs, any text that is retrieved using `jsPsychTranslate.t` will return the Spanish (es) translations.
