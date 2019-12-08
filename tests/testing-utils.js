exports.pressKey = function(key){
  document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keydown', {keyCode: key}));
  document.querySelector('.jspsych-display-element').dispatchEvent(new KeyboardEvent('keyup', {keyCode: key}));
}

exports.mouseDownMouseUpTarget = function(target){
  target.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
  target.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
}

exports.clickTarget = function(target){
	target.dispatchEvent(new MouseEvent('click', {bubbles: true}));
}
