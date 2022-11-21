import json
from logging import getLogger
import subprocess
from hashlib import md5
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any, List

from diskcache import Cache
from jsonpath_ng.ext import parse

cache = Cache(Path(__file__).parent)
logger = getLogger("mkdocs")


def hash_file(path: Path):
    with path.open() as file:
        return md5(file.read().encode("utf8")).hexdigest()


def get_plugin_description(plugin_dir: Path):
    logger.info(f"Collecting parameter infos for {plugin_dir}...")
    with NamedTemporaryFile() as json_file:

        typedoc_command = (
            subprocess.list2cmdline(
                [
                    "node_modules/.bin/typedoc",
                    "--tsconfig",
                    plugin_dir / "tsconfig.json",
                    "--json",
                    f"{json_file.name}",
                    "--sort",
                    "source-order",
                    plugin_dir / "src/index.ts",
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
