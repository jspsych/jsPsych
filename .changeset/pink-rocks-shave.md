---
"@jspsych/extension-pipe": minor
---

New extension for sending data to DataPipe. Registering it in `initJsPsych` is the whole integration: it stages each trial as it finishes, so an abandoned session can be recovered, and submits the complete dataset when the experiment ends — including after `abortExperiment()`, which a save trial never reaches.
