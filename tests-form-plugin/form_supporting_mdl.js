// track unique ids for each element
var __INPUT_CHECKBOX = 0;
var __INPUT_DATE = 0;
var __INPUT_DATETIME = 0;
var __INPUT_DATETIME_LOCAL = 0;
var __INPUT_EMAIL = 0;
var __INPUT_FILE = 0;
var __INPUT_MONTH = 0;
var __INPUT_NUMBER = 0;
var __INPUT_PASSWORD = 0;
var __INPUT_RADIO = 0;
var __INPUT_RANGE = 0; //working on
var __INPUT_SEARCH = 0;
var __INPUT_TEL = 0;
var __INPUT_TEXT = 0;
var __INPUT_TIME = 0;
var __INPUT_URL = 0;
var __INPUT_WEEK = 0;

var __TOGGLE_GROUP = 0;

var __BUTTON = 0;
var __SELECT = 0; //working on
var __TEXTAREA = 0;

var __FORM = 0;


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

if (!String.prototype.capitalize) {
	String.prototype.capitalize = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}
}

function inherit(proto) {
	function F() {}
	F.prototype = proto;
	return new F;
}

// need to work on submit
function Form(display_element, opt = {}) {
	this.type = "form";
	this.display_element = display_element || "body";
	this.id = opt.id || "{0}_{1}".format(this.type, __FORM++);

	this.layout_color = opt.layout_color || "grey-300";

	this.ribbon_color = opt.ribbon_color || '#3F51B5';
	this.ribbon_height = opt.ribbon_height || '40vh';
	this.ribbon_bg = (opt.ribbon_bg) ? "background: url({0});".format(opt.ribbon_bg) : "";
	this.ribbon_bg_size = opt.ribbon_bg_size || "background-size: contain cover;";

	this.ribbon = '<div style="height: {0};-webkit-flex-shrink: 0;-ms-flex-negative: 0;flex-shrink: 0;background-color: {1};{2}{3}"></div>'.format(
		this.ribbon_height, this.ribbon_color, this.ribbon_bg, this.ribbon_bg_size);

	this.content_bg_color = opt.content_bg_color || "grey-100";
	this.context_text_color = opt.context_text_color || "black-800";
	this.form_title = opt.form_title || "Untitled Form";

	this.form_title_size = opt.form_title_size || "40px";
	this.form_title_color = opt.form_title_color || "black-800";
	this.form_title = '<label style="font-size: {0};padding-bottom: 40px; font-weight: bolder;" class="mdl-layout-title mdl-color-text--{1}">{2}</label>'.format(
		this.form_title_size, this.form_title_color, this.form_title)

	this.content = '<main class="mdl-layout__content" style="margin-top: -35vh;-webkit-flex-shrink: 0;-ms-flex-negative: 0;flex-shrink: 0;">\
<div class="mdl-grid" style="max-width: 1600px;width: calc(100% - 16px);margin: 0 auto;margin-top: 10vh;">\
<div class="mdl-cell mdl-cell--2-col mdl-cell--hide-tablet mdl-cell--hide-phone"></div>\
<div class="mdl-color--{0} mdl-shadow--4dp mdl-cell mdl-cell--8-col" style="border-radius: 2px;padding: 80px 56px;margin-bottom: 80px;">\
<div class="mdl-color-text--{1}" id="{2}" style="width: 512px;">{3}</div></div>\
<div class="mdl-layout mdl-color-text--grey-600" style="text-align: center; font-size: 12px; margin-top: -60px">\
This content is neither created nor endorsed by jsPsych.\
</div><div class="mdl-layout mdl-color-text--grey-700" style="text-align: center; font-size: 19px; margin-top: -30px">\
jsPsych Forms</div></div></main>'.format(
		this.content_bg_color, this.context_text_color, this.id, this.form_title);


	this.html = '<form><div class="mdl-layout mdl-layout--fixed-header mdl-js-layout mdl-color--{0}">{1}{2}</div></form>'.format(
		this.layout_color, this.ribbon, this.content);

	this.render();
}
Form.prototype.render = function() {
	$(this.display_element).html(this.html);
}


