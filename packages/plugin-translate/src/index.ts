import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import i18next, { Resource, TOptions } from "i18next";

import { version } from "../package.json";

type LabeledResource = {
  translation: Record<string, string>;
};

type LabeledResourceMap = Record<string, LabeledResource>;

const i18instance = i18next.createInstance();

const info = <const>{
  name: "plugin-translate",
  version: version,
  parameters: {
    /**
     * HTML content to display to participants when prompting them to select a language.
     * Typically used to present instructions or context for language selection.
     * Only shown if `set_locale` is not set.
     */
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /**
     * An object containing i18next-compatible language resources, organized by locale.
     * If provided, it will be used to initialize or update the i18next translation instance.
     * Must follow the shape: `{ en: { translation: {...} }, de: { translation: {...} } }`.
     * Required if i18next has not already been initialized.
     */
    resources: {
      type: ParameterType.OBJECT,
      default: null,
    } as const satisfies {
      type: ParameterType.OBJECT;
      default: LabeledResourceMap | null;
    }, // probably unnecessary type safety here, but leaving in for now...
    /**
     * If provided, the plugin will automatically switch to this locale
     * without displaying a language selection interface.
     * Requires i18next to be already initialized or `resources` to be provided.
     * Must be a valid BCP 47 locale string (e.g., "en", "de", "es").
     */
    set_locale: {
      type: ParameterType.STRING,
      default: null,
    },
    /**
     * The label to display on the confirmation button used to proceed to the next trial
     * after selecting a language. Only shown when prompting for language choice.
     */
    button_text: {
      type: ParameterType.STRING,
      default: "Next",
    },
    /**
     * The locale to use when displaying language names in the dropdown.
     * For example, using "de" will display "Englisch", "Deutsch", etc.
     * Must be a valid locale code supported by `Intl.DisplayNames`.
     */
    language_name_locale: {
      type: ParameterType.STRING,
      default: "en",
    },
  },
  data: {
    /**
     * The locale selected or set during the trial, e.g., "en", "de", "es".
     * This reflects the final language used for translation at the end of the trial.
     */
    locale: {
      type: ParameterType.STRING,
    },
  },
  // When you run build on your plugin, citations will be generated here based on the information in the CITATION.cff file.
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-translate**
 *
 * initial draft of new jsPsych translation plugin
 *
 * @author Courtney B. Hilton
 * @see {@link /plugin-translate/README.md}}
 */
class TranslatePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  ////////////////////
  // PUBLIC METHODS //
  ////////////////////

  static t = (key: string, options?: TOptions): string => {
    return i18instance.t(key, options);
  };

  static setLocale = async (lang: string) => {
    await i18instance.changeLanguage(lang);
  };

  static addResources = (lang: string, resource: Resource[string]) => {
    i18instance.addResourceBundle(lang, "translation", resource, true, true);
  };

  static language = () => {
    return i18instance.language;
  };

  static languages = () => {
    return i18instance.languages;
  };

  static resolvedLanguage = () => {
    return i18instance.resolvedLanguage;
  };

  //////////////////////////
  // DOM CREATION HELPERS //
  //////////////////////////

  private createStimulusGroup(): HTMLDivElement {
    const containerEl = document.createElement("div");
    containerEl.className = "jspsych-stimulus-group";
    return containerEl;
  }

  private createStimulusElement(html: string): HTMLDivElement {
    const stimulusEl = document.createElement("div");
    stimulusEl.id = "jspsych-translate-stimulus";
    stimulusEl.innerHTML = html;
    return stimulusEl;
  }

  private createDropdown(
    resources: LabeledResourceMap,
    locale: string
  ): HTMLSelectElement {
    const displayLanguageNames = new Intl.DisplayNames([locale], {
      type: "language",
    });

    const dropdownEl = document.createElement("select");
    dropdownEl.id = "jspsych-translate-dropdown";

    Object.keys(resources).forEach((code) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = displayLanguageNames.of(code) ?? code;
      dropdownEl.appendChild(option);
    });

    return dropdownEl;
  }

  private createResponseButton(
    label: string,
    onClick: () => void
  ): HTMLButtonElement {
    const buttonEl = document.createElement("button");
    buttonEl.className = "jspsych-btn";
    buttonEl.style.marginTop = "20px";
    buttonEl.innerText = label;
    buttonEl.addEventListener("click", onClick);
    return buttonEl;
  }

  //////////////////////////
  // OTHER HELPER METHODS //
  /////////////////////////

  private async endTrial(selectedLanguage: string): Promise<void> {
    // save data
    const trial_data = {
      locale: selectedLanguage,
    };
    // end trial
    this.jsPsych.finishTrial(trial_data);
  }

  private async initLanguage(
    selectedLanguage: string,
    resources: Resource
  ): Promise<void> {
    // init i18next with the chosen language
    await i18instance.init({
      lng: selectedLanguage,
      debug: true,
      resources: resources,
    });

    this.endTrial(selectedLanguage);
  }

  private async changeLanguage(selectedLanguage: string): Promise<void> {
    await i18instance.changeLanguage(selectedLanguage, (err, t) => {
      if (err) return console.log("something went wrong loading", err);
      t("key");
    });

    this.endTrial(selectedLanguage);
  }

  private showLanguagePrompt(
    display_element: HTMLElement,
    resources: LabeledResourceMap,
    stimulus: string,
    buttonText: string,
    languageLocale: string
  ) {
    const stimulusGroupElement = this.createStimulusGroup();
    display_element.appendChild(stimulusGroupElement);

    const stimulusElement = this.createStimulusElement(stimulus);
    stimulusGroupElement.appendChild(stimulusElement);

    const dropdownElement = this.createDropdown(resources, languageLocale);
    stimulusGroupElement.appendChild(dropdownElement);

    const responseButton = this.createResponseButton(buttonText, () => {
      const selectedLanguage = (dropdownElement as HTMLSelectElement).value;

      if (i18instance.isInitialized) {
        this.changeLanguage(selectedLanguage);
      } else {
        this.initLanguage(selectedLanguage, resources as Resource);
      }
    });

    display_element.appendChild(responseButton);
  }

  ///////////////////////
  // MAIN TRIAL METHOD //
  //////////////////////

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const resources = trial.resources as LabeledResourceMap | null;
    const setLocale = trial.set_locale ?? null;
    const stimulus = trial.stimulus ?? null;

    // IF resources present: validate
    if (resources !== null) {
      Object.entries(resources).forEach(([code, value]) => {
        if (!value.translation || typeof value.translation !== "object") {
          throw new Error(
            `Missing or invalid 'translation' for language ${code}`
          );
        }
      });
    }

    // IF setLocale present: validate
    if (setLocale !== null) {
      // 1. check that code is a valid Intl.Locale
      try {
        new Intl.Locale(setLocale);
      } catch {
        throw new Error(`Invalid locale code format: '${setLocale}'`);
      }

      // 2. check against provided resources
      if (resources !== null) {
        if (!resources.hasOwnProperty(setLocale)) {
          throw new Error(
            `The provided set_locale '${setLocale}' does not exist in the supplied resources object.`
          );
        }
      }

      // 3.  if already initialized, check against i18next store
      else if (i18instance.isInitialized) {
        if (!i18instance.hasResourceBundle(setLocale, "translation")) {
          throw new Error(
            `The provided set_locale '${setLocale}' does not exist in the i18next resource store.`
          );
        }
      }

      // 4. neither resources nor store available to validate against
      else {
        throw new Error(
          `Cannot validate set_locale '${setLocale}' — no resources provided and i18next is not initialized.`
        );
      }
    }

    // IF i18next already initialisesd: only change the language
    if (i18instance.isInitialized) {
      if (setLocale !== null) {
        this.changeLanguage(setLocale);
        return;
      } else if (stimulus !== null) {
        this.showLanguagePrompt(
          display_element,
          resources!,
          stimulus,
          trial.button_text,
          trial.language_name_locale
        );
        return;
      } else {
        throw new Error(
          "i18next is initialized, but no set_locale or stimulus was provided."
        );
      }
    }

    // IF i18next isn't initialised: initialise it
    if (!i18instance.isInitialized) {
      if (resources === null) {
        throw new Error(
          "i18next is not initialized and no resources were provided."
        );
      }

      if (setLocale !== null) {
        this.initLanguage(setLocale, resources as Resource);
        return;
      }

      if (stimulus !== null) {
        this.showLanguagePrompt(
          display_element,
          resources,
          stimulus,
          trial.button_text,
          trial.language_name_locale
        );
        return;
      }

      throw new Error(
        "i18next is not initialized and no stimulus or set_locale provided to guide initialization."
      );
    }
  }
}

export default TranslatePlugin;
