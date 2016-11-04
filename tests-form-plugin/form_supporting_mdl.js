// track unique ids for each element
var __INPUT_BUTTON = 0; //working on
var __INPUT_CHECKBOX = 0; //working on
var __INPUT_COLOR = 0; //working on
var __INPUT_DATE = 0;
var __INPUT_DATETIME = 0;
var __INPUT_DATETIME_LOCAL = 0;
var __INPUT_EMAIL = 0;
var __INPUT_FILE = 0; //working on
var __INPUT_HIDDEN = 0; //working on ?
var __INPUT_IMAGE = 0; //working on
var __INPUT_MONTH = 0;
var __INPUT_NUMBER = 0;
var __INPUT_PASSWORD = 0;
var __INPUT_RADIO = 0; //working on
var __INPUT_RANGE = 0; //working on
var __INPUT_RESET = 0; //working on
var __INPUT_SEARCH = 0; //working on
var __INPUT_SUBMIT = 0; //working on
var __INPUT_TEL = 0;
var __INPUT_TEXT = 0;
var __INPUT_TIME = 0;
var __INPUT_URL = 0;
var __INPUT_WEEK = 0;

var __BUTTON = 0;
var __FIELDSET = 0; //working on
var __IMAGE = 0; //working on?
var __PLAIN_TEXT = 0; //working on? 
var __SELECT = 0; //working on
var __TEXTAREA = 0; 


if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(prefix) {
		return this.slice(0, prefix.length) === prefix;
	};
}

if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

function inherit(proto) {
	function F() {}
	F.prototype = proto;
	return new F;
}

function Tag(parent_id, opt) {
	// standard attributs
	this.parent_id = parent_id;

	this.label = opt.label || "";
	this.value = opt.value || "";

	//default settings
	this.newline = (opt.newline == false) ? false : true;
	this.disabled = (opt.disabled) ? 'disabled="disabled"' : "";
	this.maxlength = opt.maxlength || "";
	this.readonly = (opt.readonly) ? 'readonly="readonly"' : "";
	this.required = (opt.required) ? 'required="required"' : "";
	this.autofocus = (opt.autofocus) ? 'autofocus="autofocus"' : "";
	this.size = opt.size || "";

	this.html = "";
}
Tag.prototype = {
	render: function() {
		if (this.newline)
			this.html = "<p>" + this.html
		$("#{0}".format(this.parent_id)).append(this.html);
	}
}


function Button(parent_id, item={}) {
	Tag.call(this, parent_id, item);

	//MDL style
	this.addon = ""
	this.raise = (item.raise == false) ? false : true;
	this.fab = (item.fab) || false;
	this.minifab = (item.minifab) || false;
	this.iconButton = (item.iconButton) || false;
	if (this.raise) {
		this.addon += " mdl-button--raised";
	} else if (this.fab) {
		this.addon += " mdl-button--fab";
	} else if (this.minifab) {
		this.addon += " mdl-button--mini-fab";
	} else {
		this.addon += " mdl-button--icon"
	}

	this.color = item.color || true;
	this.addon += ((this.color) ? " mdl-button--colored" : "");
	this.primary = item.primary || false;
	this.addon += ((this.primary) ? " mdl-button--primary" : "");
	this.accent = item.accent || false;
	this.addon += ((this.accent) ? " mdl-button--accent" : "");
	this.ripple = item.ripple || true;
	this.addon += ((this.ripple) ? " mdl-js-ripple-effect" : "");

	this.style = "mdl-button mdl-js-button" + this.addon;


	this.label = item.label || "Button";
	this.value = item.value || "";
	this.type = item.type || "button";
	this.onclick = item.onclick || "";
	this.id = "{0}_{1}".format(this.type, __BUTTON++);

	this.icon = item.icon || "";
	if (this.icon != "")
		this.icon = '<i class="material-icons">{0}</i>'.format(this.icon);
	
	this.html = '<div><button class="{0}" id="{1}" type="{2}" value="{3}"" {4} form="{5}" onclick="{6}">{7}{8}</button></div>'.format(
		this.style, this.id, this.type, this.value, this.disabled, this.parent_id, this.onclick, this.icon, this.label);

	this.render();
}
Button.prototype = inherit(Tag.prototype);


