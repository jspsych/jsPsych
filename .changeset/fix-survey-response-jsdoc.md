---
"@jspsych/plugin-survey-text": patch
"@jspsych/plugin-survey-multi-choice": patch
"@jspsych/plugin-survey-multi-select": patch
---

Fix the `response` data field description, which was copied from the survey-likert plugin and incorrectly described responses as integers representing a position on a likert scale. The description now reflects what each plugin actually records: the entered text (survey-text), the selected option (survey-multi-choice), and the selected option(s) (survey-multi-select).