function Tag(parent_id, item) {
	// standard attributs
	this.parent_id = parent_id;

	this.label = item.label || "";
	this.value = item.value || "";
	this.name = item.name || "";
	this.type = item.type || "";
	this.id = item.id || "";
	this.name = item.name || this.id;
	this.question_color = item.question_color || "black-800";
	this.question = "";
	if (item.needQuestion) {
		this.question = item.question || "Untitled Question";
		this.question = '<label class="mdl-layout-title mdl-color-text--{0}" style="font-weight: bold;" >{1}</label>'.format(this.question_color, this.question);
	}

	//default settings
	// this.newline = (item.newline == false) ? false : true;
	this.newline = item.newline || false;
	this.disabled = (item.disabled) ? 'disabled="disabled"' : "";
	this.maxlength = item.maxlength || "";
	this.readonly = (item.readonly) ? 'readonly="readonly"' : "";
	this.required = (item.required) ? 'required="required"' : "";
	this.autofocus = (item.autofocus) ? 'autofocus="autofocus"' : "";
	this.size = item.size || "";

	this.html = "";
}
Tag.prototype = {
	render: function() {
		if (this.newline)
			this.html = "<br>" + this.html;
		$("#{0}".format(this.parent_id)).append(this.html);
	}
}


function Button(parent_id, item = {}) {
	item.id = item.id || "{0}_{1}".format(item.type, __BUTTON++);
	item.type = item.type || "button";
	Tag.call(this, parent_id, item);

	//MDL style
	this.addon = ""
	this.buttonStyle = item.buttonStyle || "raise";
	switch (this.buttonStyle) {
		case "raise":
			this.addon += " mdl-button--raised";
			break;
		case "fab":
			this.addon += " mdl-button--fab";
			break;
		case "minifab":
			this.addon += " mdl-button--mini-fab";
			break;
		case "icon":
			this.addon += " mdl-button--icon";
			break;
	}

	this.color = (item.color == false) ? false : true;
	this.addon += ((this.color) ? " mdl-button--colored" : "");
	this.primary = item.primary || false;
	this.addon += ((this.primary) ? " mdl-button--primary" : "");
	this.accent = item.accent || false;
	this.addon += ((this.accent) ? " mdl-button--accent" : "");
	this.ripple = (item.ripple == false) ? false : true;
	this.addon += ((this.ripple) ? " mdl-js-ripple-effect" : "");

	this.style = "mdl-button mdl-js-button" + this.addon;

	this.label = item.label || "Button";
	this.value = item.value || "";
	this.onclick = item.onclick || "";


	this.icon = item.icon || "";
	if (this.icon != "")
		this.icon = '<i class="material-icons">{0}</i>'.format(this.icon);

	this.html = '<div><button class="{0}" id="{1}" type="{2}" value="{3}" {4} form="{5}" onclick="{6}" name="{9}">{7}{8}</button></div>'.format(
		this.style, this.id, this.type, this.value, this.disabled, this.parent_id, this.onclick, this.icon, this.label, this.name);

	this.render();
}
Button.prototype = inherit(Tag.prototype);

function UploadFile(parent_id, item = {}) {
	item.type = "file";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_FILE++);
	Tag.call(this, parent_id, item);

	this.label_id = "label_{0}".format(this.id);
	this.fileType = item.fileType || "Upload a file from here";
	this.icon = item.icon || "cloud_upload";
	this._style = 'style="position:absolute;top: 0;right: 0;width: 300px;height: 100%;z-index: 4;cursor: pointer;opacity: 0"';

	this.html = this._generate();
	this.render();

	var label_id = this.label_id;
	$("#{0}".format(this.id)).change(function() {
		$("#{0}".format(label_id)).val(this.files[0].name);
		$("#{0}".format(label_id)).text(this.files[0].name);
	});
};
UploadFile.prototype = inherit(Tag.prototype);
UploadFile.prototype._generate = function() {
	var html = '<div class="mdl-textfield mdl-js-textfield" style="box-sizing: border-box;">\
	<input id="{3}" class="mdl-textfield__input" readonly placeholder="{4}">\
	<label class="mdl-textfield__label" for="{3}"></label></div>\
	<div class="mdl-button mdl-js-button mdl-button--primary mdl-button--icon" style="right: 0;">\
	<i class="material-icons">{0}</i>\
	<input type="file" id="{1}" {2} style="padding-botton: 36px"></div>'.format(
		this.icon, this.id, this._style, this.label_id, this.fileType
	)

	return html
}

