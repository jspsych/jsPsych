import { DataCollection } from "../modules/data/DataCollection";
import {
  repeat,
  sampleWithReplacement,
  sampleWithoutReplacement,
  shuffle,
  shuffleAlternateGroups,
} from "../modules/randomization";
import { SessionRecorder } from "../modules/resume";
import { TimelineNode } from "./TimelineNode";
import { Trial } from "./Trial";
import { PromiseWrapper } from "./util";
import {
  TimelineArray,
  TimelineDescription,
  TimelineNodeDependencies,
  TimelineNodeStatus,
  TimelineVariable,
  TrialDescription,
  TrialResult,
  isTimelineDescription,
  isTrialDescription,
} from ".";

export class Timeline extends TimelineNode {
  public readonly children: TimelineNode[] = [];
  public readonly description: TimelineDescription;

  constructor(
    dependencies: TimelineNodeDependencies,
    description: TimelineDescription | TimelineArray,
    public readonly parent?: Timeline
  ) {
    super(dependencies);
    this.description = Array.isArray(description) ? { timeline: description } : description;
    this.initializeParameterValueCache();
  }

  private currentChild?: TimelineNode;
  private shouldAbort = false;

  public async run() {
    if (typeof this.index === "undefined") {
      // We're the first timeline node to run. Otherwise, another node would have set our index
      // right before running us.
      this.index = 0;
    }

    this.status = TimelineNodeStatus.RUNNING;

    const { conditional_function, loop_function, repetitions = 1 } = this.description;

    const recorder = this.dependencies.getSessionRecorder?.();

    // Generate initial timeline variable order so the first set of timeline variables is already
    // available to the `on_timeline_start` and `conditional_function` callbacks
    let timelineVariableOrder = this.getTimelineVariableOrder(recorder);
    this.setCurrentTimelineVariablesByIndex(timelineVariableOrder[0]);
    let isInitialTimelineVariableOrder = true; // So we don't regenerate the order in the first iteration

    let currentLoopIterationResults: TrialResult[];

    if (this.evaluateConditionalFunction(conditional_function, recorder)) {
      this.onStart();

      for (let repetition = 0; repetition < repetitions; repetition++) {
        do {
          currentLoopIterationResults = [];

          // Generate a new timeline variable order in each iteration except for the first one where
          // it has been done before
          if (isInitialTimelineVariableOrder) {
            isInitialTimelineVariableOrder = false;
          } else {
            timelineVariableOrder = this.getTimelineVariableOrder(recorder);
          }

          for (const timelineVariableIndex of timelineVariableOrder) {
            this.setCurrentTimelineVariablesByIndex(timelineVariableIndex);

            for (const childNodeDescription of this.description.timeline) {
              const childNode = this.instantiateChildNode(childNodeDescription);

              const previousChild = this.currentChild;
              this.currentChild = childNode;
              childNode.index = previousChild
                ? previousChild.getLatestNode().index + 1
                : this.index;

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
        } while (this.evaluateLoopFunction(loop_function, currentLoopIterationResults, recorder));
      }

      this.onFinish();
    }

    this.status = TimelineNodeStatus.COMPLETED;
  }

  /**
   * Returns the timeline variable order to be used for the next iteration. When a saved session is
   * being replayed, the order is taken from the session log instead of being generated anew.
   */
  private getTimelineVariableOrder(recorder?: SessionRecorder) {
    if (!recorder) {
      return this.generateTimelineVariableOrder();
    }

    if (recorder.isReplaying()) {
      const entry = recorder.consume("tv-order");
      if (entry) {
        return entry.order;
      }
    }

    const order = this.generateTimelineVariableOrder();
    recorder.record({ type: "tv-order", order });
    return order;
  }

  /**
   * Evaluates the timeline's `conditional_function`. When a saved session is being replayed, the
   * logged outcome is used and the user's function is not invoked.
   */
  private evaluateConditionalFunction(
    conditional_function: TimelineDescription["conditional_function"],
    recorder?: SessionRecorder
  ) {
    if (!conditional_function) {
      return true;
    }

    if (!recorder) {
      return Boolean(conditional_function());
    }

    if (recorder.isReplaying()) {
      const entry = recorder.consume("conditional");
      if (entry) {
        return entry.result;
      }
    }

    const result = Boolean(conditional_function());
    recorder.record({ type: "conditional", result });
    return result;
  }

  /**
   * Evaluates the timeline's `loop_function`. When a saved session is being replayed, the logged
   * outcome is used and the user's function is not invoked.
   */
  private evaluateLoopFunction(
    loop_function: TimelineDescription["loop_function"],
    currentLoopIterationResults: TrialResult[],
    recorder?: SessionRecorder
  ) {
    if (!loop_function) {
      return false;
    }

    if (!recorder) {
      return Boolean(loop_function(new DataCollection(currentLoopIterationResults)));
    }

    if (recorder.isReplaying()) {
      const entry = recorder.consume("loop");
      if (entry) {
        return entry.result;
      }
    }

    const result = Boolean(loop_function(new DataCollection(currentLoopIterationResults)));
    recorder.record({ type: "loop", result });
    return result;
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

  private instantiateChildNode(
    childDescription: TimelineDescription | TimelineArray | TrialDescription
  ) {
    const newChildNode = isTimelineDescription(childDescription)
      ? new Timeline(this.dependencies, childDescription, this)
      : new Trial(this.dependencies, childDescription, this);

    this.children.push(newChildNode);
    return newChildNode;
  }

  private currentTimelineVariables: Record<string, any>;
  private setCurrentTimelineVariablesByIndex(index: number | null) {
    this.currentTimelineVariables = {
      ...this.parent?.getAllTimelineVariables(),
      ...(index === null ? undefined : this.description.timeline_variables[index]),
    };
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

  /**
   * Returns the current values of all timeline variables, including those from parent timelines
   */
  public getAllTimelineVariables() {
    return this.currentTimelineVariables;
  }

  public evaluateTimelineVariable(variable: TimelineVariable) {
    if (this.currentTimelineVariables?.hasOwnProperty(variable.name)) {
      return this.currentTimelineVariables[variable.name];
    }
    throw new Error(`Timeline variable ${variable.name} not found.`);
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
   * Returns the naive progress of the timeline (as a fraction), without considering conditional or
   * loop functions.
   */
  public getNaiveProgress() {
    if (this.status === TimelineNodeStatus.PENDING) {
      return 0;
    }

    const activeNode = this.getLatestNode();
    if (!activeNode) {
      return 1;
    }

    let completedTrials = activeNode.index;
    if (activeNode.getStatus() === TimelineNodeStatus.COMPLETED) {
      completedTrials++;
    }

    return Math.min(completedTrials / this.getNaiveTrialCount(), 1);
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
        let conditionCount = description.timeline_variables?.length || 1;

        switch (description.sample?.type) {
          case "with-replacement":
          case "without-replacement":
            conditionCount = description.sample.size;
            break;

          case "fixed-repetitions":
            conditionCount *= description.sample.size;
            break;

          case "alternate-groups":
            conditionCount = description.sample.groups
              .map((group) => group.length)
              .reduce((a, b) => a + b, 0);
            break;
        }

        return (
          getTimelineArrayTrialCount(description.timeline) *
          (description.repetitions ?? 1) *
          conditionCount
        );
      }
      return 0;
    };

    return getTrialCount(this.description);
  }

  public getLatestNode() {
    return this.currentChild?.getLatestNode() ?? this;
  }

  public getActiveTimelineByName(name: string) {
    if (this.description.name === name) {
      return this;
    }

    return this.currentChild?.getActiveTimelineByName(name);
  }
}
