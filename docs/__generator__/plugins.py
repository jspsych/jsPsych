from pathlib import Path

from docs.__generator__.utils import (
    convert_blockquote_admonitions,
    generate_badge_svg,
    get_package_info,
    get_plugin_description,
    get_value_by_path,
    get_values_by_path,
    jsdoc_to_inline_markdown,
    jsdoc_to_markdown,
    plugin_name_to_camel_case,
)

PARAMETER_TYPE_MAPPING = {
    "KEYS": "array of strings",
    "BOOL": "boolean",
    "STRING": "string",
    "INT": "numeric",
    "FLOAT": "numeric",
    "FUNCTION": "function",
    "KEY": "string",
    "KEYS": "array of strings",
    # "SELECT": "",
    "HTML_STRING": "HTML string",
    "IMAGE": "image file",
    "AUDIO": "audio file",
    "VIDEO": "video file",
    # "OBJECT": "",
    # "COMPLEX": "",
    # "TIMELINE": "",
}


def generate_plugin_parameters_section(plugin_dir: Path):
    description = get_plugin_description(plugin_dir)

    output = """
## Parameters

In addition to the [parameters available in all
plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin
accepts the following parameters. Parameters with a default value of undefined must be
specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |
"""

    for parameter in get_values_by_path(
        description,
        "$.children[?name = default].children[?name = info].type.declaration.children[?name = parameters].type.declaration.children[?kindString = Property]",
    ):
        parameter_name = parameter["name"]

        parameter_type = get_value_by_path(
            parameter, "$.type.declaration.children[?name = type].type.name"
        )
        if parameter_type in PARAMETER_TYPE_MAPPING:
            parameter_type = PARAMETER_TYPE_MAPPING[parameter_type]

        is_array = get_value_by_path(
            parameter, "$.type.declaration.children[?name = array].type.value"
        )
        if is_array:
            parameter_type = f"array of {parameter_type}s"

        default_value_description = get_value_by_path(
            parameter, "$.type.declaration.children[?name = default]"
        )

        # If `default_value` has a TSDoc summary, display it as the default value
        default_value_summary = get_value_by_path(
            default_value_description, "$.comment.summary"
        ) or get_value_by_path(
            default_value_description,
            "$.type.declaration.signatures[0].comment.summary",
        )
        if default_value_summary:
            default_value = jsdoc_to_inline_markdown(default_value_summary)
        else:
            default_value = get_value_by_path(
                default_value_description, "$.defaultValue"
            )

            # Large arrays are not displayed by default, so assembling a custom string
            # here
            if is_array and default_value == "...":
                default_array_values = get_values_by_path(
                    default_value_description, "$.type.target.elements[*].value"
                )

                if default_array_values:
                    separator = '", "'
                    default_value = f'["{separator.join(default_array_values)}"]'

        is_required = default_value == "undefined"
        required_marker = "<font color='red'>*</font>" if is_required else ""
        if is_required:
            default_value = ""

        description = jsdoc_to_inline_markdown(
            get_values_by_path(parameter, "$.comment.summary[*]")
        )

        output += f"{parameter_name}{required_marker} | {parameter_type} | {default_value} | {description} \n"

    return output


def generate_plugin_summary(plugin_dir: Path):
    summary = get_value_by_path(
        get_plugin_description(plugin_dir),
        "$.children[?name = default].comment.summary",
    )
    return convert_blockquote_admonitions(jsdoc_to_markdown(summary))


def generate_plugin_version_info(plugin_dir: Path):
    info = get_package_info(plugin_dir)
    return f"[{generate_badge_svg('Current version',info['version'])}](https://github.com/jspsych/jsPsych/blob/main/{plugin_dir}/CHANGELOG.md)"


def generate_plugin_author_info(plugin_dir: Path):
    author = get_value_by_path(
        get_plugin_description(plugin_dir),
        "$.children[?name = default].comment.blockTags[?tag = @author].content[0].text",
    )
    return generate_badge_svg("Author", author, "lightgray")


def generate_plugin_installation_section(plugin_dir: Path):
    info = get_package_info(plugin_dir)
    plugin_dir_name = plugin_dir.name

    return f"""
## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/{info["name"]}@{info["version"]}"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/{plugin_dir_name}.js"></script>
```

Using NPM:

```
npm install {info["name"]}
```
```js
import {plugin_name_to_camel_case(plugin_dir_name)} from '{info["name"]}';
```
"""
