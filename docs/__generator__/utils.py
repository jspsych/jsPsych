import json
import subprocess
from hashlib import md5
from logging import getLogger
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any, List

import requests
from diskcache import Cache
from jsonpath_ng.ext import parse

cache = Cache(Path(__file__).parent / "cache")
logger = getLogger("mkdocs")


def hash_file(path: Path):
    with path.open() as file:
        return md5(file.read().encode("utf8")).hexdigest()


def get_plugin_description(plugin_dir: Path):
    cache_key = (
        "get_plugin_description",
        plugin_dir,
        hash_file(plugin_dir / "src/index.ts"),
    )
    if cache_key in cache:
        return cache[cache_key]

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

    cache[cache_key] = description
    return description


def get_values_by_path(data, json_path: str):
    return [match.value for match in parse(json_path).find(data)]


def get_value_by_path(data, json_path: str):
    values = get_values_by_path(data, json_path)
    return values[0] if len(values) > 0 else None


def jsdoc_to_markdown(fragments: List[Any]):
    output = ""

    for fragment in fragments:
        if fragment["kind"] in ["text", "code"]:
            output += fragment["text"]

        elif fragment["kind"] == "inline-tag":
            if fragment["tag"] == "@link":
                output += (
                    f'[{fragment["text"] or fragment["target"]}]({fragment["target"]})'
                )

    return output


def jsdoc_to_inline_markdown(fragments: List[Any]):
    return jsdoc_to_markdown(fragments).replace("\n\n", "<p>").replace("\n", " ")


def convert_blockquote_admonitions(input: str):
    """
    Replace blockquote-based admonitions with MkDocs' admonition style
    """
    lines = input.split("\n")
    is_blockquote = False
    for index, line in enumerate(lines):
        if line.startswith("> **"):
            lines[index] = "!!! " + line[2:].replace("**", "")
            is_blockquote = True

        elif is_blockquote:
            if line.startswith(">"):
                lines[index] = "    " + line[2:]
            else:
                is_blockquote = False

    return "\n".join(lines)


def plugin_name_to_camel_case(plugin_name: str):
    words = plugin_name.split("-")
    return words[1] + "".join([word.capitalize() for word in words[2:]])


@cache.memoize(name="get_package_info", expire=60)
def get_package_info(package_dir: Path):
    with (package_dir / "package.json").open() as package_json_file:
        package_json = json.load(package_json_file)
    return {"name": package_json["name"], "version": package_json["version"]}


@cache.memoize(name="generate_badge_svg")
def generate_badge_svg(label: str, message: str, color="4cae4f"):

    return requests.get(
        f"https://img.shields.io/static/v1",
        params={
            "label": label,
            "message": message,
            "color": color,
            "style": "flat-square",
        },
    ).text
