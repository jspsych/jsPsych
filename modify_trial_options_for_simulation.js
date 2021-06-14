// ----------------------------CODE UNDER REVIEW--------------------------
// There might be bugs so use cautiously
// Author of the simulation functionality: Nikolay Petrov (github: @nikbpetrov)
function modify_trial_options_for_simulation(trial, simulate_all_trials_opts, simulate_trial_type_opts) {
  if (trial.type === 'free-sort' ||    
      trial.type === 'preload' || trial.type === 'call-function' || trial.type === 'external-html' || trial.type === 'virtual-chinrest' || 
      trial.type === 'webgazer-calibrate' || trial.type === 'webgazer-init-camera' || trial.type === 'webgazer-validate') {
    console.warn('Simulation is not available for a trial of type \''+trial.type+'\' yet.')
    trial.simulate = false
  } 
  else {
    // --------------------------------------------------------------------Define the current trial's simulations options
    // Priority: all_trial_opts that apply to all trials >>> trial_type_opts that apply to all trials of specific type >>> trial.simulate_opts that are defined on a specific trial
    
    // note that it is possible to set options for a trial that will have no effect on that trial, e.g. simulate_opts={'some_random_parameter': 'random_value'} on an 'html-keyboard-response'
    // this looks allowed in jsPsych by default (e.g. you can specify any trial parameters, but only specific ones get evaluated)
    // -----------maybe raise a warning or something when a trial option is overwritten and allow to display/hide warnings
    
    let curr_trial_simulate_opts = {'from_simulate_all_trials_opts': {}, 'from_simulate_trial_type_opts': {}, 'from_trial_simulate_opts': {}}
    for (const [param, param_val] of Object.entries(simulate_all_trials_opts)) {
      curr_trial_simulate_opts['from_simulate_all_trials_opts'][param] = param_val
    }
    if (typeof simulate_trial_type_opts !== 'undefined') {
      // technically here the user is allowed to set the simulate_opts of a specific trial_type
      // which will get evaluated in the next loop
      for (const [trial_type, trial_type_params] of Object.entries(simulate_trial_type_opts)) {
        if (trial_type === trial.type) {
          for (const [param, param_val] of Object.entries(trial_type_params)) {
            curr_trial_simulate_opts['from_simulate_trial_type_opts'][param] = param_val 
          }
        }
      }
    }
    if (typeof trial.simulate_opts !== 'undefined') {
      // potentially here, on the specific trial definition, it is possible for a user to specify the simulate_opts but this does not make sense
      // as this would look like: 'simulate_opts': {'some_normal_trial_specific_paramater': 'value', 'simulate_opts': {}}
      // this will also not get evaluated in any meaningful sense so it's fine
      for (const [param, param_val] of Object.entries(trial.simulate_opts)) {
        curr_trial_simulate_opts['from_trial_simulate_opts'][param] = param_val
      }
    }


    // --------------------------------Save the simulation opts in the trial's simulation_opts paramter and show specificity
    // i.e. tell the user which trial's options are set during the simulation and tell them where they are coming from (i.e. from all_trials_opts, trial_type or specific trial)
    trial.simulate_opts = {'from_simulate_all_trials_opts': curr_trial_simulate_opts['from_simulate_all_trials_opts'], 
                            'from_simulate_trial_type_opts': {}, 
                            'from_trial_simulate_opts': {}
                          }
    for (const [param, param_val] of Object.entries(curr_trial_simulate_opts['from_simulate_trial_type_opts'])) {
      trial.simulate_opts['from_simulate_trial_type_opts'][param] = param_val
      if (trial.simulate_opts['from_simulate_all_trials_opts'].hasOwnProperty(param)) {
        delete trial.simulate_opts['from_simulate_all_trials_opts'][param]
      }
    }
    for (const [param, param_val] of Object.entries(curr_trial_simulate_opts['from_trial_simulate_opts'])) {
      trial.simulate_opts['from_trial_simulate_opts'][param] = param_val
      if (trial.simulate_opts['from_simulate_all_trials_opts'].hasOwnProperty(param)) {
        delete trial.simulate_opts['from_simulate_all_trials_opts'][param]
      }
      if (trial.simulate_opts['from_simulate_trial_type_opts'].hasOwnProperty(param)) {
        delete trial.simulate_opts['from_simulate_trial_type_opts'][param]
      }
    }

    // ----------------------------------------------------------------------Set the current trial's parameters based on the simulation options
    // remember that the simulations opts are nested to show specificity, hence looping through values
    // duplicate options are also not possible as this is handled above during saving
    Object.values(trial.simulate_opts).forEach(function(v) {
      for (const [param, param_val] of Object.entries(v)) {
        if (param_val == 'same_as_simulate_response_time') {
          trial[param] =  simulate_all_trials_opts.simulate_response_time
        } else {
          trial[param] = param_val        
        }
      }
    })
  }
  return trial
}