// track unique ids for each element
var __INPUT_BUTTON = 0;
var __INPUT_CHECKBOX = 0;
var __INPUT_COLOR = 0;
var __INPUT_DATE = 0;
var __INPUT_DATETIME = 0;
var __INPUT_DATETIME_LOCAL = 0;
var __INPUT_EMAIL = 0;
var __INPUT_FILE = 0;
var __INPUT_HIDDEN = 0;
var __INPUT_IMAGE = 0;
var __INPUT_MONTH = 0;
var __INPUT_NUMBER = 0;
var __INPUT_PASSWORD = 0;
var __INPUT_RADIO = 0;
var __INPUT_RANGE = 0;
var __INPUT_RESET = 0;
var __INPUT_SEARCH = 0;
var __INPUT_SUBMIT = 0;
var __INPUT_TEL = 0;
var __INPUT_TEXT = 0;
var __INPUT_TIME = 0;
var __INPUT_URL = 0;
var __INPUT_WEEK = 0;

var __BUTTON = 0;
var __FIELDSET = 0;
var __IMAGE = 0;
var __PLAIN_TEXT = 0;
var __SELECT = 0;
var __TEXTAREA = 0;

var __CHECK_STYLE_TAG = new RegExp(/style/);
if (!__CHECK_STYLE_TAG.test($('head').html())) {
	$('head').append('<style type="text/css"></style>');
}

//basic attributs
var __GLOBAL_FONTSIZE = "120%"
var __GLOBAL_FONTCOLOR = "black";
var __GLOBAL_FONTWEIGHT = "";
var __GLOBAL_BG_COLOR = "white";
var __GLOBAL_BG_IMAGE = "";

function set_global(opt) {
	__GLOBAL_FONTSIZE = opt.fontsize || __GLOBAL_FONTSIZE;
	__GLOBAL_FONTCOLOR = opt.fontcolor || __GLOBAL_FONTCOLOR;
	__GLOBAL_FONTWEIGHT = opt.fontweight || __GLOBAL_FONTWEIGHT;
	__GLOBAL_BG_COLOR = opt.bgcolor || __GLOBAL_BG_COLOR;
	__GLOBAL_BG_IMAGE = opt.bgimg || __GLOBAL_BG_IMAGE;
}


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

// for texts describing elements
function repr(parent_id, display_info) {
	var item = {};

	if (typeof display_info == 'string')
		display_info = {
			display_info: display_info,
			type: 'string'
		};

	display_info.fontsize = display_info.fontsize || __GLOBAL_FONTSIZE;
	display_info.fontcolor = display_info.fontcolor || __GLOBAL_FONTCOLOR;
	display_info.bgcolor = display_info.bgcolor || __GLOBAL_BG_COLOR;
	display_info.bgimg = display_info.bgimg || __GLOBAL_BG_IMAGE;
	if (display_info.type == 'img')
		item = new Image(parent_id, display_info);
	if (display_info.type == 'string')
		item = new PlainText(parent_id, display_info);

	return item.html;
}

function inherit(proto) {
	function F() {}
	F.prototype = proto;
	return new F;
}

function Tag(parent_id, opt) {
	this._SEPERATE_SPACE = "<br><br>";

	// standard attributs
	this.parent_id = parent_id;

	this.class = opt.class || "";
	this.id = opt.id || "";
	this.name = opt.name;
	this.value = opt.value;
	this.display_info = opt.display_info;
	this.newline = opt.newline || true;

	//default settings
	this.disabled = (opt.disabled) ? 'disabled="disabled"' : "";
	this.maxlength = opt.maxlength || "";
	this.readonly = (opt.readonly) ? 'readonly="readonly"' : "";
	this.required = (opt.required) ? 'required="required"' : "";
	this.autofocus = (opt.autofocus) ? 'autofocus="autofocus"' : "";
	this.size = opt.size || "";

	//default basic style settings for all tags
	this.fontsize = opt.fontsize || "100%";
	this.fontcolor = opt.fontcolor || "black";
	this.fontweight = opt.fontweight || "";
	this.bgcolor = opt.bgcolor || "white";
	this.bgimg = opt.bgimg || "";

	//styles should be in form of string e.g "font-style: italic;"
	this.all_style_attributes = opt.styles || [];

	this.html = "";
}
Tag.prototype = {
	set_style: function() {
		var html = "{0}{1} {font-size:{2};color:{3};background-color:{4};background-image:url({5});".format(
			this.elementTag, ((this.class == "") ? this.class : '.' + this.class),
			this.fontsize, this.fontcolor, this.bgcolor, this.bgimg
		);

		if (this.all_style_attributes.length > 0) {
			for (var i = 0; i < this.all_style_attributes.length; i++) {
				var style = this.all_style_attributes[i];
				if (!style.endsWith(';')) style += ';';
			}
			html += style;
		}

		$('style').append(html + '}');
	},
	render: function() {
		this.set_style();
		$("#{0}".format(this.parent_id)).append(this.html);
	}
}

