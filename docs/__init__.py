from logging import getLogger

from docs.__generator__.plugins import generate_plugin_parameters_section

logger = getLogger("mkdocs")

# https://mkdocs-macros-plugin.readthedocs.io/en/latest/macros/
def define_env(env):
    @env.macro
    def plugin_parameters(plugin_dir: str):
        logger.info(f"Collecting parameter infos for plugin {plugin_dir}...")
        return generate_plugin_parameters_section(plugin_dir)
