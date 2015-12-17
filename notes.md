Major things that are changing for revision that will be noticeable.

- no more chunk type parameter
- timeline parameter controls whether node is trial or timeline.
- one trial per declaration, no more built-in shortcut to declare a big block
- allow declaring default iti in jspsych.init
- pass trial data to experiment wide on_trial_finish() event handler
- trial_index is now a global trial index, local trial index removed.
- can declare any parameter at the node level, and then it is applied to all nested objects below that.
- progress bar behaves differently
- lots of small plugin parameter changes