function InputTextField(parent_id, item) {
	item.needQuestion = (item.needQuestion == false) ? false : true;
	Tag.call(this, parent_id, item);

	//MDL style
	this.expandable = item.expandable || false;
	this.expandable = (this.expandable) ? " mdl-textfield--expandable" : "";
	this.floating = item.floating || false;
	this.floating = (this.floating) ? " mdl-textfield--floating-label" : "";
	this.style = "mdl-textfield mdl-js-textfield{0}{1}".format(this.expandable, this.floating);

	this.icon = item.icon || "";
	this.pattern = item.pattern || ".*";
	this.errorInfo = item.errorInfo || "Your input is not as required!";

	//attributes
	this.accessKey = item.accessKey || "";
	this.defaultValue = item.defaultValue || "";
	this.alt = item.alt || "";
	this.tabIndex = item.tabIndex || "";
}
InputTextField.prototype = inherit(Tag.prototype);
InputTextField.prototype._generate = function() {
	var component = '<input class="mdl-textfield__input" type="{0}" id="{1}" maxlength="{2}" size="{3}"\
	{4} {5} pattern="{6}" {7} {8} {9} {10} {11} {12} value="{13}" form="{14}">'.format(
			this.type, this.id, this.maxlength, this.size,
			this.required, this.readonly, this.pattern,
			this.disabled, this.autofocus, this.accessKey,
			this.alt, this.defaultValue, this.tabIndex,
			this.value, this.parent_id) +
		'<label class="mdl-textfield__label" for="{0}">{1}</label>'.format(this.id, this.label) +
		'<span class="mdl-textfield__error">{0}</span>'.format(this.errorInfo);

	if (this.expandable != "")
		component = '<div class="mdl-textfield__expandable-holder">' + component + '</div>';

	if (this.icon != "")
		component = '<label class="mdl-button mdl-js-button mdl-button--icon" for="{0}"><i class="material-icons">{1}</i></label>'.format(this.id, this.icon) + component;

	return '<div class="{0}">{1}<div>'.format(this.style, component);
};
InputTextField.prototype.render = function() {
	this.html = this.question + this.html;
	if (this.newline)
		this.html = "<br>" + this.html;
	$("#{0}".format(this.parent_id)).append(this.html);
}