function PlainText(parent_id, item) {
	Tag.call(this, parent_id, item);
	__PLAIN_TEXT++;

	// subclass attributs
	this.parent_id = parent_id;
	this.elementTag = 'p1';

	this.display_info = item.display_info;
	this.newline = item.newline || false;

	if (!item.class)
		this.class = '{0}_{1}_{2}'.format(this.parent_id, this.elementTag, __PLAIN_TEXT);
	else
		this.class = item.class;
	if (!item.id)
		this.id = this.class;
	else
		this.id = item.id;

	this.html = '<p1 class="{0}" id="{1}">{2}</p1>{3}'.format(this.class, this.id, this.display_info, ((this.newline) ? this._SEPERATE_SPACE : ""));
	this.set_style();
}
PlainText.prototype = inherit(Tag.prototype);
PlainText.prototype.render = function() {
	$("#{0}".format(this.parent_id)).append(this.html);
}

function Image(parent_id, item) {
	Tag.call(this, parent_id, item);
	__IMAGE++;

	// subclass attributs
	this.parent_id = parent_id;
	this.elementTag = 'img';

	this.height = item.height || "3%";
	this.width = item.width || "3%";
	this.src = item.src;
	this.newline = item.newline || false;

	if (!item.class)
		this.class = '{0}_{1}_{2}'.format(this.parent_id, this.elementTag, __IMAGE);
	else
		this.class = item.class;
	if (!item.id)
		this.id = this.class;
	else
		this.id = item.id;

	this.html = '<img src="{0}" alt="{1}" height="{2}" width="{3}" class="{4}" id="{5}">{6}'.format(
		this.src, this.name, this.height,
		this.width, this.class, this.id, ((this.newline) ? this._SEPERATE_SPACE : "")
	);
	this.set_style();
}
Image.prototype = inherit(Tag.prototype);
Image.prototype.render = function() {
	$("#{0}".format(this.parent_id)).append(this.html);
}

function FormNode(parent_id, item) {
	Tag.call(this, parent_id, item);

	// subclass attributs
	this.elementTag = 'form';

	this.title = item.title || "Form Title";
	this.title = repr(this.parent_id, {type:'string', display_info:this.title, fontsize:"150%"});

	if (!item.class)
		this.class = '{0}_{1}_{2}'.format(this.parent_id, this.elementTag, __IMAGE);
	else
		this.class = item.class;
	if (!item.id)
		this.id = this.class;
	else
		this.id = item.id;

	this.html = this._generate();
}
FormNode.prototype = inherit(Tag.prototype);
FormNode.prototype._generate = function() {

	html = '<caption>{0}</caption><br><br><form id="{1}" class="{2}"></form>'.format(this.title, this.id, this.class);
	return html
};

function Input(parent_id, item) {
	Tag.call(this, parent_id, item);

	// subclass attributs
	this.elementTag = 'input';

	this.accessKey = item.accessKey || "";
	this.defaultValue = item.defaultValue || "";
	this.alt = item.alt || "";
	this.tabIndex = item.tabIndex || "";

	this.display_info = repr(this.id, item.display_info);
	this.fontsize = item.fontsize || "80%";
	this.fontcolor = item.fontcolor || "black";
	this.bgcolor = item.bgcolor || "white";
	this.bgimg = item.bgimg || "";

	this.html = "";
}
Input.prototype = inherit(Tag.prototype);

