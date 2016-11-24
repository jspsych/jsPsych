if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (prefix){
    return this.slice(0, prefix.length) === prefix;
  };
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

function FormNode(parent, opt) {
	this.parent = parent;
	this.opt = opt;
	this._SEPERATE_SPACE = "<br><br>";

	if (typeof this._enumerator != "function") {
		FormNode.prototype._enumerator = function(items) {
			var html = "";
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				switch(item.type) {
					case "plainText":
					html += this._generate_plainText(item);
					break;
					case "text":
					html += this._generate_inputText(item);
					break;
					case "checkbox":
					html += this._generate_inputCheckbox(item);
					break;
					case "select":
					html += this._generate_select(item);
					break;
					case "button":
					html += this._generate_button(item);
					break;
					case "textarea":
					html += this._generate_textarea(item);
					break;
					case "fieldset":
					html += this._generate_fieldset(item);
					break;
					case "optgroup":
					html += this._generate_optgroup(item);
					break;
					case "image":
					html += this._generate_image(item);
					break;
					default: //option
					html += this._generate_option(item);
					break;
				}
			}
			return html;
		}
	}	

	if (typeof this._repr_display_info != "function") {
		FormNode.prototype._repr_display_info = function(display_info, label) {
			var html = "";
			if (typeof display_info == "object") {
				html = this._generate_image(display_info);
			} else {
				html = display_info;
			}
			return html;
		};
	}


	if (typeof this._generate != "function") {
		FormNode.prototype._generate = function(opt) {
			title = opt.title || "Form Title";
			bodyFontSize = opt.bodyFontSize || "120%";
			bodyBGColor = opt.bodyBGColor || "white";
			bodyBGImg = opt.bodyBGImg || "";

			inputFontSize = opt.inputFontSize || "80%";
			inputBGColor = opt.inputBGColor || "white";

			html = '<style type="text/css"> body {font-size:{0}; background-image:{1}; background-color:{2};}'.format(bodyFontSize, bodyBGImg, bodyBGColor) + 
				   'textarea {width: 50; height: 30;} input, select, textarea{font-size:{0}; background-color:{1}}</style>'.format(
				   	inputFontSize, inputBGColor) +
				   '<caption>{0}</caption><br><br><form>'.format(title);
			return html + this._enumerator(opt.items) + "</form>"
		};
	}

	if (typeof this.render != "function") {
		FormNode.prototype.render = function() {
			$(this.parent).html(this._generate(this.opt));
		}
	}

	if (typeof this._generate_plainText != "function") {
		FormNode.prototype._generate_plainText = function(item) {
			newline = item.newline || false;
			html = item.display_info + ((newline) ? this._SEPERATE_SPACE : "");

			return html;
		}
	}

	if (typeof this._generate_image != "function") {
		FormNode.prototype._generate_image = function(item) {
			newline = item.newline || false;
			name = item.name || "Image";
			height = item.height || "3%";
			width = item.width || "3%";
			src = item.src;

			html = '<img src="{0}" alt="{1}" height="{2}" width="{3}">'.format(src, name, height, width);

			return html + ((newline) ? this._SEPERATE_SPACE : "");
		};
	}

	if (typeof this._generate_inputText != "function") {
		FormNode.prototype._generate_inputText = function(item) {
			newline = item.newline || false;
			display_info = item.display_info + ((newline) ? "<br>" : "\t");

			type = item.type;
			name = item.name;
			
			value = item.value || "";
			disabled = (item.disabled) ? 'disabled="disabled"' : "";
			maxlength = item.maxlength || "";
			readonly = (item.readonly) ? 'readonly="readonly"' : "";
			required = (item.required) ? 'required="required"' : "";
			autofocus = (item.autofocus) ? 'autofocus="autofocus"' : "";
			size = item.size || "";

			html = display_info + '<input type="{0}" name="{1}" value="{2}" maxlength="{3}" size="{4}" {5} {6} {7} {8}>{9}'.format(
				type, name, value, maxlength, size, readonly, required, disabled, autofocus, this._SEPERATE_SPACE
				);

			return html;
		};
	}

	if (typeof this._generate_inputCheckbox != "function") {
		FormNode.prototype._generate_inputCheckbox = function(item) {
			id = 'checkbox_' + item.name;
			label = item.label || true;
			front = item.front || false;
			display_info = this._repr_display_info(item.display_info);
			display_info = (label) ? '<label for="' + id + '">' + display_info + '</label>' : display_info;
			type = item.type;
			name = item.name;
			value = item.value || "";
			checked = (item.checked) ? 'checked="checked"' : "";
			newline = item.newline || true;

			disabled = (item.disabled) ? 'disabled="disabled"' : "";
			readonly = (item.readonly) ? 'readonly="readonly"' : "";
			required = (item.required) ? 'required="required"' : "";
			autofocus = (item.autofocus) ? 'autofocus="autofocus"' : "";

			html = '<input type="{0}" id="{1}" name="{2}" value="{3}" {4} {5} {6} {7} {8}>'.format(
				type, id, name, value, readonly, required, disabled, checked, autofocus
				);

			html = (front) ? display_info + html : html + display_info; 

			return html + ((newline) ? this._SEPERATE_SPACE : "");
		};
	}

	if (typeof this._generate_option != "function") {
		FormNode.prototype._generate_option = function(item) {
			value = item.value;
			selected = (item.selected) ? 'selected="selected"' : "";
			disabled = (item.disabled) ? 'disabled="disabled"' : "";

			html = '<option value="{0}" {1} {2}>{3}</option>'.format(value, disabled, selected, value);

			return html;
		};
	}

	if (typeof this._generate_optgroup != "function") {
		FormNode.prototype._generate_optgroup = function(item) {
			label = item.label;
			disabled = (item.disabled) ? 'disabled="disabled"' : "";

			html = '<optgroup label="{0} {1}">'.format(label, disabled);

			return html + this._enumerator(item.options); + '</optgroup>';
		};
	}

	if (typeof this._generate_select != "function") {
		FormNode.prototype._generate_select = function(item) {
			name = item.name;
			size = item.size || "";
			multiply = (item.multiply) ? 'multiply="multiply"' : "";

			disabled = (item.disabled) ? 'disabled="disabled"' : "";
			required = (item.required) ? 'required="required"' : "";
			autofocus = (item.autofocus) ? 'autofocus="autofocus"' : "";

			html = '<select name="{0}" size="{1}" {2} {3} {4} {5}>'.format(name, size, multiply, disabled, required, autofocus);
			
			return html + this._enumerator(item.options) + '</select>' + this._SEPERATE_SPACE;
		};
	}

	if (typeof this._generate_button != "function") {
		FormNode.prototype._generate_button = function(item) {
			name = item.name;
			buttonType = item.buttonType || "button";
			value = item.value;
			display_info = item.display_info || "Click me!";

			disabled = (item.disabled) ? 'disabled="disabled"' : "";
			autofocus = (item.autofocus) ? 'autofocus="autofocus"' : "";

			html = '<button name="{0}" type="{1}" value="{2}" {3} {4}>{5}</button>{6}'.format(
				name, buttonType, value, disabled, autofocus, display_info, this._SEPERATE_SPACE
				);

			return html;
		};
	}

	if (typeof this._generate_textarea != "function") {
		FormNode.prototype._generate_textarea = function(item) {
			name = item.name || "";
			placeholder = item.placeholder || "This is a textarea.";
			cols = item.cols || "30";
			rows = item.rows || "10";

			disabled = (item.disabled) ? 'disabled="disabled"' : "";
			maxlength = item.maxlength || "";
			readonly = (item.readonly) ? 'readonly="readonly"' : "";
			required = (item.required) ? 'required="required"' : "";
			autofocus = (item.autofocus) ? 'autofocus="autofocus"' : "";
			wrap = (item.wrap) ? 'wrap="' + item.wrap + '" ' : "";

			html = '<textarea name="{0}" rows="{1}" cols="{2}" placeholder="{3}" maxlength="{4}" {5} {6} {7} {8} {9}></textarea>{10}'.format(
				name, rows, cols, placeholder, maxlength, readonly, required, disabled, autofocus, wrap, this._SEPERATE_SPACE
				);

			return html;
		};
	}

	if (typeof this._generate_fieldset != "function") {
		FormNode.prototype._generate_fieldset = function(item) {
			name = item.name || "";
			legend = item.legend || "Fieldset";
			insideItems = item.insideItems;

			disabled = (item.disabled) ? 'disabled="disabled"' : "";
			
			html = '<fieldset name="{0}" {1}><legend>{2}</legend>'.format(name, disabled, legend);

			return html + this._enumerator(insideItems) + '</fieldset>' + this._SEPERATE_SPACE;
		};
	}


}