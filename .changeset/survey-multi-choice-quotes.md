---
"@jspsych/plugin-survey-multi-choice": patch
---

Fix responses not being recorded correctly when an option contains quotation marks. The response is now read from the `options` parameter instead of the radio button's `value` attribute (#3559).
