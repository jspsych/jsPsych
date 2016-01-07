# Contributing to jsPsych

Contributions to jsPsych are welcome! All of the code is managed through the GitHub repository, so the best way to add or modify code is through GitHub. If you are interested in modifying code, the following steps are encouraged:

## Steps for modifying the code

#### Disucss the proposed change

If you have a specific modification in mind, then go ahead and open a new issue via GitHub. Describe the proposed change and what problem it solves. If you are interested in adding a new plugin to the library, it helps if you post an example of the plugin in use and describe the flexibility of the plugin.

If the modification you are interested in working on is not quite at the point where you have a specific modification to the code base in mind, then it might be helpful to discss the issue first on the jsPsych google group forum.

#### Fork the library and modify the code

To make changes to the code, you should fork the jsPsych library via GitHub. Changes should be targeted at the `dev` branch.

#### Submit a pull request

Once your modification is complete, submit a pull request to merge your changes into the main repository. Pull requests will be reviewed by the project owner.

## Writing new plugins

New plugins are welcome additions to the library. Plugins can be distributed independently of the main library, or added to the GitHub repository via a pull request and the process described above. If you want to add your plugin to the main library, then there are a few guidelines to follow.

#### Make the plugin as general as possible

Plugins are most useful when they are flexible. Avoid fixing the value of parameters that could be variables. If the plugin displays visual stimuli, then images or HTML content should be accepted.

#### Use the jsPsych.pluginAPI module when appropriate

The pluginAPI module contains functions relevant to plugin development. Avoid duplicating the functions defined within the library in your plugin. (If you have a suggestion for improving the pluginAPI method, then go ahead and submit a pull request to modify it directly).

#### Support the default plugin parameters

There are a number of parameters that are options for all plugins. Make sure that your plugin supports these parameters.

#### Document your plugin

When submitting a pull request to add your plugin, make sure to include a documentation page in the same style as the other docs pages. Documentation files exist in the `docs` directory.
