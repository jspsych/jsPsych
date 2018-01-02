# Contributing to jsPsych

Contributions to jsPsych are welcome! All of the code is managed through the GitHub repository.

## Steps for modifying the code

#### Discuss the proposed change

If you have a specific modification in mind, open a [new issue via GitHub](https://github.com/jspsych/jsPsych/issues/new). Describe the proposed change and what problem it solves. If you are interested in adding a new plugin to the library, it helps if you post an example of the plugin in use and describe the different use cases of the plugin.

If the modification you are interested in working on is not quite at the point where you have a specific modification to the code base in mind, then it might be helpful to discuss the issue first on the [jsPsych Google group](https://groups.google.com/forum/#!forum/jspsych).

#### Fork the library and modify the code

To make changes to the code, you should fork the jsPsych library via GitHub. Changes should be targeted at the `master` branch.

#### Submit a pull request

Once your modification is complete, submit a pull request to merge your changes into the main repository. Pull requests will be reviewed by the project owner.

## Writing new plugins

New plugins are welcome additions to the library. Plugins can be distributed independently of the main library or added to the GitHub repository via a pull request and the process described above. If you want to add your plugin to the main library then there are a few guidelines to follow.

#### Make the plugin as general as possible

Plugins are most useful when they are flexible. Avoid fixing the value of parameters that could be variables. This is especially important for any text that displays on the screen in order to facilitate use in multiple languages.

#### Use the jsPsych.pluginAPI module when appropriate

The pluginAPI module contains functions relevant to plugin development. Avoid duplicating the functions defined within the library in your plugin. If you have a suggestion for improving pluginAPI methods, then go ahead and submit a pull request to modify it directly.

#### Document your plugin

When submitting a pull request to add your plugin, make sure to include a documentation page in the same style as the other docs pages. Documentation files exist in the `docs` directory.

#### Include an example file

Write a short example file to include in the `examples` directory. This should demonstrate the basic use cases of the plugin as clearly as possible.

#### Include a testing file

Automated code testing for jsPsych is implemented with [Jest](https://facebook.github.io/jest/). To run the tests, install Node and npm. Run `npm install` in the root jsPsych directory. Then run `npm test`. Plugins should have a testing file that validates the behavior of all the plugin parameters. See the `/tests/plugins` directory for examples.
