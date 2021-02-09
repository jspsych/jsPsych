exports.pressKey = function(key){
  document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {key: key}));
  document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {key: key}));
}

exports.mouseDownMouseUpTarget = function(target){
  target.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
  target.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
}

exports.clickTarget = function(target){
	target.dispatchEvent(new MouseEvent('click', {bubbles: true}));
}
