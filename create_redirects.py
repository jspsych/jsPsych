from pathlib import Path
from os.path import relpath
import re

ROOT_DIR = Path(".")
OLD_DOCS_DIR = ROOT_DIR / "6.3"
NEW_DOCS_DIR = ROOT_DIR / "7.0"

REDIRECT_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirecting</title>
    <meta http-equiv="refresh" content="0; url={path}" />
</head>
<body>Redirecting to <a href="{path}">{path}</a>...</body>
</html>
"""


def make_redirect_document(redirect_path: str):
    return REDIRECT_TEMPLATE.format(path=redirect_path)


def write_redirect(from_path: Path, to_path: Path):
    from_path.parent.mkdir(parents=True, exist_ok=True)
    from_path.write_text(make_redirect_document(relpath(to_path, from_path.parent)))


def get_relative_html_files(root_path: Path):
    return set([file.relative_to(root_path) for file in root_path.glob("**/*.html")])


def rewrite_moved_path(path: Path):
    """
    If given an old docs path, returns the new (renamed) version of that path, if the
    path was renamed.
    """
    parts = list(path.parts)

    if parts[0] in ["plugins", "extensions"]:
        parts[1] = re.sub(r"jspsych-(ext-)?", "", parts[1])
        return Path(*parts)

    if parts[0] == "core_library":
        parts[0] = "reference"

        if parts[1] == "jspsych-core":
            parts[1] = "jspsych"

        return Path(*parts)

    return path


old_files = get_relative_html_files(OLD_DOCS_DIR)
new_files = get_relative_html_files(NEW_DOCS_DIR)

for file in old_files:
    if str(file) not in ["index.html", "404.html"]:
        rewritten_file = rewrite_moved_path(file)

        write_redirect(
            file,
            NEW_DOCS_DIR / rewritten_file
            if rewritten_file in new_files
            else OLD_DOCS_DIR / file,
        )