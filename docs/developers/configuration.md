# Configuring the jsPsych development environment

## Setup

JsPsych is written using [TypeScript](https://www.typescriptlang.org/), a superset of JavaScript that adds static typing, but compiles to plain JavaScript.
The TypeScript compiler itself is written in JavaScript and can be run by [Node.js](https://nodejs.org/en/), a runtime to execute JavaScript code without a web browser.
Node.js comes with a package manager called NPM (Node Package Manager) that can install JavaScript libraries to run on your machine, such as TypeScript and other build tools for jsPsych.
In order to work on code in the jsPsych repository, it is recommended that you follow the steps below to set up your development environment.

### Install Node.js

The JsPsych development setup requires Node.js >= v14 to be installed on your machine.
We recommend that you [install version 16](https://nodejs.org/en/) since it includes version 7 of NPM (required for the workspaces feature that the jsPsych repository uses).
If you are bound to Node.js v14, make sure to install NPM v7 manually (via `npm install -g npm@7`).

### Clone the repository and install the dependencies

In a terminal, run:
```sh
git clone https://github.com/jspsych/jsPsych.git
cd jsPsych
npm install
```

The latter command will install all the dependencies that are required to build and test jsPsych.
Afterwards, it will run the build chain for all packages in the jsPsych repository.

!!! info
    Depending on your system, this step will take some time.
    If you would like to use that time efficiently, consider reading the section below to know what's happening.

## Build chain and build artifacts

TODO describe the steps and artifacts, and how to run it / use the artifacts

There are different versions of the JavaScript language specification and not all web browsers and browser versions support all JavaScript features.
That's why jsPsych uses a build chain to translate the source files into code that a majority of web browsers can understand.




## Testing

Automated code testing for jsPsych is implemented with [Jest](https://jestjs.io/). 

To run the tests, install Node and npm. Run `npm install` in the root jsPsych directory. Then run `npm test`. You can also run `npm test` in the directory of the package that you would like to test. For example, if you are developing tests for the `html-keyboard-response` plugin you can run `npm test` in `/packages/plugin-html-keyboard-response`.

Tests for the core jsPsych library are located in `/packages/jspsych/tests`.

Tests for plugins and extensions are located in the `/src` folder of the corresponding package. Test files for plugins and extensions are named `index.spec.ts`.

There are helper functions for testing in `/packages/jspsych/tests/utils.ts`. We recommend looking at other test files to observe conventions for testing.