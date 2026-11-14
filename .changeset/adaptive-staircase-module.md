---
"jspsych": minor
---

Add the `jsPsych.adaptive` module with `createStaircase()` and `createInterleaved()` for adaptive staircase procedures (n-up/m-down rules, unequal and shrinking step sizes, bounds, stopping rules, ascending-with-discontinue for span tasks, and interleaved tracks that use the seeded random number generator). Procedures share a common `AdaptiveProcedure` interface, so later procedures (such as QUEST) can be added and interleaved with staircases without changing the existing API.