function InputTextField(parent_id, item) {
	Tag.call(this, parent_id, item);

	//MDL style
	this.expandable = item.expandable || false;
	this.expandable = (this.expandable) ? " mdl-textfield--expandable" : "";
	this.floating = item.floating || false;
	this.floating = (this.floating) ? " mdl-textfield--floating-label" : "";
	this.style = "mdl-textfield mdl-js-textfield{0}{1}".format(this.expandable, this.floating);

	this.icon = item.icon || "";
	this.pattern = item.pattern || ".*";
	this.errorInfo = item.errorInfo || "Your input is not in a {0} form!".format(this.type);

	//attributes
	this.accessKey = item.accessKey || "";
	this.defaultValue = item.defaultValue || "";
	this.alt = item.alt || "";
	this.tabIndex = item.tabIndex || "";
}
InputTextField.prototype = inherit(Tag.prototype);
InputTextField.prototype._generate = function() {
	var component = '<input class="mdl-textfield__input" type="{0}" id="{1}" maxlength="{2}" size="{3}" {4} {5} pattern="{6}" {7} {8} {9} {10} {11} {12} value="{13}" form="{14}">'.format(
			this.type, this.id, this.maxlength, this.size, this.required, this.readonly, this.pattern, this.disabled, this.autofocus, this.accessKey, this.alt, this.defaultValue, this.tabIndex, this.value, this.parent_id) +
		'<label class="mdl-textfield__label" for="{0}">{1}</label>'.format(this.id, this.label) +
		'<span class="mdl-textfield__error">{0}</span>'.format(this.errorInfo);

	if (this.expandable != "")
		component = '<div class="mdl-textfield__expandable-holder">' + component + '</div>';

	if (this.icon != "")
		component = '<label class="mdl-button mdl-js-button mdl-button--icon" for="{0}"><i class="material-icons">{1}</i></label>'.format(this.id, this.icon) + component;

	return '<div class="{0}">{1}<div>'.format(this.style, component);
};

function InputDate(parent_id, item={}) {
	this.type = "date";
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_DATE++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputDate.prototype = inherit(InputTextField.prototype);

function InputDatetime(parent_id, item={}) {
	this.type = "datetime";
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_DATETIME++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputDatetime.prototype = inherit(InputTextField.prototype);

function InputDatetimeLocal(parent_id, item={}) {
	this.type = "datetime-local";
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_DATETIME_LOCAL++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputDatetimeLocal.prototype = inherit(InputTextField.prototype);

function InputEmail(parent_id, item={}) {
	this.type = "email";
	item.floating = (item.floating == false) ? false : true;
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_EMAIL++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter you email...";

	this.html = this._generate();
	this.render();
}
InputEmail.prototype = inherit(InputTextField.prototype);


function InputMonth(parent_id, item={}) {
	this.type = "month";
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_MONTH++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputMonth.prototype = inherit(InputTextField.prototype);

function InputNumber(parent_id, item={}) {
	this.type = "number";
	item.floating = (item.floating == false) ? false : true;
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_NUMBER++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter a number...";

	this.html = this._generate();
	this.render();
}
InputNumber.prototype = inherit(InputTextField.prototype);

function InputPassword(parent_id, item={}) {
	this.type = "password";
	item.floating = (item.floating == false) ? false : true;
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_PASSWORD++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter your password...";

	this.html = this._generate();
	this.render();
}
InputPassword.prototype = inherit(InputTextField.prototype);

function InputTel(parent_id, item={}) {
	this.type = "tel";
	item.floating = (item.floating == false) ? false : true;
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_TEL++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter your telephone number...";

	this.html = this._generate();
	this.render();
}
InputTel.prototype = inherit(InputTextField.prototype);

function InputText(parent_id, item={}) {
	this.type = "text";
	item.floating = (item.floating == false) ? false : true;
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_TEXT++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter some texts...";
	this.errorInfo = item.errorInfo || "Your input is not in required form!";

	this.html = this._generate();
	this.render();
}
InputText.prototype = inherit(InputTextField.prototype);

function InputTime(parent_id, item={}) {
	this.type = "time";
	item.floating = (item.floating == false) ? false : true;
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_TIME++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputTime.prototype = inherit(InputTextField.prototype);

function InputUrl(parent_id, item={}) {
	this.type = "url";
	item.floating = (item.floating == false) ? false : true;
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_URL++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter the url...";

	this.html = this._generate();
	this.render();
}
InputUrl.prototype = inherit(InputTextField.prototype);

function InputWeek(parent_id, item={}) {
	this.type = "week";
	this.id = item.id || "{0}_{1}".format(this.type, __INPUT_WEEK++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputWeek.prototype = inherit(InputTextField.prototype);


function Textarea(parent_id, item={}) {
	item.floating = (item.floating == false) ? false : true;
	this.id = item.id || "{0}_{1}".format(this.type, __TEXTAREA++);
	InputTextField.call(this, parent_id, item);

	this.placeholder = item.placeholder || "Text lines";
	this.cols = item.cols || "30";
	this.rows = item.rows || "10";
	this.wrap = (item.wrap) ? 'wrap="' + item.wrap + '" ' : "";

	this.html = this._generate();
	this.render();
}
Textarea.prototype = inherit(Tag.prototype);
Textarea.prototype._generate = function() {
	var component = '<textarea class="mdl-textfield__input" id="{0}" rows={1} columns={2} form="{4}" maxlength="{4}" {5} {6} {7} {8} {9}></textarea>'.format(
			this.id, this.rows, this.cols, this.parent_id, this.maxlength, this.readonly, this.required, this.disabled, this.autofocus, this.wrap) +
		'<label class="mdl-textfield__label" for="{0}">{1}</label>'.format(this.id, this.placeholder);

	return '<div class="{0}">{1}<div>'.format(this.style, component);
}