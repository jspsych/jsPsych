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

// enumerate possible parameter types for plugins
export const parameterType = <const>{
  BOOL: 0,
  STRING: 1,
  INT: 2,
  FLOAT: 3,
  FUNCTION: 4,
  KEY: 5,
  SELECT: 6,
  HTML_STRING: 7,
  IMAGE: 8,
  AUDIO: 9,
  VIDEO: 10,
  OBJECT: 11,
  COMPLEX: 12,
  TIMELINE: 13,
};

type ParameterTypeMap = {
  0: boolean; // BOOL
  1: string; // STRING
  2: number; // INT
  3: number; // FLOAT
  4: (...args: any[]) => any; // FUNCTION
  5: string; // KEY
  6: any; // SELECT
  7: string; // HTML_STRING
  8: string; // IMAGE
  9: string; // AUDIO
  10: string; // VIDEO
  11: object; // OBJECT
  12: any; // COMPLEX
  13: any; // TIMELINE
};

interface ParameterInfo {
  type: keyof ParameterTypeMap;
  array?: boolean;
  pretty_name?: string;
  default?: any;
}

interface ParameterInfos {
  [key: string]: ParameterInfo;
}

type ParameterType<I extends ParameterInfo> = I["array"] extends boolean // Hack to deal with type widening in parameter declarations inferred from JavaScript
  ? Array<ParameterTypeMap[I["type"]]>
  : ParameterTypeMap[I["type"]];

type RequiredParameterNames<I extends ParameterInfos> = {
  [K in keyof I]: I[K]["default"] extends undefined ? K : never;
}[keyof I];

type InferredParameters<I extends ParameterInfos> = SetRequired<
  {
    [Property in keyof I]?: ParameterType<I[Property]>;
  },
  RequiredParameterNames<I>
>;

export const universalPluginParameters: ParameterInfos = {
  /**
   * Data to add to this trial (key-value pairs)
   */
  data: {
    type: parameterType.OBJECT,
    pretty_name: "Data",
    default: {},
  },
  /**
   * Function to execute when trial begins
   */
  on_start: {
    type: parameterType.FUNCTION,
    pretty_name: "On start",
    default: function () {
      return;
    },
  },
  /**
   * Function to execute when trial is finished
   */
  on_finish: {
    type: parameterType.FUNCTION,
    pretty_name: "On finish",
    default: function () {
      return;
    },
  },
  /**
   * Function to execute after the trial has loaded
   */
  on_load: {
    type: parameterType.FUNCTION,
    pretty_name: "On load",
    default: function () {
      return;
    },
  },
  /**
   * Length of gap between the end of this trial and the start of the next trial
   */
  post_trial_gap: {
    type: parameterType.INT,
    pretty_name: "Post trial gap",
    default: null,
  },
  /**
   * A list of CSS classes to add to the jsPsych display element for the duration of this trial
   */
  css_classes: {
    type: parameterType.STRING,
    pretty_name: "Custom CSS classes",
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
  info: I;
  trial(display_element: HTMLElement, trial: TrialType<I>): void;
}

export type TrialType<I extends PluginInfo> = InferredParameters<I["parameters"]> &
  UniversalPluginParameters;

export type PluginParameters<P extends JsPsychPlugin<any>> = InferredParameters<
  P["info"]["parameters"]
>;