function InputTexter(parent_id, item) {
	Input.call(this, parent_id, item);

	// subclass attributs
	this.type = item.type;
	this.label = item.label || false;
	this.onclick = item.onclick || "";

	if (!item.class)
		this.class = "{0}_{1}_{2}_{3}".format(this.parent_id, this.elementTag, this.type, __INPUT_TEXT);
	else
		this.class = item.class;
	if (!item.id)
		this.id = this.class;
	else
		this.id = item.id;

	this.html = '{12}\t<input type="{13}" form="{0}" name="{1}" value="{2}" maxlength="{3}" size="{4}" {5} {6} {7} {8} class="{9}" id="{10}" accessKey="{14}" alt="{15}" defaultValue="{16}" tabIndex="{17}" onclick="{18}">{11}'.format(
		this.parent_id, this.name, this.value,
		this.maxlength, this.size, this.readonly,
		this.required, this.disabled, this.autofocus,
		this.class, this.id, this._SEPERATE_SPACE,
		this.display_info, this.type, this.accessKey,
		this.alt, this.defaultValue, this.tabIndex,
		this.onclick
	);
}
InputTexter.prototype = inherit(Input.prototype);

function InputButton(parent_id, item) {
	item.type = "button";
	InputTexter.call(this, parent_id, item);
	__INPUT_BUTTON++;
}
InputButton.prototype = inherit(InputTexter.prototype);

function InputColor(parent_id, item) {
	item.type = "color";
	InputTexter.call(this, parent_id, item);
	__INPUT_COLOR++;
}
InputColor.prototype = inherit(InputTexter.prototype);

function InputDate(parent_id, item) {
	item.type = "date";
	InputTexter.call(this, parent_id, item);
	__INPUT_DATE++;
}
InputDate.prototype = inherit(InputTexter.prototype);

function InputDatetime(parent_id, item) {
	item.type = "datetime";
	InputTexter.call(this, parent_id, item);
	__INPUT_DATETIME++;
}
InputDatetime.prototype = inherit(InputTexter.prototype);

function InputDatetimeLocal(parent_id, item) {
	item.type = "datetime-local";
	InputTexter.call(this, parent_id, item);
	__INPUT_DATETIME_LOCAL++;
}
InputDatetimeLocal.prototype = inherit(InputTexter.prototype);

function InputEmail(parent_id, item) {
	item.type = "email";
	InputTexter.call(this, parent_id, item);
	__INPUT_EMAIL++;
}
InputEmail.prototype = inherit(InputTexter.prototype);

function InputFile(parent_id, item) {
	item.type = "file";
	InputTexter.call(this, parent_id, item);
	__INPUT_FILE++;
}
InputFile.prototype = inherit(InputTexter.prototype);

function InputHidden(parent_id, item) {
	item.type = "hidden";
	InputTexter.call(this, parent_id, item);
	__INPUT_HIDDEN++;
}
InputHidden.prototype = inherit(InputTexter.prototype);

function InputMonth(parent_id, item) {
	item.type = "month";
	InputTexter.call(this, parent_id, item);
	__INPUT_MONTH++;
}
InputMonth.prototype = inherit(InputTexter.prototype);

function InputNumber(parent_id, item) {
	item.type = "number";
	InputTexter.call(this, parent_id, item);
	__INPUT_NUMBER++;
}
InputNumber.prototype = inherit(InputTexter.prototype);

function InputPassword(parent_id, item) {
	item.type = "password";
	InputTexter.call(this, parent_id, item);
	__INPUT_PASSWORD++;
}
InputPassword.prototype = inherit(InputTexter.prototype);

function InputRange(parent_id, item) {
	item.type = "range";
	InputTexter.call(this, parent_id, item);
	__INPUT_RANGE++;

	this.max = item.max || "100";
	this.min = item.min || "0";
	this.step = item.step || "1";
	this.list = item.list || "";

	this.html = '{12}\t<input type="{13}" form="{0}" name="{1}" value="{2}" max="{3}" min="{4}" step="{19}" {5} {6} {7} {8} class="{9}" id="{10}" accessKey="{14}" alt="{15}" defaultValue="{16}" tabIndex="{17}" list="{18}">{11}'.format(
		this.parent_id, this.name, this.value,
		this.max, this.min, this.readonly,
		this.required, this.disabled, this.autofocus,
		this.class, this.id, this._SEPERATE_SPACE,
		this.display_info, this.type, this.accessKey,
		this.alt, this.defaultValue, this.tabIndex,
		this.list, this.step
	);
}
InputRange.prototype = inherit(InputTexter.prototype);

