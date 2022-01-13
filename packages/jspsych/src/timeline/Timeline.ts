import { JsPsych } from "../JsPsych";
import { JsPsychPlugin, PluginInfo } from "../modules/plugins";
import {
  repeat,
  sampleWithReplacement,
  sampleWithoutReplacement,
  shuffle,
  shuffleAlternateGroups,
} from "../modules/randomization";
import { deepCopy } from "../modules/utils";
import { BaseTimelineNode } from "./BaseTimelineNode";
import { Trial } from "./Trial";
import {
  GetParameterValueOptions,
  TimelineDescription,
  TimelineNode,
  TimelineVariable,
  isTimelineDescription,
  timelineDescriptionKeys,
} from ".";

export class Timeline extends BaseTimelineNode {
  public readonly children: TimelineNode[] = [];

  constructor(
    jsPsych: JsPsych,
    public readonly description: TimelineDescription,
    protected readonly parent?: Timeline
  ) {
    super(jsPsych);
  }

  public async run() {
    const description = this.description;

    for (let repetition = 0; repetition < (description.repetitions ?? 1); repetition++) {
      if (!description.conditional_function || description.conditional_function()) {
        do {
          for (const timelineVariableIndex of this.generateTimelineVariableOrder()) {
            this.setCurrentTimelineVariablesByIndex(timelineVariableIndex);

            const newChildren = this.instantiateChildNodes();
            this.children.push(...newChildren);

            for (const childNode of newChildren) {
              await childNode.run();
            }
          }
        } while (description.loop_function && description.loop_function([])); // TODO What data?
      }
    }
  }

  private instantiateChildNodes() {
    return this.description.timeline.map((childDescription) =>
      isTimelineDescription(childDescription)
        ? new Timeline(this.jsPsych, childDescription, this)
        : new Trial(this.jsPsych, childDescription, this)
    );
  }

  private currentTimelineVariables: Record<string, any>;

  private setCurrentTimelineVariablesByIndex(index: number | null) {
    this.currentTimelineVariables =
      index === null ? {} : this.description.timeline_variables[index];
  }

  /**
   * If the timeline has timeline variables, returns the order of `timeline_variables` array indices
   * to be used, according to the timeline's `sample` setting. If the timeline has no timeline
   * variables, returns `[null]`.
   */
  private generateTimelineVariableOrder() {
    const timelineVariableLength = this.description.timeline_variables?.length;
    if (!timelineVariableLength) {
      return [null];
    }

    let order = [...Array(timelineVariableLength).keys()];

    const sample = this.description.sample;

    if (sample) {
      switch (sample.type) {
        case "custom":
          order = sample.fn(order);
          break;

        case "with-replacement":
          order = sampleWithReplacement(order, sample.size, sample.weights);
          break;

        case "without-replacement":
          order = sampleWithoutReplacement(order, sample.size);
          break;

        case "fixed-repetitions":
          order = repeat(order, sample.size);
          break;

        case "alternate-groups":
          order = shuffleAlternateGroups(sample.groups, sample.randomize_group_order);
          break;

        default:
          throw new Error(
            `Invalid type "${
              // @ts-expect-error TS doesn't have a type for `sample` in this case
              sample.type
            }" in timeline sample parameters. Valid options for type are "custom", "with-replacement", "without-replacement", "fixed-repetitions", and "alternate-groups"`
          );
      }
    }

    if (this.description.randomize_order) {
      order = shuffle(order);
    }

    return order;
  }

  public evaluateTimelineVariable(variable: TimelineVariable) {
    if (this.currentTimelineVariables.hasOwnProperty(variable.name)) {
      return this.currentTimelineVariables[variable.name];
    }
    if (this.parent) {
      return this.parent.evaluateTimelineVariable(variable);
    }
  }

  public getParameterValue(parameterName: string, options?: GetParameterValueOptions) {
    if (timelineDescriptionKeys.includes(parameterName)) {
      return;
    }
    return super.getParameterValue(parameterName, options);
  }
}
