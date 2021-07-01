export function repeat(array, repetitions, unpack) {
  var arr_isArray = Array.isArray(array);
  var rep_isArray = Array.isArray(repetitions);

  // if array is not an array, then we just repeat the item
  if (!arr_isArray) {
    if (!rep_isArray) {
      array = [array];
      repetitions = [repetitions];
    } else {
      repetitions = [repetitions[0]];
      console.log(
        "Unclear parameters given to randomization.repeat. Multiple set sizes specified, but only one item exists to sample. Proceeding using the first set size."
      );
    }
  } else {
    if (!rep_isArray) {
      var reps = [];
      for (var i = 0; i < array.length; i++) {
        reps.push(repetitions);
      }
      repetitions = reps;
    } else {
      if (array.length != repetitions.length) {
        console.warning(
          "Unclear parameters given to randomization.repeat. Items and repetitions are unequal lengths. Behavior may not be as expected."
        );
        // throw warning if repetitions is too short, use first rep ONLY.
        if (repetitions.length < array.length) {
          var reps = [];
          for (var i = 0; i < array.length; i++) {
            reps.push(repetitions);
          }
          repetitions = reps;
        } else {
          // throw warning if too long, and then use the first N
          repetitions = repetitions.slice(0, array.length);
        }
      }
    }
  }

  // should be clear at this point to assume that array and repetitions are arrays with == length
  var allsamples = [];
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < repetitions[i]; j++) {
      if (array[i] == null || typeof array[i] != "object") {
        allsamples.push(array[i]);
      } else {
        allsamples.push(Object.assign({}, array[i]));
      }
    }
  }

  var out = shuffle(allsamples);

  if (unpack) {
    out = unpackArray(out);
  }

  return out;
}

export function shuffle(array) {
  if (!Array.isArray(array)) {
    console.error("Argument to jsPsych.randomization.shuffle() must be an array.");
  }

  var copy_array = array.slice(0);
  var m = copy_array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = copy_array[m];
    copy_array[m] = copy_array[i];
    copy_array[i] = t;
  }

  return copy_array;
}

export function shuffleNoRepeats(arr, equalityTest) {
  if (!Array.isArray(arr)) {
    console.error("First argument to jsPsych.randomization.shuffleNoRepeats() must be an array.");
  }
  if (typeof equalityTest !== "undefined" && typeof equalityTest !== "function") {
    console.error(
      "Second argument to jsPsych.randomization.shuffleNoRepeats() must be a function."
    );
  }
  // define a default equalityTest
  if (typeof equalityTest == "undefined") {
    equalityTest = function (a, b) {
      if (a === b) {
        return true;
      } else {
        return false;
      }
    };
  }

  var random_shuffle = shuffle(arr);
  for (var i = 0; i < random_shuffle.length - 1; i++) {
    if (equalityTest(random_shuffle[i], random_shuffle[i + 1])) {
      // neighbors are equal, pick a new random neighbor to swap (not the first or last element, to avoid edge cases)
      var random_pick = Math.floor(Math.random() * (random_shuffle.length - 2)) + 1;
      // test to make sure the new neighbor isn't equal to the old one
      while (
        equalityTest(random_shuffle[i + 1], random_shuffle[random_pick]) ||
        equalityTest(random_shuffle[i + 1], random_shuffle[random_pick + 1]) ||
        equalityTest(random_shuffle[i + 1], random_shuffle[random_pick - 1])
      ) {
        random_pick = Math.floor(Math.random() * (random_shuffle.length - 2)) + 1;
      }
      var new_neighbor = random_shuffle[random_pick];
      random_shuffle[random_pick] = random_shuffle[i + 1];
      random_shuffle[i + 1] = new_neighbor;
    }
  }

  return random_shuffle;
}

