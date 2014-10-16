# The jsPsych core library

Every jsPsych experiment utilizes the core library (contained in the `jspsych.js` file). The core library is the glue that holds all of the various plugins together. There are also several modules that are contained in the core library for tasks that are common to many different experiments. These modules are available whenever the `jspsych.js` file is loaded.

## Core library API

### Core

* jsPsych.init
* jsPsych.progress
* jsPsych.startTime
* jsPsych.totalTime
* jsPsych.preloadImages
* jsPsych.getDisplayElement
* jsPsych.finishTrial
* jsPsych.currentTrial
* jsPsych.initSettings
* jsPsych.currentChunkID

### [Data module](jspsych-data.md)

* [jsPsych.data.dataAsCSV](jspsych-data.md#jspsychdatadataascsv)
* [jsPsych.data.displayData](jspsych-data.md#jspsychdatadisplaydata)
* [jsPsych.data.getData](jspsych-data.md#jspsychdatagetdata)
* [jsPsych.data.getLastChunkData](jspsych-data.md#jspsychdatagetlastchunkdata)
* [jsPsych.data.getLastTrialData](jspsych-data.md#jspsychdatagetlasttrialdata)
* [jsPsych.data.getTrialsOfType](jspsych-data.md#jspsychdatagettrialsoftype)
* [jsPsych.data.getTrialsFromChunk](jspsych-data.md#jspsychdatagettrialsfromchunk)
* [jsPsych.data.localSave](jspsych-data.md#jspsychdatalocalsave)
* [jsPsych.data.write](jspsych-data.md#jspsychdatawrite)

### [Turk module](jspsych-turk.md)

* [jsPsych.turk.submitToTurk](jspsych-turk.md#jspsychturksubmittoturk)
* [jsPsych.turk.turkInfo](jspsych-turk.md#jspsychturkturkinfo)

### [Randomization module](jspsych-randomization.md)

* [jsPsych.randomization.factorial](jspsych-randomization.md#jspsychrandomizationfactorial)
* [jsPsych.randomization.repeat](jspsych-randomization.md#jspsychrandomizationrepeat)

### PluginAPI module

* jsPsych.pluginAPI.getKeyboardResponse
* jsPsych.pluginAPI.cancelKeyboardResponse
* jsPsych.pluginAPI.cancelAllKeyboardResponses
* jsPsych.pluginAPI.normalizeTrialVariables
* jsPsych.pluginAPI.enforceArray



