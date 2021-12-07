/**
Flatten the type output to improve type hints shown in editors.
Borrowed from type-fest
*/
type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };

/**
Create a type that makes the given keys required. The remaining keys are kept as is.
Borrowed from type-fest
*/
type SetRequired<BaseType, Keys extends keyof BaseType> = Simplify<
  Omit<BaseType, Keys> & Required<Pick<BaseType, Keys>>
>;

/**
 * Parameter types for plugins
 */
export enum ParameterType {
  BOOL,
  STRING,
  INT,
  FLOAT,
  FUNCTION,
  KEY,
  KEYS,
  SELECT,
  HTML_STRING,
  IMAGE,
  AUDIO,
  VIDEO,
  OBJECT,
  COMPLEX,
  TIMELINE,
}

type ParameterTypeMap = {
  [ParameterType.BOOL]: boolean;
  [ParameterType.STRING]: string;
  [ParameterType.INT]: number;
  [ParameterType.FLOAT]: number;
  [ParameterType.FUNCTION]: (...args: any[]) => any;
  [ParameterType.KEY]: string;
  [ParameterType.KEYS]: string[] | "ALL_KEYS" | "NO_KEYS";
  [ParameterType.SELECT]: any;
  [ParameterType.HTML_STRING]: string;
  [ParameterType.IMAGE]: string;
  [ParameterType.AUDIO]: string;
  [ParameterType.VIDEO]: string;
  [ParameterType.OBJECT]: object;
  [ParameterType.COMPLEX]: any;
  [ParameterType.TIMELINE]: any;
};

export interface ParameterInfo {
  type: ParameterType;
  array?: boolean;
  pretty_name?: string;
  default?: any;
  preload?: boolean;
}

export interface ParameterInfos {
  [key: string]: ParameterInfo;
}

type InferredParameter<I extends ParameterInfo> = I["array"] extends true
  ? Array<ParameterTypeMap[I["type"]]>
  : ParameterTypeMap[I["type"]];

type RequiredParameterNames<I extends ParameterInfos> = {
  [K in keyof I]: I[K]["default"] extends undefined ? K : never;
}[keyof I];

type InferredParameters<I extends ParameterInfos> = SetRequired<
  {
    [Property in keyof I]?: InferredParameter<I[Property]>;
  },
  RequiredParameterNames<I>
>;

export const universalPluginParameters = <const>{
  /**
   * Data to add to this trial (key-value pairs)
   */
  data: {
    type: ParameterType.OBJECT,
    pretty_name: "Data",
    default: {},
  },
  /**
   * Function to execute when trial begins
   */
  on_start: {
    type: ParameterType.FUNCTION,
    pretty_name: "On start",
    default: function () {
      return;
    },
  },
  /**
   * Function to execute when trial is finished
   */
  on_finish: {
    type: ParameterType.FUNCTION,
    pretty_name: "On finish",
    default: function () {
      return;
    },
  },
  /**
   * Function to execute after the trial has loaded
   */
  on_load: {
    type: ParameterType.FUNCTION,
    pretty_name: "On load",
    default: function () {
      return;
    },
  },
  /**
   * Length of gap between the end of this trial and the start of the next trial
   */
  post_trial_gap: {
    type: ParameterType.INT,
    pretty_name: "Post trial gap",
    default: null,
  },
  /**
   * A list of CSS classes to add to the jsPsych display element for the duration of this trial
   */
  css_classes: {
    type: ParameterType.STRING,
    pretty_name: "Custom CSS classes",
    default: null,
  },
  /**
   * Options to control simulation mode for the trial.
   */
  simulation_options: {
    type: ParameterType.COMPLEX,
    default: null,
  },
};

export type UniversalPluginParameters = InferredParameters<typeof universalPluginParameters>;

export interface PluginInfo {
  name: string;
  parameters: {
    [key: string]: ParameterInfo;
  };
}

export interface JsPsychPlugin<I extends PluginInfo> {
  trial(
    display_element: HTMLElement,
    trial: TrialType<I>,
    on_load?: () => void
  ): void | Promise<any>;
}

export type TrialType<I extends PluginInfo> = InferredParameters<I["parameters"]> &
  UniversalPluginParameters;

export type PluginParameters<I extends PluginInfo> = InferredParameters<I["parameters"]>;
