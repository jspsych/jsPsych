from pathlib import Path

from docs.__generator__.plugins import generate_plugin_parameters_section
from docs.__generator__.utils import hash_file


# https://mkdocs-macros-plugin.readthedocs.io/en/latest/macros/
def define_env(env):
    @env.macro
    def plugin_parameters(plugin: str):
        plugin_dir = Path(f"packages/plugin-{plugin}")

        return generate_plugin_parameters_section(
            plugin_dir, hash_file(plugin_dir / "src/index.ts")
        )
