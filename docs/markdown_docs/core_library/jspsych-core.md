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

### Data module

* jsPsych.data.getData
* jsPsych.data.write
* jsPsych.data.dataAsCSV
* jsPsych.data.localSave
* jsPsych.data.getTrialsOfType
* jsPsych.data.getTrialsFromChunk
* jsPsych.data.getLastTrialData
* jsPsych.data.getLastChunkData
* jsPsych.data.displayData

### Turk module

* jsPsych.turk.turkInfo
* jsPsych.turk.submitToTurk

### Randomization module

* jsPsych.randomization.repeat
* jsPsych.randomization.factorial

### PluginAPI module

* jsPsych.pluginAPI.getKeyboardResponse
* jsPsych.pluginAPI.cancelKeyboardResponse
* jsPsych.pluginAPI.cancelAllKeyboardResponses
* jsPsych.pluginAPI.normalizeTrialVariables
* jsPsych.pluginAPI.enforceArray



