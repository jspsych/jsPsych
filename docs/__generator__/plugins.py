from pathlib import Path

from docs.__generator__.utils import (
    cache,
    get_plugin_description,
    get_value_by_path,
    get_values_by_path,
    jsdoc_to_markdown,
)

PARAMETER_TYPE_MAPPING = {
    "HTML_STRING": "HTML string",
    "KEYS": "array of strings",
    "BOOL": "boolean",
    "INT": "numeric",
}


@cache.memoize(expire=60 * 60 * 24 * 30)  # 1 month in seconds
def generate_plugin_parameters_section(plugin_dir: Path, source_hash: str):
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

        default_value = get_value_by_path(
            parameter, "$.type.declaration.children[?name = default].defaultValue"
        )
        is_required = default_value == "undefined"
        required_marker = "<font color='red'>*</font>" if is_required else ""
        if is_required:
            default_value = ""

        description = jsdoc_to_markdown(
            get_values_by_path(parameter, "$.comment.summary[*]")
        )

        output += f"{parameter_name}{required_marker} | {parameter_type} | {default_value} | {description} \n"

    return output