function InputReset(parent_id, item) {
	item.type = "reset";
	item.onclick = item.onclick || "formReset()";
	InputTexter.call(this, parent_id, item);
	__INPUT_RESET++;
}
InputReset.prototype = inherit(InputTexter.prototype);

function InputSearch(parent_id, item) {
	item.type = "search";
	InputTexter.call(this, parent_id, item);
	__INPUT_SEARCH++;
}
InputSearch.prototype = inherit(InputTexter.prototype);

function InputTel(parent_id, item) {
	item.type = "tel";
	InputTexter.call(this, parent_id, item);
	__INPUT_TEL++;
}
InputTel.prototype = inherit(InputTexter.prototype);

function InputText(parent_id, item) {
	item.type = "text";
	InputTexter.call(this, parent_id, item);
	__INPUT_TEXT++;
}
InputText.prototype = inherit(InputTexter.prototype);

function InputTime(parent_id, item) {
	item.type = "time";
	InputTexter.call(this, parent_id, item);
	__INPUT_TIME++;
}
InputTime.prototype = inherit(InputTexter.prototype);

function InputUrl(parent_id, item) {
	item.type = "url";
	InputTexter.call(this, parent_id, item);
	__INPUT_URL++;
}
InputUrl.prototype = inherit(InputTexter.prototype);

function InputWeek(parent_id, item) {
	item.type = "week";
	InputTexter.call(this, parent_id, item);
	__INPUT_WEEK++;
}
InputWeek.prototype = inherit(InputTexter.prototype);


function InputChecker(parent_id, item) {
	Input.call(this, parent_id, item);

	this.type = item.type;
	this.label = item.label || true;
	this.front = item.front || true;
	this.newline = item.newline || true;
	this.checked = (item.checked) ? 'checked="checked"' : "";

	if (!item.class)
		this.class = "{0}_{1}_{2}_{3}".format(this.parent_id, this.elementTag, this.type, __INPUT_CHECKBOX);
	else
		this.class = item.class;
	if (!item.id)
		this.id = this.class;
	else
		this.id = item.id;

	this.display_info = (this.label) ? '<label for="' + this.id + '">' + this.display_info + '</label>' : this.display_info;

	this.html = this._generate();
}
InputChecker.prototype = inherit(Input.prototype);
InputChecker.prototype._generate = function() {
	var html = '<input type="{9}" form="{0}" id="{1}" name="{2}" value="{3}" {4} {5} {6} {7} {8}>'.format(
		this.form, this.id, this.name, this.value,
		this.readonly, this.required, this.disabled,
		this.checked, this.autofocus, this.type
	);
	html = (this.front) ? this.display_info + html : html + this.display_info;

	return html + ((this.newline) ? this._SEPERATE_SPACE : "");
};

function InputCheckbox(parent_id, item) {
	item.type = 'checkbox';
	InputChecker.call(this, parent_id, item);

	__INPUT_CHECKBOX++;
}
InputCheckbox.prototype = inherit(InputChecker.prototype);

function InputRadio(parent_id, item) {
	item.type = 'radio';
	InputChecker.call(this, parent_id, item);

	__INPUT_RADIO++;
}
InputRadio.prototype = inherit(InputChecker.prototype);

function Option(parent_id, item) {
	Tag.call(this, parent_id, item);

	this.display_info = item.display_info || this.value;
	this.selected = (item.selected) ? 'selected="selected"' : "";

	this.html = '<option value="{0}" {1} {2}>{3}</option>'.format(this.value, this.disabled, this.selected, this.display_info);
}
Option.prototype = inherit(Tag.prototype);

function Optgroup(parent_id, item) {
	Tag.call(this, parent_id, item)

	this.label = item.label;
	this.options = item.options

	this.html = this._generate();
}
Optgroup.prototype = inherit(Tag.prototype);
Optgroup.prototype._generate = function() {
	var html = '<optgroup label="{0} {1}">'.format(this.label, this.disabled);

	for (var i = 0; i < this.options.length; i++) {
		var item = new Option(this.parent_id, this.options[i]);
		html += item.html;
	}

	return html;
}

