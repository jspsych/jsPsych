export function pressKey(key) {
  document
    .querySelector(".jspsych-display-element")
    .dispatchEvent(new KeyboardEvent("keydown", { key: key }));
  document
    .querySelector(".jspsych-display-element")
    .dispatchEvent(new KeyboardEvent("keyup", { key: key }));
}

export function mouseDownMouseUpTarget(target) {
  target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
}

export function clickTarget(target) {
  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}
