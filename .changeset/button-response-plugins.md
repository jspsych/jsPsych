---
"@jspsych/plugin-audio-button-response": major
"@jspsych/plugin-canvas-button-response": major
"@jspsych/plugin-html-button-response": major
"@jspsych/plugin-image-button-response": major
"@jspsych/plugin-video-button-response": major
---

- Make `button_html` a function parameter which, given a choice's text and its index, returns the HTML string of the choice's button. If you were previously passing a string to `button_html`, like `<button>%choice%</button>`, you can now pass the function
  ```js
  function (choice) {
    return '<button class="jspsych-btn">' + choice + "</button>";
  }
  ```
  Similarly, if you were using the array syntax, like
  ```js
  ['<button class="a">%choice%</button>', '<button class="b">%choice%</button>', '<button class="a">%choice%</button>']
  ```
  an easy way to migrate your trial definition is to pass a function which accesses your array and replaces the `%choice%` placeholder:
  ```js
  function (choice, choice_index) {
    return ['<button class="a">%choice%</button>', '<button class="b">%choice%</button>', '<button class="a">%choice%</button>'][choice_index].replace("%choice%", choice);
  }
  ```
  From there on, you can further simplify your function. For instance, if the intention of the above example is to have alternating button classes, the `button_html` function might be rewritten as
  ```js
  function (choice, choice_index) {
    return '<button class="' + (choice_index % 2 === 0 ? "a" : "b") + '">' + choice + "</button>";
  }
  ```
- Simplify the button DOM structure and styling: Buttons are no longer wrapped in individual container `div`s for spacing and `data-choice` attributes. Instead, each button is assigned its `data-choice` attribute and all buttons are direct children of the button group container `div`. The container `div`, in turn, utilizes a flexbox layout to position the buttons.
