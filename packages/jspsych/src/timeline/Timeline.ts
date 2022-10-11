import { DataCollection } from "../modules/data/DataCollection";
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
  TimelineNodeDependencies,
  TimelineNodeStatus,
  TimelineVariable,
  TrialDescription,
  TrialResult,
  isTimelineDescription,
  isTrialDescription,
  timelineDescriptionKeys,
} from ".";

export class Timeline extends BaseTimelineNode {
  public readonly children: TimelineNode[] = [];
  public readonly description: TimelineDescription;

  constructor(
    dependencies: TimelineNodeDependencies,
    description: TimelineDescription | TimelineArray,
    protected readonly parent?: Timeline,
    public readonly index = 0
  ) {
    super(dependencies);
    this.description = Array.isArray(description) ? { timeline: description } : description;
    this.nextChildNodeIndex = index;
  }

  private currentChild?: TimelineNode;
  private shouldAbort = false;

  public async run() {
    this.status = TimelineNodeStatus.RUNNING;

    const { conditional_function, loop_function, repetitions = 1 } = this.description;

    // Generate initial timeline variable order so the first set of timeline variables is already
    // available to the `on_timeline_start` and `conditional_function` callbacks
    let timelineVariableOrder = this.generateTimelineVariableOrder();
    this.setCurrentTimelineVariablesByIndex(timelineVariableOrder[0]);
    let isInitialTimelineVariableOrder = true; // So we don't regenerate the order in the first iteration

    let currentLoopIterationResults: TrialResult[];

    if (!conditional_function || conditional_function()) {
      for (let repetition = 0; repetition < repetitions; repetition++) {
        do {
          currentLoopIterationResults = [];
          this.onStart();

          // Generate a new timeline variable order in each iteration except for the first one where
          // it has been done before
          if (isInitialTimelineVariableOrder) {
            isInitialTimelineVariableOrder = false;
          } else {
            timelineVariableOrder = this.generateTimelineVariableOrder();
          }

          for (const timelineVariableIndex of timelineVariableOrder) {
            this.setCurrentTimelineVariablesByIndex(timelineVariableIndex);

            for (const childNode of this.instantiateChildNodes()) {
              this.currentChild = childNode;
              await childNode.run();
              // @ts-expect-error TS thinks `this.status` must be `RUNNING` now, but it might have
              // changed while `await`ing
              if (this.status === TimelineNodeStatus.PAUSED) {
                await this.resumePromise.get();
              }
              if (this.shouldAbort) {
                this.status = TimelineNodeStatus.ABORTED;
                return;
              }

              currentLoopIterationResults.push(...this.currentChild.getResults());
            }
          }

          this.onFinish();
        } while (loop_function && loop_function(new DataCollection(currentLoopIterationResults)));
      }
    }

    this.status = TimelineNodeStatus.COMPLETED;
  }

  private onStart() {
    if (this.description.on_timeline_start) {
      this.description.on_timeline_start();
    }
  }

  private onFinish() {
    if (this.description.on_timeline_finish) {
      this.description.on_timeline_finish();
    }
  }

  pause() {
    if (this.currentChild instanceof Timeline) {
      this.currentChild.pause();
    }
    this.status = TimelineNodeStatus.PAUSED;
  }

  private resumePromise = new PromiseWrapper();
  resume() {
    if (this.status == TimelineNodeStatus.PAUSED) {
      if (this.currentChild instanceof Timeline) {
        this.currentChild.resume();
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
      if (this.currentChild instanceof Timeline) {
        this.currentChild.abort();
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
        ? new Timeline(this.dependencies, childDescription, this, childNodeIndex)
        : new Trial(this.dependencies, childDescription, this, childNodeIndex);
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
    if (this.currentTimelineVariables?.hasOwnProperty(variable.name)) {
      return this.currentTimelineVariables[variable.name];
    }
    if (this.parent) {
      return this.parent.evaluateTimelineVariable(variable);
    }
  }

  public getParameterValue(parameterPath: string | string[], options?: GetParameterValueOptions) {
    if (
      timelineDescriptionKeys.includes(
        typeof parameterPath === "string" ? parameterPath : parameterPath[0]
      )
    ) {
      return;
    }
    return super.getParameterValue(parameterPath, options);
  }

  public getResults() {
    const results: TrialResult[] = [];
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
   * Returns the latest result that any nested trial has produced so far
   */
  public getLastResult() {
    let result: TrialResult | undefined;
    for (const child of this.children.slice().reverse()) {
      if (child instanceof Timeline) {
        result = child.getLastResult();
      } else if (child instanceof Trial) {
        result = child.getResult();
      }
      if (result) {
        return result;
      }
    }
    return undefined;
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

    return this.children.indexOf(this.currentChild) / this.children.length;
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
   * Returns `true` when `getStatus()` returns either `RUNNING` or `PAUSED`, and `false` otherwise.
   */
  public isActive() {
    return [TimelineNodeStatus.RUNNING, TimelineNodeStatus.PAUSED].includes(this.getStatus());
  }

  /**
   * Returns the currently active TimelineNode or `undefined`, if the timeline is not running. This
   * is a Trial object most of the time, but it may also be a Timeline object when a timeline is
   * running but hasn't yet instantiated its children (e.g. during timeline callback functions).
   */
  public getActiveNode(): TimelineNode {
    if (this.isActive()) {
      if (!this.currentChild) {
        return this;
      }
      if (this.currentChild instanceof Timeline) {
        return this.currentChild.getActiveNode();
      }
      if (this.currentChild instanceof Trial) {
        return this.currentChild;
      }
    }
    return undefined;
  }
}
