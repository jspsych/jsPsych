# @jspsych/extension-record-video

## 1.2.0

### Minor Changes

- [#3385](https://github.com/jspsych/jsPsych/pull/3385) [`3948fdc0ac176584fe4b8fe0b9cca5ed6e8b3afc`](https://github.com/jspsych/jsPsych/commit/3948fdc0ac176584fe4b8fe0b9cca5ed6e8b3afc) Thanks [@cherriechang](https://github.com/cherriechang)! - Added citations property to info field of all plugins/extensions in two citation formats (apa, bibtex); added getCitations() as function in jsPsych package allowing user to generate citations by passing an array of plugins/extensions by name as first input and citation format as string as second input; changed template of plugins/extensions to contain citations field by default; citations for each plugin/extension are automatically generated from .cff file (if any) at its folder's root during build process; getCitations() prints out citations in the form of a string separating each citation with newline character, and always prints the jsPsych library citation first.

## 1.1.0

### Minor Changes

- [#3352](https://github.com/jspsych/jsPsych/pull/3352) [`b94d961f`](https://github.com/jspsych/jsPsych/commit/b94d961f9b29516d58ee826835d73c9e5dbf9a6d) Thanks [@Bankminer78](https://github.com/Bankminer78)! - Extensions now return an extension_type and extension_version when returning data (metadata purposes).

## 1.0.2

### Patch Changes

- [#3184](https://github.com/jspsych/jsPsych/pull/3184) [`9acfa29c`](https://github.com/jspsych/jsPsych/commit/9acfa29c8db1d7a8816c53ac49651f15493f2cf4) Thanks [@bjoluc](https://github.com/bjoluc)! - Point to source maps via canonical unpkg URLs in NPM-published browser builds. This prevents 404 errors when using redirecting CDN URLs (as described in #3043).

## 1.0.1

### Patch Changes

- [#2781](https://github.com/jspsych/jsPsych/pull/2781) [`12956b3c`](https://github.com/jspsych/jsPsych/commit/12956b3cc130676a81e4a4536d68800a4d34e8a8) Thanks [@jadeddelta](https://github.com/jadeddelta)! - added readme for visibility on npmjs.com

## 1.0.0

### Major Changes

- [#2649](https://github.com/jspsych/jsPsych/pull/2649) [`7c63e1cd`](https://github.com/jspsych/jsPsych/commit/7c63e1cd0b985e46db04dc79ba9178921b1768cc) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Initial release of record video extension. The extension can record video from a camera during a trial.
