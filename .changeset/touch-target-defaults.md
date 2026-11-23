---
"jspsych": major
---

Increased the default size of buttons and text inputs in `jspsych.css`. `.jspsych-btn` now uses a 16px font and 12px/16px padding, computing to roughly 48px tall where it previously computed to roughly 38px. This clears the 44px minimum target size given by WCAG 2.5.5 and the Apple Human Interface Guidelines on every device, without a separate rule for touch pointers. Text inputs are raised from 14px to 16px for the same reason, and because iOS Safari zooms the viewport when a field below 16px receives focus.

This is a breaking change: it alters the rendered appearance of every existing experiment that uses `jspsych.css`. Because button size can affect motor response times, experiments partway through data collection should not upgrade. Experiments that need the previous sizing can restore it by overriding `.jspsych-btn` and `.jspsych-display-element input[type="text"]`; see the v9 migration guide.
