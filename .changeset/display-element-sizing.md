---
"jspsych": patch
---

Add `width: 100%` and `height: 100%` to `.jspsych-content` CSS to allow plugins to use percentage-based dimensions. This enables plugins to use `height: 100%` and `width: 100%` to fill the display element. The nested DOM structure (`.jspsych-display-element` > `.jspsych-content-wrapper` > `.jspsych-content`) is preserved to maintain compatibility with the progress bar and existing plugins.
