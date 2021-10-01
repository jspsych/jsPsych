# Contributing to jsPsych

We welcome contributions of all kinds, including changes to the core codebase, the development of new plugins and extensions, and improvements to the documentation. 

The project is managed entirely through the [GitHub repository](https://github.com/jspsych/jsPsych). There you can:

* Use [discussions](https://github.com/jspsych/jsPsych/discussions) to propose ideas for development and seek feedback on contributions, such as a new plugin.
* Use [issues](https://github.com/jspsych/jsPsych/issues) to identify anything with an actionable next step. For example, a page in the documentation that needs to be fixed, a bug in the code, or a specific feature that has a clear scope.
* Submit a [pull request](https://github.com/jspsych/jsPsych/pulls) with modifications to the codebase. Pull requests will be reviewed by one or more members of the core team.

## Guidelines for contibuting

### Contributing to the codebase

We welcome contributions of any scope. Before we can merge changes into the main codebase, we generally require a few things. Note that you are welcome to contribute code without these things in place, but it will help us get to your contribution faster if you take care of whatever components you are comfortable doing.

* **The code must be tested through our automated testing system.** We use [Jest](https://jestjs.io/) as the testing framework. If you are fixing a bug, consider adding a test case that shows the bug has been resolved. If you are contributing new features, like a new plugin, a test suite for the plugin is very helpful. See [testing jsPsych](configuration.md#testing) for more information about configuring the test tools and writing tests.

* **Relevant documentation must be updated.** Any pages in `/docs` that are affected by the contribution should be updated, and if new pages are needed they should be created. For example, if you are contributing a plugin then adding documentation for the plugin and updating the [list of available plugins](https://github.com/jspsych/jsPsych/blob/main/docs/plugins/list-of-plugins.md) as well as the [mkdocs configuration file](https://github.com/jspsych/jsPsych/blob/main/mkdocs.yml) is very helpful!

* **An example file should be included if applicable.** If you are contributing a new feature, new plugin, or new extension, or contributing a modification that changes the behavior of the library in some important way, consider adding an example file to the `/examples` folder in the repository.

* **A changeset must be included in the pull request**. We use [changesets](https://github.com/atlassian/changesets/blob/main/docs/adding-a-changeset.md) to generate new releases and their corresponding release notes. [This is a good overview of changesets](https://github.com/atlassian/changesets/blob/main/docs/adding-a-changeset.md) that explains how to add one to your pull request. Feel free to ask for help with this!

* **Update the contributors.md file**. If you are a first time contributor to jsPsych please add your name to our [contributors file](https://github.com/jspsych/jsPsych/blob/main/contributors.md). And thanks!


### Contributing to the documentation

We are very appreciative of both small and large contributions to the documentation, from fixing a typo to adding a whole new tutorial. All of the documentation that appears on this site is contained in the [`/docs` folder](https://github.com/jspsych/jsPsych/tree/main/docs) of the repository. The documentation is built using [MkDocs](https://www.mkdocs.org/) and themed using [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/). You can edit any of the markdown files and submit a pull request to modify documentation.

If you'd like to test your changes to the documentation locally you'll need to install [MkDocs](https://www.mkdocs.org/user-guide/installation/) and [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/getting-started/#installation). Then you can run the command `mike serve` in the root folder of the repository to launch a local webserver and view the documentation.

## Contributing to `jspsych` vs. `jspsych-contrib`

If you are developing a new plugin or extension there are two different repositories that you can contribute to: [`jspsych`](https://github.com/jspsych/jsPsych) or [`jspsych-contrib`](https://github.com/jspsych/jspsych-contrib). 

The main `jspsych` repository is open to new plugins and extensions that are likely to be widely used. We require that contributions to main repository are well documented and tested before they are merged. Contributions to the main repository must use TypeScript. We limit contributions to this repository because once a plugin or extension is in the main codebase we are generally committed to providing updates as we develop new versions of jsPsych. Each new plugin and extension potentially increases the amount of development work that we will need to do in the future, so we are somewhat selective about what we will merge. If you have an idea that you'd like to discuss please [open a discussion thread](https://github.com/jspsych/jsPsych/discussions/new) and we'd love to chat about it!

The `jspsych-contrib` repository is open to any contributions that are complete and working code. There are some minimal guidelines in place about basic documentation that should be provided. Contributors can choose whether to develop their plugin or extension using our [TypeScript template](https://github.com/jspsych/jspsych-contrib/tree/main/packages/plugin-template-ts) or using our [JavaScript template](https://github.com/jspsych/jspsych-contrib/tree/main/packages/plugin-template). Contributions to `jspsych-contrib` are not evaluated for general usefulness in the same way that contributions to the main repository are. We also periodically consider whether to move contributions into the main repository from `jspsych-contrib` based on their popularity and completeness (documentation and testing).




