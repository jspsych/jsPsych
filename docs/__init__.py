from pathlib import Path

from docs.__generator__.plugins import (
    generate_plugin_author_info,
    generate_plugin_installation_section,
    generate_plugin_parameters_section,
    generate_plugin_summary,
    generate_plugin_version_info,
)


# https://mkdocs-macros-plugin.readthedocs.io/en/latest/macros/
def define_env(env):
    @env.macro
    def plugin_parameters(plugin: str):
        return generate_plugin_parameters_section(Path(f"packages/plugin-{plugin}"))

    @env.macro
    def plugin_description(plugin: str):
        return generate_plugin_summary(Path(f"packages/plugin-{plugin}"))

    @env.macro
    def plugin_meta(plugin: str):
        plugin_dir = Path(f"packages/plugin-{plugin}")
        return f"{generate_plugin_version_info(plugin_dir)} {generate_plugin_author_info(plugin_dir)}\n"

    @env.macro
    def plugin_installation(plugin: str):
        return generate_plugin_installation_section(Path(f"packages/plugin-{plugin}"))
