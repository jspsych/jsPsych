---
"@jspsych/plugin-survey-multi-choice": patch
---

Record the chosen option correctly when it contains a double quote. Previously the response was cut off at the quote, or saved as an empty string when the option started with one (#3559).