export function shuffleAlternateGroups(arr_groups, random_group_order) {
  if (typeof random_group_order == "undefined") {
    random_group_order = false;
  }

  var n_groups = arr_groups.length;
  if (n_groups == 1) {
    console.warn(
      "jsPsych.randomization.shuffleAlternateGroups was called with only one group. Defaulting to simple shuffle."
    );
    return shuffle(arr_groups[0]);
  }

  var group_order = [];
  for (var i = 0; i < n_groups; i++) {
    group_order.push(i);
  }
  if (random_group_order) {
    group_order = shuffle(group_order);
  }

  var randomized_groups = [];
  var min_length = null;
  for (var i = 0; i < n_groups; i++) {
    min_length =
      min_length === null ? arr_groups[i].length : Math.min(min_length, arr_groups[i].length);
    randomized_groups.push(shuffle(arr_groups[i]));
  }

  var out = [];
  for (var i = 0; i < min_length; i++) {
    for (var j = 0; j < group_order.length; j++) {
      out.push(randomized_groups[group_order[j]][i]);
    }
  }

  return out;
}

export function sampleWithoutReplacement(arr, size) {
  if (!Array.isArray(arr)) {
    console.error(
      "First argument to jsPsych.randomization.sampleWithoutReplacement() must be an array"
    );
  }

  if (size > arr.length) {
    console.error("Cannot take a sample " + "larger than the size of the set of items to sample.");
  }
  return shuffle(arr).slice(0, size);
}

export function sampleWithReplacement(arr, size, weights) {
  if (!Array.isArray(arr)) {
    console.error(
      "First argument to jsPsych.randomization.sampleWithReplacement() must be an array"
    );
  }

  var normalized_weights = [];
  if (typeof weights !== "undefined") {
    if (weights.length !== arr.length) {
      console.error(
        "The length of the weights array must equal the length of the array " +
          "to be sampled from."
      );
    }
    var weight_sum = 0;
    for (var i = 0; i < weights.length; i++) {
      weight_sum += weights[i];
    }
    for (var i = 0; i < weights.length; i++) {
      normalized_weights.push(weights[i] / weight_sum);
    }
  } else {
    for (var i = 0; i < arr.length; i++) {
      normalized_weights.push(1 / arr.length);
    }
  }

  var cumulative_weights = [normalized_weights[0]];
  for (var i = 1; i < normalized_weights.length; i++) {
    cumulative_weights.push(normalized_weights[i] + cumulative_weights[i - 1]);
  }

  var samp = [];
  for (var i = 0; i < size; i++) {
    var rnd = Math.random();
    var index = 0;
    while (rnd > cumulative_weights[index]) {
      index++;
    }
    samp.push(arr[index]);
  }
  return samp;
}

export function factorial(factors, repetitions, unpack) {
  var factorNames = Object.keys(factors);

  var factor_combinations = [];

  for (var i = 0; i < factors[factorNames[0]].length; i++) {
    factor_combinations.push({});
    factor_combinations[i][factorNames[0]] = factors[factorNames[0]][i];
  }

  for (var i = 1; i < factorNames.length; i++) {
    var toAdd = factors[factorNames[i]];
    var n = factor_combinations.length;
    for (var j = 0; j < n; j++) {
      var base = factor_combinations[j];
      for (var k = 0; k < toAdd.length; k++) {
        var newpiece = {};
        newpiece[factorNames[i]] = toAdd[k];
        factor_combinations.push(Object.assign({}, base, newpiece));
      }
    }
    factor_combinations.splice(0, n);
  }

  repetitions = typeof repetitions === "undefined" ? 1 : repetitions;
  var with_repetitions = repeat(factor_combinations, repetitions, unpack);

  return with_repetitions;
}

export function randomID(length) {
  var result = "";
  var length = typeof length == "undefined" ? 32 : length;
  var chars = "0123456789abcdefghjklmnopqrstuvwxyz";
  for (var i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function unpackArray(array) {
  var out = {};

  for (var i = 0; i < array.length; i++) {
    var keys = Object.keys(array[i]);
    for (var k = 0; k < keys.length; k++) {
      if (typeof out[keys[k]] === "undefined") {
        out[keys[k]] = [];
      }
      out[keys[k]].push(array[i][keys[k]]);
    }
  }

  return out;
}
