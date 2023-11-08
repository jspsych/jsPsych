# Configuring the jsPsych development environment

## Setup

JsPsych is written using [TypeScript](https://www.typescriptlang.org/), a superset of JavaScript that adds static typing, but compiles to plain JavaScript.
The TypeScript compiler itself is written in JavaScript and can be run by [Node.js](https://nodejs.org/en/), a runtime to execute JavaScript code without a web browser.
Node.js comes with a package manager called NPM (Node Package Manager) that can install JavaScript libraries to run on your machine, such as TypeScript and other build tools for jsPsych.
In order to work on code in the jsPsych or the jspsych-contrib repository, it is recommended that you follow the steps below to set up your development environment.

### Install Node.js

The jsPsych development setup requires a [Node.js LTS version](https://nodejs.org/en/download/) to be installed on your machine.

### Clone the repository and install the dependencies

Clone either the jsPsych repository or the jspsych-contrib repository by running

```sh
git clone https://github.com/jspsych/jsPsych.git && cd jsPsych
```

or

```sh
git clone https://github.com/jspsych/jspsych-contrib.git && cd jspsych-contrib
```
in a terminal.

Then run `npm install`.
This will create a `node_modules` directory and install all the dependencies into it that are required to build and test jsPsych.

!!! info
    The jsPsych (-contrib) repositories depend on the `canvas` package which comes with pre-built binaries.
    On systems for which no pre-built binaries are available, `npm install` will try to build the binaries from scratch, sometimes failing with an error message mentioning the `canvas` package.
    If you are facing such installation issues, please follow the [installation instructions](https://github.com/Automattic/node-canvas/wiki#installation-guides) of the `canvas` package and run `npm install` again afterwards.

!!! info
    If you are running `npm install` in the core jsPsych repository, this will also execute the build chain for all packages in the jsPsych repository.
    This step may take a few minutes.
    If you would like to use that time efficiently, consider reading the following two sections to know what's happening.

## Repository structure

A Node.js package is a directory that contains a `package.json` file describing it.
Most importantly, a `package.json` file lists other packages that the package depends on.
The jsPsych and jspsych-contrib repositories use NPM *workspaces*.
That means, running `npm install` in the repository root will install the dependencies for all packages in the `packages` directory.
The core jsPsych library and every jsPsych plugin or extension is laid out as an individual package.
These packages are published to the [NPM registry](https://www.npmjs.com/) where they can be downloaded by NPM or any CDN (such as [unpkg](https://unpkg.com/)).

## Build chain and build artifacts

JsPsych comes with a build chain (specified in the `@jspsych/config` package) that can be executed by running `npm run build` in a package's directory.
The build chain will read the package (starting at its `src/index.ts` file) and create the following build artifacts in the package's `dist` directory:

* **`index.js`** 
  This file contains everything from `index.ts`, but as plain JavaScript and bundled in a single file (i.e. without `import`ing files from the same package).
  It is used by bundlers like [webpack](https://webpack.js.org/).

* **`index.cjs`**
  Like `index.js`, but using the old CommonJS standard to support backwards-compatible tools like the [Jest](https://jestjs.io/) testing framework.

* **`index.browser.js`**
  This file, like `index.js`, contains the entire package as plain JavaScript, but this time wrapped in a function so that it can be included directly by browsers using the `<script>` tag.
  For plugins or extensions, the default export of a module (i.e. whatever statement comes after `export default` in the `index.ts` file) is assigned to a global variable.
  The name of this global variable is specified in the package's `rollup.config.mjs` file, as a parameter to the `makeRollupConfig()` function.
  Hence, for instance, including the `index.browser.js` file from the `plugin-html-keyboard-response` package would assign the `HtmlKeyboardResponsePlugin` class to the global `jsPsychHtmlKeyboardResponse` variable.
  Because the code in `index.browser.js` looks very similar to the `index.ts` code but is fully supported by modern web browsers, all examples in the `examples` directory reference the `index.browser.js` files so users can also modify the source code directly without running the build chain.

* **`index.browser.min.js`**
  There are different versions of the JavaScript language specification and not all web browsers and browser versions support all JavaScript features.
  That's why the jsPsych build chain uses [Babel](https://babeljs.io/) to translate the source files into code that a majority of web browsers can understand.
  The result of this operation is `index.browser.min.js`.
  It behaves just like `index.browser.js`, but adds support for older browsers by substituting new JavaScript features using older ones.
  Because this is the recommended build artifact for production usage (and is automatically served by unpkg), the code in `index.browser.min.js` is also processed by [Terser](https://terser.org/) to reduce its size and speed up experiment loading times.

* **`*.js.map`**
  When debugging code in a browser (especially `index.browser.min.js`, which is not easily readable due to Terser and Babel), it is important to be able to read the original source code in the debugger.
  For every build artifact, there is a `.map` file which contains a mapping of the generated code to the original source code.
  Browsers automatically read these `.map` files and display the original code in their debuggers instead of the generated one.

* **`*.d.ts`**
  The `.d.ts` files contain the TypeScript type definitions that would otherwise be lost during compilation to plain JavaScript.
  They are read by Typescript and editors when a package is imported into another TypeScript project.


## Testing

Automated code testing for jsPsych is implemented with [Jest](https://jestjs.io/). 

To run the tests, install Node and npm. Run `npm install` in the root jsPsych directory. Then run `npm test`. You can also run `npm test` in the directory of the package that you would like to test. For example, if you are developing tests for the `html-keyboard-response` plugin you can run `npm test` in `/packages/plugin-html-keyboard-response`. If you want to run one file from the root directory, using the aforementioned example, you can run `npm test -- /packages/plugin-html-keyboard-response/src/index.spec.ts`.

Tests for the core jsPsych library are located in `/packages/jspsych/tests`.

Tests for plugins and extensions are located in the `/src` folder of the corresponding package. Test files for plugins and extensions are named `index.spec.ts`.

There are helper functions for testing in `/packages/jspsych/tests/utils.ts`. We recommend looking at other test files to observe conventions for testing.
