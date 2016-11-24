var Test = function(display_element, choices, inputs) {
	var std_frame = {};
	var box = iatFrameBox(display_element);
	for (var i = 0; i < choices.length; i++) {
		choices[i] = Choice(box, i, choices[i]);
	}

	var stimulus = Stimulus(box, inputs);

	var result = Image(box, "result", {
		content: ["./redX.png"],
		visibility: "hidden",
		"margin-top": "10%"
	})

	box.result = result; // ***Need IMPROVE

	var instruction = Text(box, "instruction", {
		content: [],
		"margin-top": "10%"
	});

	std_frame.render = function() {
		box.render();
		choices[0].render();
		choices[1].render();
		stimulus.render();
		result.render();
		instruction.render();

		for (var key in box.choices) { // ***Need IMPROVE
			box.choices[key].bind(stimulus);
		}
	};

	return std_frame;
};


function iatFrameBox(display_element, opt = {}) {
	var box = {};
	box.id = 'iatFrameBox';
	box.display_element = display_element;
	box.current_height = opt.height || 600;
	box.current_width = opt.width || "50%";
	box.choices = []; // ***Need IMPROVE
	box.current_stimulus = {}; // ***Need IMPROVE

	box.generate = function(opt) {
		var borderStyle = opt.border || "solid";
		var color = opt.color || "#000000";

		var html_t = '<div id="' + box.id + '" style="margin-left:auto;margin-right:auto;border:' + borderStyle +
			';color:' + color + ';width:' + box.current_width + ';height:' +
			box.current_height + '"</div>'

		return html_t;
	};

	box.html = box.generate(opt);

	box.render = function() {
		$(box.display_element).append(box.html);
	};

	// ***Need IMPROVE
	// Something is wrong with jquery $().height()
	/*
		box.resizeBoxHeight = function(elemId, sameline = 0) {
			if (sameline) return null;

			maxheight = "1500px";
			box.current_height += $("#" + elemId).height() + $("#" + elemId).innerHeight();
			$("#" + box.id).css("height", (box.current_height > maxheight ? maxheight : box.current_height));
		}
	*/

	return box;
}

function Choice(box, side, dict, opt = {}) {
	// side 0 = left, 1 = right

	var b = {};
	b.id = (!side) ? "lb" : "rb";
	b.side = side;
	for (var key in dict) {
		b.bindKey = key;
		b.bindValue = dict[key];
	}
	b.parentId = box.id;
	b.descripId = (!side) ? "lbd" : "rbd";
	b.marginSide = (!side) ? "margin-left" : "margin-right";
	b.textAlign = (!side) ? "float:left;text-align:left;" : "float:right;text-align:right;";

	b.bind = function(stim) { // ***Need IMPROVE
		$("body").keypress(function(e) {
			var key = e.which;
			if (key == keylookup[b.bindKey.toLowerCase()]) {
				stim.check(b.side);
			}
		})
	};

	b.generate = function(opt) {
		var fontSize = opt["font-size"] || '';
		var fontWeight = opt["font-weight"] || '';
		var fontFamily = opt["font-family"] || '';
		var fontColor = opt["color"] || "#000000";

		var html_t = '<div id="' + b.id + '" style="' + b.textAlign + 'height:auto;width:50%;">' +
			'<p  style="' + b.marginSide + ': 10%">' + 'Press "' + b.bindKey + '" for:</p>' +
			'<p id="' + b.descripId + '" style="' + b.marginSide + ': 5%;color:' + fontColor +
			';font-size:' + fontSize + ';font-family:' + fontFamily + ';font-weight:' + fontWeight +
			'">' + b.bindValue + '</p>' + '</div>';

		return html_t;
	};

	b.html = b.generate(opt)

	b.render = function() {
		$("#" + box.id).append(b.html);
		//box.resizeBoxHeight(b.id, ((!side) ? 0 : 1));
	}

	b.config = function(id, attr, value) {
		$("#" + id).css(attr, value);
	};

	box.choices.push(b); // ***Need IMPROVE

	return b;
}

