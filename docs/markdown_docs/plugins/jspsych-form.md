# jspsych-form

This plugin creates a form from a JSON schema. 


## Parameters

Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
schema|object|{}|A JSON schema that holds the values of settings for creating a form.

### *JSON* schema

Parameter | Type | Default Value | Description
----------|------|---------------|------------
form|[*Class* Form](#Form)|{}|Values of settings for the form layout.
"any question string"|[*Classes* start from here](#Dropdown)|*undefined*|Take the key string as the question title, and the value as question settings.
onSubmit|[*Class* Button](#Button)|{label: "Submit"}|Values of settings for the button in the form.

## Function

### createForm

INPUTS: display_element {string}, 
		schema {object}<br/>
OUTPUTS: an array, [*Object* Form, [*Object* Tag], *Object* Button]<br/>
SIDE EFFECT: Render the form.<br/>

schema.type | Effect
------------|-------
"short answer/text"|Instantiate a [InputText](#InputText) object.
"long answer/textarea"|Instantiate a [Textarea](#Textarea) object.
dropdown|Instantiate a [Dropdown](#Dropdown) object.
"checkbox/switch/radio"|Instantiate a [ToggleGroup](#ToggleGroup) object according to its toggle type.
range|Instantiate its according object ([see Class](#Class))
date|Instantiate its according object ([see Class](#Class))
datetime|Instantiate its according object ([see Class](#Class))
datetime-local|Instantiate its according object ([see Class](#Class))
email|Instantiate its according object ([see Class](#Class))
file|Instantiate its according object ([see Class](#Class))
month|Instantiate its according object ([see Class](#Class))
password|Instantiate its according object ([see Class](#Class))
search|Instantiate its according object ([see Class](#Class))
telephone|Instantiate its according object ([see Class](#Class))
time|Instantiate its according object ([see Class](#Class))
url|Instantiate its according object ([see Class](#Class))
week|Instantiate its according object ([see Class](#Class))

## Class <a name="Class"></a>

If the value is in **bold**, then it is final. <br/>
If the value is *undefined*, then it must be specified.<br/>
For MDL color attributes, [see MDL colors](http://blog.jonathanargentiero.com/material-design-lite-color-classes-list/).<br/>
For MDL icons, [see MDL icons](https://material.google.com/style/icons.html).<br/>
For html color attributes, [see html colors](http://htmlcolorcodes.com/).<br/>
Mainly used:<br/>
[Form](#Form),<br/>
[Dropdown](#Dropdown)<br/>
[InputText](#Text),<br/>
[Textarea](#Textarea)<br/>
[ToggleGroup](#ToggleGroup)

### Form <a name="Form"></a>

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*display_element*|string|*undefined*|Indicate where the form is displayed.
*id*<a name="FormId"></a>|numeric|**Automactically Assigned**|The id of the form. 
*type*|string|**"form"**|The type of the form.
item|object|{}|Values of settings for the form layout.
item.layout_color|string|`white-300`|The background color of the layout.
item.boxShadow|numeric|4|The darkness of shadow for the box. 0 - 17 
item.form_title|string|`"Untitled Form"`|The title of the form.
item.form_title_size|string|`40px`|The font size of the title.
item.form_title_color|string|`black-800`|The font color of the title.
item.form_description|string|""|The description of the form.
item.form_description_size|string|`14px`|The font size of the description of the form.
item.form_description_color|string|`grey-600`|The font color of the description of the form.
item.ribbon_color|string|`white-300`|The background color of the ribbon.
item.ribbon_height|string|`40vh`|The height of the ribbon.
item.ribbon_bg|string|""|The background picture of the ribbon.
item.ribbon_bg_size|string|`background-size: contain cover;`|The background picture's size of the ribbon.
item.content_bg_color|string|`white-300`|The background color of the content.
item.content_text_color|string|`black-800`|The font color of the text in the content.

### Button
*Inheritence:* [Tag](#Tag)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"button"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|**False**|Whether Displaying Question Title.
item.onclick|function|undefined|Add customized submit actions. If it has output, the output will occupy the key "\#Customized Output\#" in trial_data. (Pre-defined actions are: 1. check if all required fields are filled 2. Compare inputs with expected answers if provided)
item.label|string|`"Submit"`|The label for the button.
item.buttonStyle|string|`"raise"`|[see MDL attribute](https://getmdl.io/components/index.html#buttons-section)
item.color|boolean|`True`|[see MDL attribute](https://getmdl.io/components/index.html#buttons-section)
item.primary|boolean|`False`|[see MDL attribute](https://getmdl.io/components/index.html#buttons-section)
item.accent|boolean|`False`|[see MDL attribute](https://getmdl.io/components/index.html#buttons-section)
item.ripple|boolean|`True`|[see MDL attribute](https://getmdl.io/components/index.html#buttons-section)
item.icon|string|`""`|[see MDL attribute](https://getmdl.io/components/index.html#buttons-section)

### Dropdown <a name="Dropdown"></a>
*Inheritence:* [Tag](#Tag)<br/>
Drop down a list of option.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"select"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.
item.options|array|[]|An array of options.
item.choose_prompt|string|`"CHOOSE"`|Prompt for choosing.
item.dropRight|boolean|`True`|From which direction the list drops down.

### InputDate 
*Inheritence:* [InputTextField](#InputTextField) 

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"date"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.

### InputDatetime 
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"datetime"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.

### InputDatetimeLocal
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"datetime-local"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.

### InputEmail 
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"email"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.

### InputMonth 
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"month"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.

### InputNumber
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"number"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.
item.label|string|`"Please enter a number..."`|General inner html content.

### InputEmail
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"email"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.

### InputPassword 
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"password"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`False`|Whether Displaying Question Title.
item.floating|boolean|`True`|[see MDL attribute](https://getmdl.io/components/index.html#textfields-section)
item.label|string|`"Please your password..."`|General inner html content.

### InputSearch 
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"email"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|**False**|Whether Displaying Question Title.
item.icon|string|`"search"`|[see MDL attribute](https://getmdl.io/components/index.html#textfields-section)
item.expandable|boolean|`True`|[see MDL attribute](https://getmdl.io/components/index.html#textfields-section)
item.floating|boolean|`True`|[see MDL attribute](https://getmdl.io/components/index.html#textfields-section)

### InputTel 
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"tel"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.
item.label|string|`"Please your telephone number..."`|General inner html content.

### InputText <a name="Text"></a>
*Inheritence:* [InputTextField](#InputTextField) 

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"text"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.
item.label|string|`"Please enter some texts..."`|General inner html content.
item.pattern|string|`".*"`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)

### InputTime 
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"time"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.

### InputUrl 
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"url"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.
item.label|string|`"Please enter the url..."`|General inner html content.

### InputWeek 
*Inheritence:* [InputTextField](#InputTextField)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"week"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.

### Range
*Inheritence:* [Tag](#Tag)<br/>
Generate a slider.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"range"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag
item.needQuestion|boolean|`True`|Whether Displaying Question Title.
item.value_prompt|string|`"value: "`|Prompt for the value.
item.width|string|300px|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.max|numeric|100|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.min|numeric|0|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.step|numeric|1|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)


### Textarea <a name="Textarea"></a>
*Inheritence:* [InputTextField](#InputTextField) 

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"textarea"**|The type of the tag.
item.id|string|**Automactically Assigned**|The id of the tag.
item.needQuestion|boolean|`True`|Whether Displaying Question Title.
item.placeholder|string|`"Text lines"`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.cols|numeric|30|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.rows|numeric|10|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.wrap|string|`""`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)

### ToggleGroup <a name="ToggleGroup"></a>
*Inheritence:* [Tag](#Tag)<br/>
*Dependency:* [Checkbox](#Checkbox), [Switch](#Switch), [Radio](#Radio)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.id|string|**Automactically Assigned**|The id of the tag.
item.type|string|`"checkbox"`|The type of the [toggle_type](#Toggle).
item.needQuestion|boolean|`True`|Whether Displaying Question Title.
item.labels|array|[]|An array of labels for the options.
item.images|array|[]|An array of images for the options.
item.values|array|[]|An array of values for the options. If None, will take values from item.labels first and then item.images, i.e item.values.length = item.labels.length + item.images.length.
item.correctAnswers|array|[]|An array of expected answers.

### UploadFile
*Inheritence:* [Tag](#Tag)<br/>

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.id|string|**Automactically Assigned**|The id of the tag.
item.type|string|`"file"`|The type of the [toggle_type](#Toggle).
item.needQuestion|boolean|`False`|Whether Displaying Question Title.
item.fileType|string|`"Upload a file from here"`|Prompt for uploading a file.
item.icon|string|`"cloud_upload"`|[see MDL icons](https://material.google.com/style/icons.html)

## Base Class

### Tag <a name="Tag"></a>

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element
item|object|{}|An object of values for setting
item.type|string|**Automactically Assigned**|The type of the tag
item.id|string|**Automactically Assigned**|The id of the tag
item.needQuestion|boolean|`True`|Whether Displaying Question Title
item.label|string||General Inner Html Content
item.correct|custom|undefined| The Expected Answer
item.question|string|"Untitled Question"|Question Title
item.question_description|string|""|Question Description
item.question_color|string|`black-800`|Color Of Question
item.question_description_size|string|`14px`|Font Size Of Question Description
item.question_description_color|string|`grey-600`|Color Of Question Description
item.newline|boolean|`False`|Whether Inserting New Line When Rendering
item.value|string|""|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.name|string|""|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.disabled|boolean|`False`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.maxlength|boolean|`False`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.readonly|boolean|`False`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.required|boolean|`False`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.autofocus|boolean|`False`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.size|string|""|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)

### InputTextField <a name="InputTextField"></a>
*Inheritence:* [Tag](#Tag) 

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element
item|object|{}|An object of values for setting
item.expandable|boolean|`False`|[see MDL attribute](https://getmdl.io/components/index.html#textfields-section)
item.floating|boolean|`False`|[see MDL attribute](https://getmdl.io/components/index.html#textfields-section)
item.icon|string|`""`|[see MDL attribute](https://getmdl.io/components/index.html#textfields-section)
item.errorInfo|string|`"Your input is not as required!"`|[see MDL attribute](https://getmdl.io/components/index.html#textfields-section)
item.pattern|string|`".*"`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.accessKey|string|`""`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.defaultValue|string|`""`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.alt|string|`""`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.tabIndex|string|`""`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)

### Toggle <a name="Toggle"></a>
*Inheritence:* [Tag](#Tag) 

Parameter | Type | Default Value | Description
----------|------|---------------|------------
item.needQuestion|boolean|`False`|Whether Displaying Question Title.
item.toggle_type|string|`"checkbox"`|The toggle type.
item.newline|boolean|`False`|Whether Inserting New Line When Rendering.
item.ripple|boolean|`True`|[see MDL attribute](https://getmdl.io/components/index.html#toggles-section)
item.value|string|item.label|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)
item.checked|boolean|`False`|[see html attribute](http://www.w3schools.com/tags/ref_attributes.asp)

### Checkbox <a name="Checkbox"></a>
*Inheritence:* [Toggle](#Toggle)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"checkbox"**|The type of the tag.
item.toggle_type|string|**"checkbox"**|The type of the toggle.
item.id|string|**Automactically Assigned**|The id of the tag.
item.label|string|Automactically Assigned|The label of the option.

### Switch <a name="Switch"></a>
*Inheritence:* [Toggle](#Toggle)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"checkbox"**|The type of the tag.
item.toggle_type|string|**"switch"**|The type of the toggle.
item.id|string|**Automactically Assigned**|The id of the tag.
item.label|string|Automactically Assigned|The label of the option.

### Radio <a name="Radio"></a>
*Inheritence:* [Toggle](#Toggle)

Parameter | Type | Default Value | Description
----------|------|---------------|------------
*parent_id*|numeric|[Form.id](#FormId)|The id of its parent element.
item|object|{}|An object of values for setting.
item.type|string|**"radio"**|The type of the tag.
item.toggle_type|string|**"radio"**|The type of the toggle.
item.id|string|**Automactically Assigned**|The id of the tag.
item.label|string|Automactically Assigned|The label of the option.


## Examples

```javascript

	function clickToSubmit() {
		document.getElementById("custom_id_1").value += "Customize actions when submit buttons is pressed.";
		alert("This is a test. Check Question #7 to see the effect.");
		return {"Customized output": "Customize actions when submit buttons is pressed."};
	}
	
	var schema = {
		form: {form_title: 'Test #1', ribbon_bg: "img/ribbon.jpg", layout_color: "grey-300", content_bg_color: "grey-100"},
		"Question #1": {type: "short answer", correct: "Answer #1", required: true},
		"Question #2": {type: "password"},
		"Question #3": {type: "checkbox", labels: ["option1", "option2"], correctAnswers: ["option1", "option2"]},
		"Question #4": {type: "radio", labels: ["option1", "option2"], correctAnswers: ["option1"]},
		"Question #5": {type: "range"},
		"Question #6": {type: "dropdown"},
		"Question #7": {type: "long answer", question_description: "Some random contents", id: "custom_id_1"},
		"Question #8<p>Some random contents</p>": {type: "long answer", question_description: ""},
		"Question #9": {type: "file"},
		onSubmit: {label: "Submit", onclick: clickToSubmit}
	}

	var form_trial = {
		type: 'form',
		schema: schema
	}

	jsPsych.init({
		timeline: [form_trial],
		on_finish: function(){ jsPsych.data.displayData(); }
	});

```
