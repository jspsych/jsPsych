# Building the jsPsych documentation

The documentation hosted at [https://www.jspsych.org](https://www.jspsych.org) is generated using [mkdocs](https://www.mkdocs.org/) and the [mkdocs-material theme](https://squidfunk.github.io/mkdocs-material/). The documentation files are located in the [`/docs` directory of the GitHub repository](https://github.com/jspsych/jsPsych/tree/main/docs). The documentation is written using markdown.

To build a local copy of the docs, you will need to install `mkdocs`, `mkdocs-material`, and `mike` using `poetry`. 

## Install poetry

[Poetry](https://python-poetry.org/) is a package manager for python. Follow the install instructions on the `poetry` website to get it running.

## Install dev dependencies

Run the command `poetry install` in the root directory of jsPsych to install `mkdocs`, `mkdocs-material`, and their dependencies.

## Generating plugin documentation

Plugin documentation can be automatically generated from the JSDoc comments in plugin source files and examples in the `/examples` folder. The generator extracts:

- Plugin description from the class JSDoc comment
- Parameter information from the `info.parameters` object
- Data field information from the `info.data` object
- Individual trial configurations from the example files in `/examples`

The generator converts examples into the documentation format with interactive Code/Demo tabs, eliminating the need to maintain separate example sets.

To generate documentation for a single plugin:

```bash
npm run generate-plugin-docs -- html-button-response
```

To generate documentation for all plugins with demo HTML files:

```bash
npm run generate-plugin-docs -- --all --output docs/plugins --demos-output docs/demos
```

To see all available options:

```bash
npm run generate-plugin-docs -- --help
```

Options:

- `--output, -o`: Directory for generated markdown files
- `--demos-output, -d`: Directory for generated demo HTML files
- `--all`: Generate docs for all plugins
- `--list`: List all available plugins

The generated documentation follows the same format as the existing plugin docs, including:

- Parameters tables
- Data generated tables
- Install instructions
- Examples with Code/Demo tabs that embed interactive demos

## Building a local copy of the docs

Run `poetry run mike deploy [version] -u` to build a new version of the documentation or to override an existing version. For example, if you are testing an edit to version `7.2` of the documentation, run `poetry run mike deploy 7.2 -u`.

You can also use jsPsych's custom npm command: `npm run docs:deploy [version]`, e.g. `npm run docs:deploy 7.2`.

This will build the documentation and commit it directly to the `gh-pages` branch.

We use [`mike`](https://github.com/jimporter/mike) instead of `mkdocs` for the build step to support versioning of the documentation. `mike` runs the `mkdocs` command under the hood.

## Viewing the local docs

To launch a local webserver, run `poetry run mike serve`, or use jsPsych's custom npm command: `npm run docs:serve`. 

The docs will be viewable at `http://localhost:8000`.

## Updating the public docs site

!!! warning "For core maintainers only" 

After the documentation has been built locally (and therefore committed to your local `gh-pages` branch), you can update the live documentation site by switching to your `gh-pages` branch and pushing to the remote `gh-pages` branch.