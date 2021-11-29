---
"jspsych": patch
---

The weights argument for `randomization.sampleWithReplacement()` is now explicitly marked as optional in TypeScript. This has no impact on usage, as the implementation was already treating this argument as optional.
