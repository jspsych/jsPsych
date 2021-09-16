# Configuring the jsPsych development environment



## Testing

Automated code testing for jsPsych is implemented with [Jest](https://jestjs.io/). 

To run the tests, install Node and npm. Run `npm install` in the root jsPsych directory. Then run `npm test`. You can also run `npm test` in the directory of the package that you would like to test. For example, if you are developing tests for the `html-keyboard-response` plugin you can run `npm test` in `/packages/plugin-html-keyboard-response`.

Tests for the core jsPsych library are located in `/packages/jspsych/tests`.

Tests for plugins and extensions are located in the `/src` folder of the corresponding package. Test files for plugins and extensions are named `index.spec.ts`.

There are helper functions for testing in `/packages/jspsych/tests/utils.ts`. We recommend looking at other test files to observe conventions for testing.