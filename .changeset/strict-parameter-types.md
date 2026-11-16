---
"jspsych": major
---

Trials now throw an error, instead of logging a warning, when a parameter value does not match the type declared in the plugin's `info` object (`BOOL`, `STRING`, `HTML_STRING`, `KEY`, `KEYS`, `IMAGE`, `AUDIO`, `VIDEO`, `INT`, `FLOAT`, `FUNCTION`), when a `SELECT` parameter's value is not one of its `options`, and when a `SELECT` parameter has no `options` array. Float values for `INT` parameters are still truncated to an integer with a warning. `null` values are accepted for parameters of any type, so a `SELECT` parameter set to `null` no longer logs a warning.