function Select(parent_id, item) {
	Tag.call(this, parent_id, item);
	__SELECT++;

	this.elementTag = 'select';

	if (!item.class)
		this.class = "{0}_{1}_{2}".format(this.parent_id, this.elementTag, __SELECT);
	else
		this.class = item.class;
	if (!item.id)
		this.id = this.class;
	else
		this.id = item.id;

	this.options = item.options
	this.multiply = (item.multiply) ? 'multiply="multiply"' : "";

	this.html = this._generate();
}
Select.prototype = inherit(Tag.prototype);
Select.prototype._generate = function() {
	var html = '<select name="{0}" size="{1}" {2} {3} {4} {5} form="{6}" class="{7}" id="{8}">'.format(
		this.name, this.size, this.multiply,
		this.disabled, this.required, this.autofocus,
		this.parent_id, this.class, this.id
	);

	for (var i = 0; i < this.options.length; i++) {
		var item = this.options[i];
		if (!item.options)
			item = new Option(this.parent_id, item);
		else
			item = new Optgroup(this.parent_id, item);
		html += item.html;
	}

	return html + '</select>' + this._SEPERATE_SPACE;
}

function Button(parent_id, item) {
	Tag.call(this, parent_id, item);
	__BUTTON++

	this.elementTag = 'button';

	this.buttonType = item.buttonType || "button";
	this.onclick = item.onclick || "";

	this.class = this.id = "{0}_{1}_{2}".format(this.parent_id, this.elementTag, __BUTTON);

	this.html = '<button name="{0}" type="{1}" value="{2}" {3} {4} form="{5}" class="{6}" id="{7}" onclick="{10}">{8}</button>{9}'.format(
		this.name, this.buttonType, this.value,
		this.disabled, this.autofocus, this.parent_id,
		this.class, this.id, this.display_info, this._SEPERATE_SPACE,
		this.onclick
	);
}
Button.prototype = inherit(Tag.prototype);

function Textarea(parent_id, item) {
	Tag.call(this, parent_id, item);
	__TEXTAREA++;

	this.elementTag = 'textarea';

	this.placeholder = item.placeholder || "This is a textarea.";
	this.cols = item.cols || "30";
	this.rows = item.rows || "10";
	this.wrap = (item.wrap) ? 'wrap="' + item.wrap + '" ' : "";

	if (!item.class)
		this.class = "{0}_{1}_{2}".format(this.parent_id, this.elementTag, __TEXTAREA);
	else
		this.class = item.class;
	if (!item.id)
		this.id = this.class;
	else
		this.id = item.id;

	this.html = '<textarea name="{0}" rows="{1}" cols="{2}" placeholder="{3}" maxlength="{4}" {5} {6} {7} {8} {9} form="{10}" class="{11}" id="{12}"></textarea>{13}'.format(
		this.name, this.rows, this.cols,
		this.placeholder, this.maxlength, this.readonly,
		this.required, this.disabled, this.autofocus,
		this.wrap, this.parent_id, this.class, this.id,
		this._SEPERATE_SPACE
	);
}
Textarea.prototype = inherit(Tag.prototype);

function FieldSet(parent_id, item) {
	Tag.call(this, parent_id, item);
	__FIELDSET++;

	this.elementTag = this.elementTag = 'fieldset';

	this.legend = item.legend || "Fieldset";
	this.legend = repr(this.parent_id, {type:'string', fontsize:"150%", display_info:this.legend});

	if (!item.class)
		this.class = "{0}_{1}_{2}".format(this.parent_id, this.elementTag, __FIELDSET);
	else
		this.class = item.class;
	if (!item.id)
		this.id = this.class;
	else
		this.id = item.id;

	this.html = '<fieldset name="{0}" {1} class="{2}" id="{3}"><legend>{4}</legend></fieldset>{5}'.format(
		this.name, this.disabled, this.class, this.id,
		this.legend, this._SEPERATE_SPACE
	);
}
FieldSet.prototype = inherit(Tag.prototype);