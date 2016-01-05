# The jsPsych core library

Every jsPsych experiment utilizes the core library (contained in the `jspsych.js` file). The core library is the glue that holds all of the various plugins together. There are also several modules that are contained in the core library for tasks that are common to many different experiments. These modules are available whenever the `jspsych.js` file is loaded.

## Core library API

### [Core](jspsych-core.md)

* [jsPsych.currentTimelineNodeID](jspsych-core.md#jspsychcurrenttimelinenodeid)
* [jsPsych.currentTrial](jspsych-core.md#jspsychcurrenttrial)
* [jsPsych.endCurrentTimeline](jspsych-core.md#jspsychendcurrenttimeline)
* [jsPsych.endExperiment](jspsych-core.md#jspsychendexperiment)
* [jsPsych.finishTrial](jspsych-core.md#jspsychfinishtrial)
* [jsPsych.getDisplayElement](jspsych-core.md#jspsychgetdisplayelement)
* [jsPsych.init](jspsych-core.md#jspsychinit)
* [jsPsych.initSettings](jspsych-core.md#jspsychinitSettings)
* [jsPsych.progress](jspsych-core.md#jspsychprogress)
* [jsPsych.startTime](jspsych-core.md#jspsychstarttime)
* [jsPsych.totalTime](jspsych-core.md#jspsychtotaltime)

### [Data module](jspsych-data.md)

* [jsPsych.data.addDataToLastTrial](jspsych-data.md#jspsychdataadddatatolasttrial)
* [jsPsych.data.addProperties](jspsych-data.md#jspsychdataaddproperties)
* [jsPsych.data.dataAsCSV](jspsych-data.md#jspsychdatadataascsv)
* [jsPsych.data.dataAsJSON](jspsych-data.md#jspsychdatadataasjson)
* [jsPsych.data.displayData](jspsych-data.md#jspsychdatadisplaydata)
* [jsPsych.data.getData](jspsych-data.md#jspsychdatagetdata)
* [jsPsych.data.getDataByTimelineNode](jspsych-data.md#jspsychdatagetdatabytimelinenode)
* [jsPsych.data.getDataByTrialIndex](jspsych-data.md#jspsychdatagetdatabytrialindex)
* [jsPsych.data.getLastTimelineData](jspsych-data.md#jspsychdatagetlasttimelinedata)
* [jsPsych.data.getLastTrialData](jspsych-data.md#jspsychdatagetlasttrialdata)
* [jsPsych.data.getTrialsOfType](jspsych-data.md#jspsychdatagettrialsoftype)

* [jsPsych.data.getURLVariable](jspsych-data.md#jspsychdatageturlvariable)
* [jsPsych.data.localSave](jspsych-data.md#jspsychdatalocalsave)
* [jsPsych.data.write](jspsych-data.md#jspsychdatawrite)
* [jsPsych.data.urlVariables](jspsych-data.md#jspsychdataurlvariables)

### [Turk module](jspsych-turk.md)

* [jsPsych.turk.submitToTurk](jspsych-turk.md#jspsychturksubmittoturk)
* [jsPsych.turk.turkInfo](jspsych-turk.md#jspsychturkturkinfo)

### [Randomization module](jspsych-randomization.md)

* [jsPsych.randomization.factorial](jspsych-randomization.md#jspsychrandomizationfactorial)
* [jsPsych.randomization.randomID](jspsych-randomization.md#jspsychrandomizationrandomid)
* [jsPsych.randomization.repeat](jspsych-randomization.md#jspsychrandomizationrepeat)
* [jsPsych.randomization.sample](jspsych-randomization.md#jspsychrandomizationsample)
* [jsPsych.randomization.shuffle](jspsych-randomization.md#jspsychrandomizationshuffle)
* [jsPsych.randomization.shuffleNoRepeats](jspsych-randomization.md#jspsychrandomizationshufflenorepeats)

### [PluginAPI module](jspsych-pluginAPI.md)

* [jsPsych.pluginAPI.autoPreload](jspsych-pluginAPI.md#jspsychpluginapiautopreload)
* [jsPsych.pluginAPI.cancelAllKeyboardResponses](jspsych-pluginAPI.md#jspsychpluginapicancelallkeyboardresponses)
* [jsPsych.pluginAPI.cancelKeyboardResponse](jspsych-pluginAPI.md#jspsychpluginapicancelkeyboardresponse)
* [jsPsych.pluginAPI.convertKeyCharacterToKeyCode](jspsych-pluginAPI.md#jspsychpluginapiconvertkeycharactertokeycode)
* [jsPsych.pluginAPI.getAudioBuffer](jspsych-pluginAPI.md#jspsychpluginapigetaudiobuffer)
* [jsPsych.pluginAPI.getKeyboardResponse](jspsych-pluginAPI.md#jspsychpluginapigetkeyboardresponse)
* [jsPsych.pluginAPI.evaluateFunctionParameters](jspsych-pluginAPI.md#jspsychpluginapievaluatefunctionparameters)
* [jsPsych.pluginAPI.preloadAudioFiles](jspsych-pluginAPI.md#jspsychpluginapipreloadaudiofiles)
* [jsPsych.pluginAPI.preloadImages](jspsych-pluginAPI.md#jspsychpluginapipreloadimages)
* [jsPsych.pluginAPI.registerPreload](jspsych-pluginAPI.md#jspsychpluginapiregisterpreload)
