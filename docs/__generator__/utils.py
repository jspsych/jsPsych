import json
import subprocess
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any, List

from jsonpath_ng.ext import parse


def get_plugin_description(plugin_dir: str):
    package_path = f"packages/plugin-{plugin_dir}"
    with NamedTemporaryFile() as json_file:

        typedoc_command = (
            subprocess.list2cmdline(
                [
                    "node_modules/.bin/typedoc",
                    "--tsconfig",
                    f"{package_path}/tsconfig.json",
                    "--json",
                    f"{json_file.name}",
                    "--sort",
                    "source-order",
                    f"{package_path}/src/index.ts",
                ]
            ),
        )

        subprocess.run(
            typedoc_command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
        )

        description = json.load(json_file)

        # with Path("tmp.json").open("w") as file:
        #     json.dump(description, file)

        return description


def get_values_by_path(data, json_path: str):
    return [match.value for match in parse(json_path).find(data)]


def get_value_by_path(data, json_path: str):
    values = get_values_by_path(data, json_path)
    return values[0] if len(values) > 0 else None


def jsdoc_to_markdown(parsed_parts: List[Any]):
    output = ""

    for part in parsed_parts:
        if part["kind"] in ["text", "code"]:
            output += part["text"].replace("\n\n", "<p>").replace("\n", " ")

        elif part["kind"] == "inline-tag":
            if part["tag"] == "@link":
                output += f'[{part["text"] or part["target"]}]({part["target"]})'

    return output