function Image(box, id, opt) {
	var img = {};
	img.id = id;
	img.content_id = id + "_content_id";

	img.generate = function(opt) {
		var width = opt.width || 50;
		var height = opt.height || 50;
		var fromTop = opt["margin-top"] || "20%";
		var visibility = opt.visibility || "visible";
		var src = opt.content[0] || "";

		html_t = '<div id="' + img.id + '" style="text-align:center;margin-top:' + fromTop + ';visibility:' + visibility + '">' +
			'<p><img id="' + img.content_id + '" src="' + src + '" width="' + width + '" height="' + height + '"/></p>';

		return html_t;
	};

	img.html = img.generate(opt);

	img.render = function() {
		$("#" + box.id).append(img.html);
		//box.resizeBoxHeight(img.id);
	};

	img.change_content = function(value) {
		$("#" + img.content_id).attr("src", value);
	};

	img.show = function() {
		$("#" + img.id).css("visibility", "visible");
	};

	img.hide = function() {
		$("#" + img.id).css("visibility", "hidden");
	};

	return img;
}


function Text(box, id, opt) {
	var text = {};
	text.id = id;
	text.content_id = id + "_content_id";

	text.generate = function(opt) {
		var fromTop = opt["margin-top"] || "20%";
		var fontSize = opt["font-size"] || '';
		var fontWeight = opt["font-weight"] || '';
		var fontFamily = opt["font-family"] || '';
		var fontColor = opt["color"] || "#000000";
		var content = opt.content[0] || "If you make a mistake, a red X will appear. Press any other key to continue";

		html_t = '<div id="' + text.id + '" style="text-align:center;margin-top:' + fromTop + ';color:' + fontColor +
			';font-size:' + fontSize + ';font-family:' + fontFamily + ';font-weight:' + fontWeight +
			'"><p id="' + text.content_id + '">' + content + '</p></div>';

		return html_t;
	}

	text.html = text.generate(opt);

	text.change_content = function(value) {
		$("#" + text.content_id).text(value);
	};

	text.render = function() {
		$("#" + box.id).append(text.html);
		//box.resizeBoxHeight(text.id);
	};

	return text;
}


// ***Need IMPROVE
function Stimulus(box, inputs) {
	var sti = {};
	
	var set_pointer = function() {
		if (sti.array[sti.prt].type == 'img') {
			box.current_stimulus = Image(box, "stimulus", sti.array[sti.prt]);
		} else {
			box.current_stimulus = Text(box, "stimulus", sti.array[sti.prt]);
		}
		box.current_stimulus.expected = sti.array[sti.prt].content[1];
	};

	var _constructor = (function() {
		sti.array = inputs;
		sti.prt = 0;
		set_pointer();
	})();
	

	sti.render = function() {
		box.current_stimulus.render();
	}

	sti.next = function() { // ***Need IMPROVE
		++sti.prt;
		if (sti.prt > sti.array.length - 1) {
			alert("No next stimulus!");
		} else {
			set_pointer()
			box.current_stimulus.html = box.current_stimulus.generate(sti.array[sti.prt]);
			$("#" + box.current_stimulus.id).html(box.current_stimulus.html);
		}
	};

	sti.check = function(side) { // ***Need IMPROVE
		if (side != box.current_stimulus.expected) {
			box.result.show();
			$(box.display_element).keypress(function(e) {
				if (e.which !== 101 && e.which !== 105 && sti.prt < sti.array.length) {
					box.result.hide();
					sti.next();
				}
			})
		} else {
			sti.next();
		}
	};

	return sti;
}

var keylookup = {
	'a': 97,
	'b': 98,
	'c': 99,
	'd': 100,
	'e': 101,
	'f': 102,
	'g': 103,
	'h': 104,
	'i': 105,
	'j': 106,
	'k': 107,
	'l': 108,
	'm': 109,
	'n': 110,
	'o': 111,
	'p': 112,
	'q': 113,
	'r': 114,
	's': 115,
	't': 116,
	'u': 117,
	'v': 118,
	'w': 119,
	'x': 120,
	'y': 121,
	'z': 122,
	'A': 97,
	'B': 98,
	'C': 99,
	'D': 100,
	'E': 101,
	'F': 102,
	'G': 103,
	'H': 104,
	'I': 105,
	'J': 106,
	'K': 107,
	'L': 108,
	'M': 109,
	'N': 110,
	'O': 111,
	'P': 112,
	'Q': 113,
	'R': 114,
	'S': 115,
	'T': 116,
	'U': 117,
	'V': 118,
	'W': 119,
	'X': 120,
	'Y': 121,
	'Z': 122,
};