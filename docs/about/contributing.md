# Contributing to jsPsych

Contributions to jsPsych are welcome! All of the code is managed through the GitHub repository.

## Steps for modifying the code

#### Discuss the proposed change

If you have a specific modification in mind -- for instance, a new feature or bug fix -- please open a [new issue via GitHub](https://github.com/jspsych/jsPsych/issues/new). Describe the proposed change and what functionality it adds to the library and/or what problem it solves. If you are interested in adding a new plugin to the library, it helps if you post an example of the plugin in use and describe the different use cases of the plugin (for more guidance, see the "Writing new plugins" section below).

If you are thinking about proposing a change but not at the point where you have a specific modification to the code base in mind, then it might be helpful to discuss the issue first on [GitHub Discussions](https://github.com/jspsych/jsPsych/discussions). Discussion posts can be useful for sharing code and getting feedback before requesting a change to the library.

#### Fork the library and modify the code

To make changes to the code, you should fork the jsPsych library via GitHub and make modifications on your fork. You may find it useful to make modifications on branches, so that you can keep your proposed changes separate from any other unrelated changes you might want to make on your fork.

#### Submit a pull request

Once your modification is complete, submit a pull request to merge your changes into the `master` branch of the main repository. Pull requests will be reviewed by the project team.

## Writing new plugins

New plugins are welcome additions to the library. Plugins can be distributed independently of the main library or added to the GitHub repository via a pull request, following the process described above. If you want to add your plugin to the main library then there are a few guidelines to follow.

#### Make the plugin as general as possible

Plugins are most useful when they are flexible. Avoid fixing the value of parameters that could be variables. This is especially important for any text that displays on the screen in order to facilitate use in multiple languages.

#### Use the jsPsych.pluginAPI module when appropriate

The [pluginAPI module](../core_library/jspsych-pluginAPI.md) contains functions relevant to plugin development. Avoid duplicating the functions defined within the library in your plugin, and instead use the pluginAPI whenever possible. If you have a suggestion for improving pluginAPI methods, then go ahead and submit a pull request to modify it directly.

#### Document your plugin

When submitting a pull request to add your plugin, make sure to include a documentation page in the same style as the other docs pages. Documentation files exist in the `docs` directory.

#### Include an example file

Write a short example HTML file to include in the `examples` directory. This should demonstrate the basic use cases of the plugin as clearly as possible.

#### Include a testing file

Automated code testing for jsPsych is implemented with [Jest](https://facebook.github.io/jest/). To run the tests, install Node and npm. Run `npm install` in the root jsPsych directory. Then run `npm test`. Plugins should have a testing file that validates the behavior of all the plugin parameters. See the `/tests/plugins` directory for examples.
