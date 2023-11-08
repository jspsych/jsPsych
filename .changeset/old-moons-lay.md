---
"jspsych": minor
---

Allow trial `on_finish` methods to be asynchronous, i.e. return a `Promise`. Prior to this, promises returned by `on_finish` were not awaited before proceeding with the next trial.