function InputDate(parent_id, item = {}) {
	item.type = "date";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_DATE++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputDate.prototype = inherit(InputTextField.prototype);

function InputDatetime(parent_id, item = {}) {
	item.type = "datetime";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_DATETIME++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputDatetime.prototype = inherit(InputTextField.prototype);

function InputDatetimeLocal(parent_id, item = {}) {
	item.type = "datetime-local";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_DATETIME_LOCAL++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputDatetimeLocal.prototype = inherit(InputTextField.prototype);

function InputEmail(parent_id, item = {}) {
	item.type = "email";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_EMAIL++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter you email...";

	this.html = this._generate();
	this.render();
}
InputEmail.prototype = inherit(InputTextField.prototype);


function InputMonth(parent_id, item = {}) {
	item.type = "month";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_MONTH++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputMonth.prototype = inherit(InputTextField.prototype);

function InputNumber(parent_id, item = {}) {
	item.type = "number";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_NUMBER++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter a number...";

	this.html = this._generate();
	this.render();
}
InputNumber.prototype = inherit(InputTextField.prototype);

function InputPassword(parent_id, item = {}) {
	item.type = "password";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_PASSWORD++);
	item.needQuestion = item.needQuestion || false;
	item.floating = (item.floating == false) ? false : true;
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter your password...";

	this.html = this._generate();
	this.render();
}
InputPassword.prototype = inherit(InputTextField.prototype);

function InputSearch(parent_id, item = {}) {
	item.type = "search";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_SEARCH++);
	item.expandable = (item.expandable == false) ? false : true;
	item.floating = (item.expandable) ? false : true;
	item.icon = item.icon || "search";
	item.needQuestion = false;
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputSearch.prototype = inherit(InputTextField.prototype);

function InputTel(parent_id, item = {}) {
	item.type = "tel";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_TEL++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter your telephone number...";

	this.html = this._generate();
	this.render();
}
InputTel.prototype = inherit(InputTextField.prototype);

function InputText(parent_id, item = {}) {
	item.type = "text";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_TEXT++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter some texts...";

	this.html = this._generate();
	this.render();
}
InputText.prototype = inherit(InputTextField.prototype);

function InputTime(parent_id, item = {}) {
	item.type = "time";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_TIME++);
	InputTextField.call(this, parent_id, item);

	this.name = item.name || this.id;
	this.html = this._generate();
	this.render();
}
InputTime.prototype = inherit(InputTextField.prototype);

function InputUrl(parent_id, item = {}) {
	item.type = "url";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_URL++);
	InputTextField.call(this, parent_id, item);

	this.label = item.label || "Please enter the url...";

	this.html = this._generate();
	this.render();
}
InputUrl.prototype = inherit(InputTextField.prototype);

function InputWeek(parent_id, item = {}) {
	item.type = "week";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_WEEK++);
	InputTextField.call(this, parent_id, item);

	this.html = this._generate();
	this.render();
}
InputWeek.prototype = inherit(InputTextField.prototype);


function Textarea(parent_id, item = {}) {
	item.type = "textarea";
	item.id = item.id || "{0}_{1}".format(item.type, __TEXTAREA++);
	InputTextField.call(this, parent_id, item);

	this.name = item.name || this.id;
	this.placeholder = item.placeholder || "Text lines";
	this.cols = item.cols || "30";
	this.rows = item.rows || "10";
	this.wrap = (item.wrap) ? 'wrap="' + item.wrap + '" ' : "";

	this.html = this._generate();
	this.render();
}
Textarea.prototype = inherit(Tag.prototype);
Textarea.prototype._generate = function() {
	var component = '<textarea class="mdl-textfield__input" id="{0}" rows={1} columns={2} form="{4}" maxlength="{4}" {5} {6} {7} {8} {9} name="{10}"></textarea>'.format(
			this.id, this.rows, this.cols, this.parent_id, this.maxlength, this.readonly, this.required, this.disabled, this.autofocus, this.wrap, this.name) +
		'<label class="mdl-textfield__label" for="{0}">{1}</label>'.format(this.id, this.placeholder);

	return this.question + '<div class="{0}">{1}<div>'.format(this.style, component);
}

function Toggle(parent_id, item = {}) {
	item.newline = item.newline || false;
	Tag.call(this, parent_id, item);

	// settings for mdl
	// this.type --> type as a <input> tag 
	// this.type_class --> template of different type class in mdl i.e. checkbox switch...
	// this.content_class --> template of different content class in mdl  
	this.ripple = (item.ripple == false) ? false : true;
	this.toggle_type = item.toggle_type;

	this.value = item.value || this.label;

	this.checked = (item.checked) ? 'checked="checked"' : "";
}
Toggle.prototype = inherit(Tag.prototype);
Toggle.prototype._generate = function() {
	var addon = "";
	addon += ((this.ripple) ? " mdl-js-ripple-effect" : "");

	var html = '<label for="{0}" class="mdl-{1} mdl-js-{1}{2}">'.format(
		this.id, this.toggle_type, addon
	);
	html += '<input type="{0}" id="{1}" class="{2}" form="{3}" {4} {5} {6} value="{7}" name="{8}">'.format(
		this.type, this.id, this.type_class, this.parent_id, this.checked, this.autofocus, this.required, this.value, this.name
	);
	html += this.content_class + '</label>'

	return html;
};

