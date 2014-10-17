# The jsPsych core library

Every jsPsych experiment utilizes the core library (contained in the `jspsych.js` file). The core library is the glue that holds all of the various plugins together. There are also several modules that are contained in the core library for tasks that are common to many different experiments. These modules are available whenever the `jspsych.js` file is loaded.

## Core library API

### [Core](jspsych-core.md)

* [jsPsych.currentChunkID](jspsych-core.md#jspsychcurrentchunkID)
* [jsPsych.currentTrial](jspsych-core.md#jspsychcurrenttrial)
* [jsPsych.finishTrial](jspsych-core.md#jspsychfinishtrial)
* [jsPsych.getDisplayElement](jspsych-core.md#jspsychgetdisplayelement)
* [jsPsych.init](jspsych-core.md#jspsychinit)
* [jsPsych.initSettings](jspsych-core.md#jspsychinitSettings)
* [jsPsych.preloadImages](jspsych-core.md#jspsychpreloadimages)
* [jsPsych.progress](jspsych-core.md#jspsychprogress)
* [jsPsych.startTime](jspsych-core.md#jspsychstarttime)
* [jsPsych.totalTime](jspsych-core.md#jspsychtotaltime)

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

### [PluginAPI module](jspsych-pluginAPI.md)

* [jsPsych.pluginAPI.cancelAllKeyboardResponses](jspsych-pluginAPI.md#jspsychpluginapicancelallkeyboardresponses)
* [jsPsych.pluginAPI.cancelKeyboardResponse](jspsych-pluginAPI.md#jspsychpluginapicancelkeyboardresponse)
* [jsPsych.pluginAPI.enforceArray](jspsych-pluginAPI.md#jspsychpluginapienforcearray)
* [jsPsych.pluginAPI.getKeyboardResponse](jspsych-pluginAPI.md#jspsychpluginapigetkeyboardresponse)
* [jsPsych.pluginAPI.normalizeTrialVariables](jspsych-pluginAPI.md#jspsychpluginapinormalizetrialvariables)


