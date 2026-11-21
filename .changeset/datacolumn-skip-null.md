---
"jspsych": patch
---

`DataColumn` `median()`, `min()`, `max()`, `variance()` and `sd()` now skip `null` and `undefined` values, like `mean()` does, so missing responses (e.g. `rt: null`) no longer skew the results (#3740).