function Checkbox(parent_id, item = {}) {
	item.type = "checkbox";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_CHECKBOX++);
	item.toggle_type = "checkbox";
	item.label = item.label || "Checkbox #{0}".format(__INPUT_CHECKBOX - 1);
	Toggle.call(this, parent_id, item);

	this.type_class = 'mdl-checkbox__input';
	var isImage = this.label.startsWith("<div") && this.label.endsWith("</div>")
	if (!isImage) 
		this.content_class = '<span class="mdl-checkbox__label">{0}</span>'.format(this.label);
	else
		this.content_class = '<span class="mdl-checkbox__label">{0}</span>'.format(this.value);

	this.html = this._generate();
	if (isImage)
		this.html += this.label;
}
Checkbox.prototype = inherit(Toggle.prototype);

function Switch(parent_id, item = {}) {
	item.type = "checkbox";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_CHECKBOX++);
	item.toggle_type = "switch";
	item.label = item.label || "Switch #{0}".format(__INPUT_CHECKBOX - 1);
	Toggle.call(this, parent_id, item);

	this.type_class = 'mdl-switch__input';
	var isImage = this.label.startsWith("<div") && this.label.endsWith("</div>")
	if (!isImage)
		this.content_class = '<span class="mdl-switch__label">{0}</span>'.format(this.label);
	else
		this.content_class = '<span class="mdl-switch__label">{0}</span>'.format(this.value);

	this.html = this._generate();
	if (isImage)
		this.html += this.label;
}
Switch.prototype = inherit(Toggle.prototype);

function Radio(parent_id, item = {}) {
	item.type = "radio";
	item.id = item.id || "{0}_{1}".format(item.type, __INPUT_RADIO++);
	item.toggle_type = "radio";
	item.label = item.label || "Radio #{0}".format(__INPUT_RADIO - 1);
	Toggle.call(this, parent_id, item);

	this.type_class = 'mdl-radio__button';
	var isImage = this.label.startsWith("<div") && this.label.endsWith("</div>")
	if (!isImage)
		this.content_class = '<span class="mdl-radio__label">{0}</span>'.format(this.label);
	else
		this.content_class = '<span class="mdl-radio__label">{0}{1}</span>'.format(this.value, this.label);

	this.html = this._generate();
}
Radio.prototype = inherit(Toggle.prototype);

function ToggleGroup(parent_id, item) {
	item.id = item.id || "Toggle group_{0}".format(__TOGGLE_GROUP++);
	item.type = item.type || "checkbox";
	item.name = item.name || item.id;
	item.needQuestion = (item.needQuestion == false) ? false : true;
	item.images = item.images || [];
	item.labels = item.labels || [];
	item.values = item.values || [];
	Tag.call(this, parent_id, item);

	for (var i in item.labels) {
		if (item.values.length < item.labels.length)
			item.values.push(item.labels[i]);
	}
	if (item.images.length > 0) {
		for (var i in item.images) {
			item.labels.push('<div class="mdl-card mdl-shadow--2dp" \
style="width: 256px;height: 256px;background: url({0}) center/cover;"></div>'.format(item.images[i]));
			if (item.values.length < item.labels.length)
				item.values.push(item.images[i]);
		}
	}
	this.values = item.values;
	this.labels = item.labels;
	
	this.html = "";
	var factory = this._selector();

	for (var i in this.labels) {
		item.label = this.labels[i];
		item.value = this.values[i];
		item.id = ""; // initialize item.id
		this.html += factory(this.parent_id, item).html + "\n";
	}
	this.html = this.question + "<br><div>" + this.html + "</div><br>"
	this.render();
}
ToggleGroup.prototype = inherit(Tag.prototype);
ToggleGroup.prototype._selector = function() {
	switch (this.type) {
		case "checkbox":
			return function(parent_id, item) {
				return new Checkbox(parent_id, item);
			}
		case "switch":
			return function(parent_id, item) {
				return new Switch(parent_id, item);
			}
		case "radio":
			return function(parent_id, item) {
				return new Radio(parent_id, item);
			}
	}
}

