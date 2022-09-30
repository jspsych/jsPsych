import { JsPsych } from "../JsPsych";
import {
  repeat,
  sampleWithReplacement,
  sampleWithoutReplacement,
  shuffle,
  shuffleAlternateGroups,
} from "../modules/randomization";
import { BaseTimelineNode } from "./BaseTimelineNode";
import { Trial } from "./Trial";
import { PromiseWrapper } from "./util";
import {
  GetParameterValueOptions,
  TimelineArray,
  TimelineDescription,
  TimelineNode,
  TimelineNodeStatus,
  TimelineVariable,
  TrialDescription,
  isTimelineDescription,
  isTrialDescription,
  timelineDescriptionKeys,
} from ".";

export class Timeline extends BaseTimelineNode {
  public readonly children: TimelineNode[] = [];
  public readonly description: TimelineDescription;

  constructor(
    jsPsych: JsPsych,
    description: TimelineDescription | TimelineArray,
    protected readonly parent?: Timeline,
    public readonly index = 0
  ) {
    super(jsPsych);
    this.description = Array.isArray(description) ? { timeline: description } : description;
    this.nextChildNodeIndex = index;
  }

  private activeChild?: TimelineNode;
  private shouldAbort = false;

  public async run() {
    this.status = TimelineNodeStatus.RUNNING;
    const description = this.description;

    if (!description.conditional_function || description.conditional_function()) {
      for (let repetition = 0; repetition < (this.description.repetitions ?? 1); repetition++) {
        do {
          for (const timelineVariableIndex of this.generateTimelineVariableOrder()) {
            this.setCurrentTimelineVariablesByIndex(timelineVariableIndex);

            const newChildren = this.instantiateChildNodes();

            for (const childNode of newChildren) {
              this.activeChild = childNode;
              await childNode.run();
              // @ts-expect-error TS thinks `this.status` must be `RUNNING` now, but it might have changed while `await`ing
              if (this.status === TimelineNodeStatus.PAUSED) {
                await this.resumePromise.get();
              }
              if (this.shouldAbort) {
                this.status = TimelineNodeStatus.ABORTED;
                return;
              }
            }
          }
        } while (description.loop_function && description.loop_function(this.getResults()));
      }
    }

    this.status = TimelineNodeStatus.COMPLETED;
  }

  pause() {
    if (this.activeChild instanceof Timeline) {
      this.activeChild.pause();
    }
    this.status = TimelineNodeStatus.PAUSED;
  }

  private resumePromise = new PromiseWrapper();
  resume() {
    if (this.status == TimelineNodeStatus.PAUSED) {
      if (this.activeChild instanceof Timeline) {
        this.activeChild.resume();
      }
      this.status = TimelineNodeStatus.RUNNING;
      this.resumePromise.resolve();
    }
  }

  /**
   * If the timeline is running or paused, aborts the timeline after the current trial has completed
   */
  abort() {
    if (this.status === TimelineNodeStatus.RUNNING || this.status === TimelineNodeStatus.PAUSED) {
      if (this.activeChild instanceof Timeline) {
        this.activeChild.abort();
      }

      this.shouldAbort = true;
      if (this.status === TimelineNodeStatus.PAUSED) {
        this.resume();
      }
    }
  }

  private nextChildNodeIndex: number;
  private instantiateChildNodes() {
    const newChildNodes = this.description.timeline.map((childDescription) => {
      const childNodeIndex = this.nextChildNodeIndex++;
      return isTimelineDescription(childDescription)
        ? new Timeline(this.jsPsych, childDescription, this, childNodeIndex)
        : new Trial(this.jsPsych, childDescription, this, childNodeIndex);
    });
    this.children.push(...newChildNodes);
    return newChildNodes;
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

  /**
   * Returns a flat array containing the results of all nested trials that have results so far
   */
  public getResults() {
    const results = [];
    for (const child of this.children) {
      if (child instanceof Trial) {
        const childResult = child.getResult();
        if (childResult) {
          results.push(childResult);
        }
      } else if (child instanceof Timeline) {
        results.push(...child.getResults());
      }
    }

    return results;
  }

  /**
   * Returns the naive progress of the timeline (as a fraction), i.e. only considering the current
   * position within the description's `timeline` array. This certainly breaks for anything beyond
   * basic timelines (timeline variables, repetitions, loop functions, conditional functions, ...)!
   * See https://www.jspsych.org/latest/overview/progress-bar/#automatic-progress-bar for the
   * motivation.
   */
  public getProgress() {
    if (this.status === TimelineNodeStatus.PENDING) {
      return 0;
    }

    if (
      [TimelineNodeStatus.COMPLETED, TimelineNodeStatus.ABORTED].includes(this.status) ||
      this.children.length === 0
    ) {
      return 1;
    }

    return this.children.indexOf(this.activeChild) / this.children.length;
  }

  /**
   * Recursively computes the naive number of trials in the timeline, without considering
   * conditional or loop functions.
   */
  public getNaiveTrialCount() {
    // Since child timeline nodes are instantiated lazily, we cannot rely on them but instead have
    // to recurse the description programmatically.

    const getTrialCount = (description: TimelineArray | TimelineDescription | TrialDescription) => {
      const getTimelineArrayTrialCount = (description: TimelineArray) =>
        description
          .map((childDescription) => getTrialCount(childDescription))
          .reduce((a, b) => a + b);

      if (Array.isArray(description)) {
        return getTimelineArrayTrialCount(description);
      }

      if (isTrialDescription(description)) {
        return 1;
      }
      if (isTimelineDescription(description)) {
        return (
          getTimelineArrayTrialCount(description.timeline) *
          (description.repetitions ?? 1) *
          (description.timeline_variables?.length || 1)
        );
      }
      return 0;
    };

    return getTrialCount(this.description);
  }

  /**
   * Returns the currently active TimelineNode or `undefined`, if the timeline is not running.
   *
   * Note: This is a Trial object most of the time, but it may also be a Timeline object when a
   * timeline is running but hasn't yet instantiated its children (e.g. during timeline callback
   * functions).
   */
  public getActiveNode(): TimelineNode {
    return this;
  }
}
