exports.pressKey = function(key){
  document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: key}));
  document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: key}));
}

exports.clickTarget = function(target){
  target.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, detail: {target: target}}));
  target.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, detail: {target: target}}));
}
