import rw from "random-words";
import seedrandom from "seedrandom/lib/alea";

/**
 * Uses the `seedrandom` package to replace Math.random() with a seedable PRNG.
 *
 * @param seed An optional seed. If none is given, a random seed will be generated.
 * @returns The seed value.
 */
export function setSeed(seed: string = Math.random().toString()) {
  Math.random = seedrandom(seed);
  return seed;
}

export function repeat(array, repetitions, unpack = false) {
  const arr_isArray = Array.isArray(array);
  const rep_isArray = Array.isArray(repetitions);

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
    // if repetitions is not an array, but array is, then we
    // repeat repetitions for each entry in array
    if (!rep_isArray) {
      let reps = [];
      for (let i = 0; i < array.length; i++) {
        reps.push(repetitions);
      }
      repetitions = reps;
    } else {
      if (array.length != repetitions.length) {
        console.warn(
          "Unclear parameters given to randomization.repeat. Items and repetitions are unequal lengths. Behavior may not be as expected."
        );
        // throw warning if repetitions is too short, use first rep ONLY.
        if (repetitions.length < array.length) {
          let reps = [];
          for (let i = 0; i < array.length; i++) {
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
  let allsamples = [];
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < repetitions[i]; j++) {
      if (array[i] == null || typeof array[i] != "object") {
        allsamples.push(array[i]);
      } else {
        allsamples.push(Object.assign({}, array[i]));
      }
    }
  }

  let out: any = shuffle(allsamples);

  if (unpack) {
    out = unpackArray(out);
  }

  return out;
}

export function shuffle(array: Array<any>) {
  if (!Array.isArray(array)) {
    console.error("Argument to shuffle() must be an array.");
  }

  const copy_array = array.slice(0);
  let m = copy_array.length,
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

export function shuffleNoRepeats(arr: Array<any>, equalityTest: (a: any, b: any) => boolean) {
  if (!Array.isArray(arr)) {
    console.error("First argument to shuffleNoRepeats() must be an array.");
  }
  if (typeof equalityTest !== "undefined" && typeof equalityTest !== "function") {
    console.error("Second argument to shuffleNoRepeats() must be a function.");
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

  const random_shuffle = shuffle(arr);

  for (let i = 0; i < random_shuffle.length - 1; i++) {
    if (equalityTest(random_shuffle[i], random_shuffle[i + 1])) {
      // neighbors are equal, pick a new random neighbor to swap (not the first or last element, to avoid edge cases)
      let random_pick = Math.floor(Math.random() * (random_shuffle.length - 2)) + 1;
      // test to make sure the new neighbor isn't equal to the old one
      while (
        equalityTest(random_shuffle[i + 1], random_shuffle[random_pick]) ||
        equalityTest(random_shuffle[i + 1], random_shuffle[random_pick + 1]) ||
        equalityTest(random_shuffle[i + 1], random_shuffle[random_pick - 1]) ||
        equalityTest(random_shuffle[i], random_shuffle[random_pick])
      ) {
        random_pick = Math.floor(Math.random() * (random_shuffle.length - 2)) + 1;
      }
      const new_neighbor = random_shuffle[random_pick];
      random_shuffle[random_pick] = random_shuffle[i + 1];
      random_shuffle[i + 1] = new_neighbor;
    }
  }

  return random_shuffle;
}

export function shuffleAlternateGroups(arr_groups, random_group_order = false) {
  const n_groups = arr_groups.length;
  if (n_groups == 1) {
    console.warn(
      "shuffleAlternateGroups() was called with only one group. Defaulting to simple shuffle."
    );
    return shuffle(arr_groups[0]);
  }

  let group_order = [];
  for (let i = 0; i < n_groups; i++) {
    group_order.push(i);
  }
  if (random_group_order) {
    group_order = shuffle(group_order);
  }

  const randomized_groups = [];
  let min_length = null;
  for (let i = 0; i < n_groups; i++) {
    min_length =
      min_length === null ? arr_groups[i].length : Math.min(min_length, arr_groups[i].length);
    randomized_groups.push(shuffle(arr_groups[i]));
  }

  const out = [];
  for (let i = 0; i < min_length; i++) {
    for (let j = 0; j < group_order.length; j++) {
      out.push(randomized_groups[group_order[j]][i]);
    }
  }

  return out;
}

export function sampleWithoutReplacement(arr, size) {
  if (!Array.isArray(arr)) {
    console.error("First argument to sampleWithoutReplacement() must be an array");
  }

  if (size > arr.length) {
    console.error("Cannot take a sample larger than the size of the set of items to sample.");
  }
  return shuffle(arr).slice(0, size);
}

export function sampleWithReplacement(arr, size, weights?) {
  if (!Array.isArray(arr)) {
    console.error("First argument to sampleWithReplacement() must be an array");
  }

  const normalized_weights = [];
  if (typeof weights !== "undefined") {
    if (weights.length !== arr.length) {
      console.error(
        "The length of the weights array must equal the length of the array " +
          "to be sampled from."
      );
    }
    let weight_sum = 0;
    for (const weight of weights) {
      weight_sum += weight;
    }
    for (const weight of weights) {
      normalized_weights.push(weight / weight_sum);
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      normalized_weights.push(1 / arr.length);
    }
  }

  const cumulative_weights = [normalized_weights[0]];
  for (let i = 1; i < normalized_weights.length; i++) {
    cumulative_weights.push(normalized_weights[i] + cumulative_weights[i - 1]);
  }

  const samp = [];
  for (let i = 0; i < size; i++) {
    const rnd = Math.random();
    let index = 0;
    while (rnd > cumulative_weights[index]) {
      index++;
    }
    samp.push(arr[index]);
  }
  return samp;
}

export function factorial(factors: Record<string, any>, repetitions = 1, unpack = false) {
  let design = [{}];
  for (const [factorName, factor] of Object.entries(factors)) {
    const new_design = [];
    for (const level of factor) {
      for (const cell of design) {
        new_design.push({ ...cell, [factorName]: level });
      }
    }
    design = new_design;
  }

  return repeat(design, repetitions, unpack);
}

export function randomID(length = 32) {
  let result = "";
  const chars = "0123456789abcdefghjklmnopqrstuvwxyz";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Generate a random integer from `lower` to `upper`, inclusive of both end points.
 * @param lower The lowest value it is possible to generate
 * @param upper The highest value it is possible to generate
 * @returns A random integer
 */
export function randomInt(lower: number, upper: number) {
  if (upper < lower) {
    throw new Error("Upper boundary must be less than or equal to lower boundary");
  }
  return lower + Math.floor(Math.random() * (upper - lower + 1));
}

/**
 * Generates a random sample from a Bernoulli distribution.
 * @param p The probability of sampling 1.
 * @returns 0, with probability 1-p, or 1, with probability p.
 */
export function sampleBernoulli(p: number) {
  return Math.random() <= p ? 1 : 0;
}

export function sampleNormal(mean: number, standard_deviation: number) {
  return randn_bm() * standard_deviation + mean;
}

export function sampleExponential(rate: number) {
  return -Math.log(Math.random()) / rate;
}

export function sampleExGaussian(
  mean: number,
  standard_deviation: number,
  rate: number,
  positive = false
) {
  let s = sampleNormal(mean, standard_deviation) + sampleExponential(rate);
  if (positive) {
    while (s <= 0) {
      s = sampleNormal(mean, standard_deviation) + sampleExponential(rate);
    }
  }
  return s;
}

/**
 * Generate one or more random words.
 *
 * This is a wrapper function for the {@link https://www.npmjs.com/package/random-words `random-words` npm package}.
 *
 * @param opts An object with optional properties `min`, `max`, `exactly`,
 * `join`, `maxLength`, `wordsPerString`, `separator`, and `formatter`.
 *
 * @returns An array of words or a single string, depending on parameter choices.
 */
export function randomWords(opts) {
  return rw(opts);
}

// Box-Muller transformation for a random sample from normal distribution with mean = 0, std = 1
// https://stackoverflow.com/a/36481059/3726673
function randn_bm() {
  var u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function unpackArray(array) {
  const out = {};

  for (const x of array) {
    for (const key of Object.keys(x)) {
      if (typeof out[key] === "undefined") {
        out[key] = [];
      }
      out[key].push(x[key]);
    }
  }

  return out;
}
