---
"@jspsych/plugin-html-button-response": major
"jspsych": patch
---

Button plugins now support either `display: grid` or `display: flex` on the container element that hold the buttons. If the layout is `grid`, the number of rows and/or columns can be specified. The `margin_horizontal` and `margin_vertical` parameters have been removed from the button plugins. If you need control over the button CSS, you can add inline style to the button element using the `button_html` parameter.
 
jspsych.css has new layout classes to support this feature.
