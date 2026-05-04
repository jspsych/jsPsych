---
"jspsych": minor
---

Add `record_session` option to `initJsPsych` for high-fidelity replay capture. When enabled, `jsPsych.getSessionRecording()` returns a JSON-serializable `SessionRecording` (`schema_version: 1`) capturing per-trial DOM snapshots and mutations, mouse/touch/keyboard/clipboard/scroll/form input, media events, viewport changes, stylesheets, canvas pixel snapshots, and every `Math.random()` output. `jsPsych.getSessionRecordingCompressed()` returns the same data as a gzip Blob. Default is `false`; opt-in only.
