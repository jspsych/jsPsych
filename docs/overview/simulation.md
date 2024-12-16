# Simulation Modes
*Added in 7.1*

Simulation mode allows you run your experiment automatically and generate artificial data. 

!!! info
    For a detailed description of the motivation behind simulation mode and a discussion of different use cases of simulation mode, see [de Leeuw, J.R., Gilbert, R.A., Petrov, N.B., & Luchterhandt, B. (2022). Simulation behavior to help researchers build experiments. *Behavior Research Methods*, https://doi.org/10.3758/s13428-022-01899-0](https://doi.org/10.3758/s13428-022-01899-0).

    A pre-print version is [available on PsyArXiv](https://psyarxiv.com/mq345).

## Getting Started

To use simulation mode, replace `jsPsych.run()` with `jsPsych.simulate()`.

```js
jsPsych.simulate(timeline);
```

This will run jsPsych in the default `data-only` simulation mode. 
To use the `visual` simulation mode you can specify the second parameter.

```js
jsPsych.simulate(timeline, "data-only");
jsPsych.simulate(timeline, "visual");
```

## What happens in simulation mode

In simulation mode, plugins call their `simulate()` method instead of calling their `trial()` method.
If a plugin doesn't implement a `simulate()` method, then the trial will run as usual (using the `trial()` method) and any interaction that is needed to advance to the next trial will be required. 
If a plugin doesn't support `visual` mode, then it will run in `data-only` mode.

### `data-only` mode

In `data-only` mode plugins typically generate resonable artificial data given the parameters specified for the trial. 
For example, if the `trial_duration` parameter is set to 2,000 ms, then any response times generated will be capped at this value. 
Generally the default data generated by the plugin randomly selects any available options (e.g., buttons to click) with equal probability. 
Response times are usually generated by sampling from an exponentially-modified Gaussian distribution truncated to positive values using `jsPsych.randomization.sampleExGaussian()`.

In `data-only` mode, the plugin's `trial()` method usually does not run. 
The data are simply calculated based on trial parameters and the `finishTrial()` method is called immediately with the simulated data.

### `visual` mode

In `visual` mode a plugin will typically generate simulated data for the trial and then use that data to mimic the kinds of actions that a participant would do. 
The plugin's `trial()` method is called by the simulation, and you'll see the experiment progress in real time. 
Mouse, keyboard, and touch events are simulated to control the experiment.

In `visual` mode each plugin will generate simulated data in the same manner as `data-only` mode, but this data will instead be used to generate actions in the experiment and the plugin's `trial()` method will ultimately be responsible for generating the data. 
This can create some subtle differences in data between the two modes. 
For example, if the simulated data generates a response time of 500 ms, the `data.rt` value will be exactly `500` in `data-only` mode, but may be `501` or another slightly larger value in `visual` mode.
This is because the simulated response is triggered at `500` ms and small delays due to JavaScript's event loop might add a few ms to the measure.

## Controlling simulation mode with `simulation_options`

The parameters for simulation mode can be set using the `simulation_options` parameter in both `jsPsych.simulate()` and at the level of individual trials.

### Trial-level options

You can specify simulation options for an individual trial by setting the `simulation_options` parameter.

```js
const trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p>Hello!</p>',
  simulation_options: {
    data: {
      rt: 500
    }
  }
}
```

Currently the three options that are available are `data`, `mode`, and `simulate`.

#### `data`

Setting the `data` option will replace the default data generated by the plugin with whatever data you specify.
You can specify some or all of the `data` parameters. 
Any parameters you do not specify will be generated by the plugin.

In most cases plugins will try to ensure that the data generated is consistent with the trial parameters.
For example, if a trial has a `trial_duration` parameter of `2000` but the `simulation_options` specify a `rt` of `2500`, this creates an impossible situation because the trial would have ended before the response at 2,500ms.
In most cases, the plugin will act as if a response was attempted at `2500`, which will mean that no response is generated for the trial. 
As you might imagine, there are a lot of parameter combinations that can generate peculiar cases where data may be inconsistent with trial parameters. 
We recommend double checking the simulation output, and please [alert us](https://github.com/jspsych/jspsych/issues) if you discover a situation where the simulation produces inconsistent data.

#### `mode`

You can override the simulation mode specified in `jsPsych.simulate()` for any trial. Setting `mode: 'data-only'` will run the trial in data-only mode and setting `mode: 'visual'` will run the trial in visual mode.

#### `simulate`

If you want to turn off simulation mode for a trial, set `simulate: false`.

#### Functions and timeline variables

The `simulation_options` parameter is compatible with both [dynamic parameters](dynamic-parameters.md) and [timeline variables](timeline.md#timeline-variables). 
Dynamic parameters can be especially useful if you want to randomize the data for each run of the simulation. 
For example, you can specify the `rt` as a sample from an ExGaussian distribution.

```js
const trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p>Hello!</p>',
  simulation_options: {
    data: {
      rt: ()=>{
        return jsPsych.randomization.sampleExGaussian(500, 50, 1/100, true)
      }
    }
  }
}
```

### Experiment-level options

You can also control the parameters for simulation by passing in an object to the `simulation_options` argument of `jsPsych.simulate()`.

```js
const simulation_options = {
  default: {
    data: {
      rt: 200
    }
  }
}

jsPsych.simulate(timeline, "visual", simulation_options)
```

The above example will set the `rt` for any trial that doesn't have its own `simulation_options` specified to `200`. 
This could be useful, for example, to create a very fast preview of the experiment to verify that everything is displaying correctly without having to wait through longer trials.

You can also specify sets of parameters by name using the experiment-level simulation options.

```js
const simulation_options = {
  default: {
    data: {
      rt: 200
    }
  },
  long_response: {
    data: {
      rt: () => {
        return jsPsych.randomization.sampleExGaussian(5000, 500, 1/500, true)
      }
    }
  }
}

const trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p>This is gonna take a bit.</p>',
  simulation_options: 'long_response'
}
timeline.push(trial);

jsPsych.simulate(timeline, "visual", simulation_options)
```

In the example above, we specified the `simulation_options` for `trial` using a string (`'long_response'`).
This will look up the corresponding set of options in the experiment-level `simulation_options`.

We had a few use cases in mind with this approach:

1. You could group together trials with similar behavior without needing to specify unique options for each trial.
2. You could easily swap out different simulation options to test different kinds of behavior. For example, if you want to test that a timeline with a `conditional_function` is working as expected, you could have one set of simulation options where the data will cause the `conditional_function` to evaluate to `true` and another to `false`. By using string-based identifiers, you don't need to change the timeline code at all. You can just change the object being passed to `jsPsych.simulate()`.
3. In an extreme case of the previous example, every trial on the timeline could have its own unique identifier and you could have multiple sets of simulation options to have very precise control over the data output.

## Current Limitations

Simulation mode is not yet as comprehensively tested as the rest of jsPsych.
While we are confident that the simulation is accurate enough for many use cases, it's very likely that there are circumstances where the simulated behavior will be inconsistent with what is actually possible in the experiment. 
If you come across any such circumstances, please [let us know](https://github.com/jspsych/jspsych/issues)!

Currently extensions are not supported in simulation mode. 
Some plugins are also not supported. 
This will be noted on their documentation page. 

