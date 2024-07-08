# Metadata Module

The metadata module contains functions for interacting metadata according to [Psych-DS standards](https://psych-ds.github.io/). To interact with the metadata, we strongly recommend you call the generate method on the experiment data then adjust fields accordingly. The generate method uses documentation for plugins and extensions created in the main JsPsych repo to create default descriptions. This works best for experiments run in v8+, but will also work for old experimental data. 

--- 

## metadata.generate





### Examples



#### Calling metadata after running an experiment

```javascript
var metadata = new jsPsychMetadata();

const metadata_options = {
  randomField: "this is a field",
  author: {
    "John": {
      name: "John",
      givenName: "Johnathan",
    },
  },
  variables: {
    "trial_type" : {
      description: {
        "chat-plugin": "this chat plugin allows you to talk to gpt!",
      }
    },
    "trial_index": {
      name: "index",
    },
  },
}

var jsPsych = initJsPsych({
  on_finish: async function() {      
    await metadata.generate(jsPsych.data.get().json());
  },
  default_iti: 250
});
```

#### Calling metadata on data loaded locally



