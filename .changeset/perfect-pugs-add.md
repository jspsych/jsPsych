---
"jspsych": patch
---

Fixed a bug in `randomization.shuffleNoRepeats()` where having an `equalityFunction` that used a logical OR could result in some neighboring elements still evaluating to `true` via `equalityFunction`.
