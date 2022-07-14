# jsPsych.randomization

The jsPsych.randomization module contains methods that are useful for generating random lists of trial variables.

---

## jsPsych.randomization.factorial

```javascript
jsPsych.randomization.factorial(factors, repetitions, unpack)
```

### Parameters

| Parameter   | Type    | Description                              |
| ----------- | ------- | ---------------------------------------- |
| factors     | object  | The `factors` object should contain a property for each different factor. Each property-factor should have a value of an array, with each element of the array corresponding to a level of the factor. |
| repetitions | integer | The number of times to repeat each unique combination of the factors in the output sample. |
| unpack      | boolean | If `true` then the output will be an object with a property for each factor in the original `factors` object. The value of each property-factor will be an array containing the levels of the factor in a random order. The order will be consistent across each property-factor (e.g., the first element of each property-factor will specify one unique combination of the factors). If `false`, then the return value will be an array of objects where each property-factor contains only a single value. |

### Return value

The return value depends on the `unpack` parameter. See description of the parameter above, and examples below.

### Description

This method takes a list of factors and their levels, and creates a full factorial design by creating each unique combination of the factors. The returned set of combinations is in a random order.

### Examples

#### Create full factorial design

```javascript
var factors = {
	stimulus: ['a.jpg', 'b.jpg'],
	ms_delay: [100, 200]
}

var full_design = jsPsych.randomization.factorial(factors, 1);

/*
output:
full_design = [
	{stimulus: 'a.jpg', ms_delay: 200},
	{stimulus: 'b.jpg', ms_delay: 200},
	{stimulus: 'b.jpg', ms_delay: 100},
	{stimulus: 'a.jpg', ms_delay: 100},
]
*/
```

#### Create full factorial design with repeats

```javascript
var factors = {
	stimulus: ['a.jpg', 'b.jpg'],
	ms_delay: [100, 200]
}

var full_design = jsPsych.randomization.factorial(factors, 2);

/*
output:
full_design = [
	{stimulus: 'b.jpg', ms_delay: 200},
	{stimulus: 'b.jpg', ms_delay: 100},
	{stimulus: 'b.jpg', ms_delay: 100},
	{stimulus: 'a.jpg', ms_delay: 100},
	{stimulus: 'a.jpg', ms_delay: 200},
	{stimulus: 'b.jpg', ms_delay: 200},
	{stimulus: 'a.jpg', ms_delay: 100},
	{stimulus: 'a.jpg', ms_delay: 200},
]
*/
```

#### Create full factorial design, unpacked

```javascript
var factors = {
	stimulus: ['a.jpg', 'b.jpg'],
	ms_delay: [100, 200]
}

var full_design = jsPsych.randomization.factorial(factors, 1, true);

/*
output:
full_design = {
	stimulus: ['a.jpg','b.jpg','b.jpg','a.jpg'],
	ms_delay: [200, 100, 200, 100]
]
*/
```

---

## jsPsych.randomization.randomID

```javascript
jsPsych.randomization.randomID(length)
```

### Parameters

| Parameter | Type    | Description                             |
| --------- | ------- | --------------------------------------- |
| length    | integer | The length of the randomly generated ID |

### Return value

Returns a string of length `length` where each character is randomly selected from the numbers 0-9 and all lowercase English letters a-z.

### Description

Generates a random string that is likely to be unique. If length is undefined, then the string length is 32.

### Example

```javascript
console.log(jsPsych.randomization.randomID());
// outputs: "t7dwz0e713pc8juuaayyfvpkdd9un239"

console.log(jsPsych.randomization.randomID(8));
// outputs: "3xtpcbck"
```

---

## jsPsych.randomization.randomInt

```javascript
jsPsych.randomization.randomInt(lower, upper)
```

### Parameters

| Parameter | Type    | Description                             |
| --------- | ------- | --------------------------------------- |
| lower    | integer | The smallest value it is possible to generate |
| upper | integer | The largest value it is possible to generate |

### Return value

An integer

### Description

Generates a random integer from `lower` to `upper`

### Example

```javascript
console.log(jsPsych.randomization.randomInt(2,4));
// outputs: 2 or 3 or 4.
```

---


## jsPsych.randomization.repeat

```javascript
jsPsych.randomization.repeat(array, repetitions, unpack)
```

### Parameters

| Parameter   | Type             | Description                              |
| ----------- | ---------------- | ---------------------------------------- |
| array       | array            | The array of values to randomize & repeat. |
| repetitions | integer or array | The number of times to repeat each element of the `array` in the final sample. If this parameter is defined as an integer, then each element of `array` is repeated the same number of times. This parameter can also be an array of the same length as `array`, in which case each element of `array` will be repeated the number of times defined in the corresponding position of the `repetitions` array. |
| unpack      | boolean          | If each element of `array` is an object with an equivalent set of properties, then setting `unpack` to `true` will make the return value an object with a property for each of the unique properties among the elements of the `array`. Each property in the output object will be an array containing the values for that property in the randomized order. The order will be consistent across properties. If this is `false` then the output is just an array containing a randomized order of the original `array` elements. |

### Return value

The return value depends on the `unpack` parameter. See description of the parameter above, and examples below.

### Description

This method takes an array of values and generates a new random order of the array, with the option of repeating each element of the array a specified number of times.

If the array elements are objects with the same set of properties, then this method can optionally return a single object where each property is a randomized order of the properties defined in the original set of objects. This is useful for randomizing sets of parameters that are used to define a jsPsych block.

### Examples

#### Shuffle an array, no repeats

```javascript
var myArray = [1,2,3,4,5];
var shuffledArray = jsPsych.randomization.repeat(myArray, 1);
// output: shuffledArray = [3,2,4,1,5]
```

#### Shuffle an array with repeats

```javascript
var myArray = [1,2,3,4,5];
var shuffledArray = jsPsych.randomization.repeat(myArray, 2);
// output: shuffledArray = [1,3,4,2,2,4,5,1,5,3]
```

#### Shuffle an array of objects

```javascript
var trial1 = {
	stimulus: 'img/faceA.jpg',
	correct_key: 'p',
	person_name: 'Joe'
}

var trial2 = {
	stimulus: 'img/faceB.jpg',
	correct_key: 'p',
	person_name: 'Fred'
}

var trial3 = {
	stimulus: 'img/faceC.jpg',
	correct_key: 'q',
	person_name: 'Mary'
}

var myArray = [ trial1, trial2, trial3 ];
var shuffledArray = jsPsych.randomization.repeat(myArray, 2);

// output: shuffledArray = [ trial1, trial3, trial3, trial2, trial1, trial2 ]
```

#### Shuffle an array of objects, with unpack

```javascript
var trial1 = {
	stimulus: 'img/faceA.jpg',
	correct_key: 'p',
	person_name: 'Joe'
}

var trial2 = {
	stimulus: 'img/faceB.jpg',
	correct_key: 'p',
	person_name: 'Fred'
}

var trial3 = {
	stimulus: 'img/faceC.jpg',
	correct_key: 'q',
	person_name: 'Mary'
}

var myArray = [ trial1, trial2, trial3 ];
var shuffledArray = jsPsych.randomization.repeat(myArray, 2, true);

/*
output: shuffledArray = {
	stimulus: ['img/faceB.jpg','img/faceA.jpg','img/faceC.jpg','img/faceA.jpg','img/faceC.jpg','img/faceB.jpg'],
	correct_key: ['p', 'p', 'q', 'p', 'q', 'p'],
	person_name: ['Fred', 'Joe', 'Mary', 'Joe', 'Mary', 'Fred']
}
*/
```

---

## jsPsych.randomization.sampleBernoulli

```javascript
jsPsych.randomization.sampleBernoulli(p)
```

### Parameters

| Parameter  | Type    | Description                              |
| ---------- | ------- | ---------------------------------------- |
| p       | number   | Probability of sampling 1 |


### Return value

Returns 0 with probability `1-p` and 1 with probability `p`.

### Description

Generates a random sample from a Bernoulli distribution.

### Examples

#### Sample a value

```javascript
if(jsPsych.randomization.sampleBernoulli(0.8)){
	// this happens 80% of the time
} else {
	// this happens 20% of the time
}
```

---

## jsPsych.randomization.sampleExGaussian

```javascript
jsPsych.randomization.sampleExGaussian(mean, standard_deviation, rate, positive=false)
```

### Parameters

| Parameter  | Type    | Description                              |
| ---------- | ------- | ---------------------------------------- |
| mean       | number   | Mean of the normal distribution component of the exGaussian |
| standard_deviation | number | Standard deviation of the normal distribution component of the exGaussian |
| rate    | number   | Rate of the exponential distribution component of the exGaussian |
| positive | bool | If `true` sample will be constrained to > 0.

### Return value

A random sample from the distribution

### Description

Generates a random sample from an exponentially modified Gaussian distribution.

### Examples

#### Sample a value

```javascript
var rand_sample_exg = jsPsych.randomization.sampleExGaussian(500, 100, 0.01);
```

---

## jsPsych.randomization.sampleExponential

```javascript
jsPsych.randomization.sampleExponential(rate)
```

### Parameters

| Parameter  | Type    | Description                              |
| ---------- | ------- | ---------------------------------------- |
| rate    | number   | Rate of the exponential distribution |

### Return value

A random sample from the distribution

### Description

Generates a random sample from an exponential distribution.

### Examples

#### Sample a value

```javascript
var rand_sample_exg = jsPsych.randomization.sampleExponential(0.01);
```

---

## jsPsych.randomization.sampleNormal

```javascript
jsPsych.randomization.sampleNormal(mean, standard_deviation)
```

### Parameters

| Parameter  | Type    | Description                              |
| ---------- | ------- | ---------------------------------------- |
| mean       | number   | Mean of the normal distribution |
| standard_deviation | number | Standard deviation of the normal distribution |


### Return value

A random sample from the distribution

### Description

Generates a random sample from a normal distribution.

### Examples

#### Sample a value

```javascript
var rand_sample_exg = jsPsych.randomization.sampleNormal(500, 250);
```

---

## jsPsych.randomization.sampleWithReplacement

```javascript
jsPsych.randomization.sampleWithReplacement(array, sampleSize, weights)
```

### Parameters

| Parameter  | Type    | Description                              |
| ---------- | ------- | ---------------------------------------- |
| array      | array   | The array of values to sample from       |
| sampleSize | numeric | The number of samples to draw            |
| weights    | array   | The relative weight of each element in `array`. This array is normalized, so the values do not need to sum to 1. The length must match the length of `array`. |

### Return value

An array containing the sample.

### Description

This method returns a sample drawn at random from a set of values with replacement. The relative probability of drawing each item can be controlled by specifying the `weights`.

### Examples

#### Sample with equal probability

```javascript
var myArray = [1,2,3,4,5];
var sample = jsPsych.randomization.sampleWithReplacement(myArray, 10);
// output: sample = [3, 1, 2, 2, 5, 1, 4, 3, 1, 5];
```

#### Sample with unequal probability

```javascript
var myArray = [1,2,3,4,5];
var sample = jsPsych.randomization.sampleWithReplacement(myArray, 10, [6,1,1,1,1]);
// output: sample = [3, 4, 5, 1, 2, 1, 3, 1, 1, 1];
```

---

## jsPsych.randomization.sampleWithoutReplacement

```javascript
jsPsych.randomization.sampleWithoutReplacement(array, sampleSize)
```

### Parameters

| Parameter  | Type    | Description                        |
| ---------- | ------- | ---------------------------------- |
| array      | array   | The array of values to sample from |
| sampleSize | numeric | The number of samples to draw      |

### Return value

An array containing the sample.

### Description

This method returns a sample drawn at random from a set of values without replacement. The sample size must be less than or equal to the length of the array.

### Examples

#### Sample without replacement

```javascript
var myArray = [1,2,3,4,5];
var sample = jsPsych.randomization.sampleWithoutReplacement(myArray, 2);
// output: sample = [3,2];
```

---

## jsPsych.randomization.setSeed

```javascript
jsPsych.randomization.setSeed(seed)
```

### Parameters

| Parameter | Type  | Description                    |
| --------- | ----- | ------------------------------ |
| seed      | string | A seed for the random number generator |

### Return value

Returns the seed value.

### Description

This function will override the behavior of `Math.random()` to produce a seedable pseudo random number generator.
It uses the [seedrandom package](https://www.npmjs.com/package/seedrandom). 
Note that calling `setSeed()` will change how `Math.random()` behaves for the entire document. 
If you have non-jsPsych components on the page that use `Math.random()` they will be affected.

Using `setSeed()` without passing in a seed will generate a random 32-bit seed.
The seed value will be returned from the function call, allowing you to save it in the data for the experiment if needed.

### Examples

#### Use a random 32-bit seed and save to data

```javascript
const seed = jsPsych.randomization.setSeed();
jsPsych.data.addProperties({
	rng_seed: seed
});
```

#### Use your own seed

```javascript
jsPsych.randomization.setSeed("jspsych");
```

---

## jsPsych.randomization.shuffle

```javascript
jsPsych.randomization.shuffle(array)
```

### Parameters

| Parameter | Type  | Description                    |
| --------- | ----- | ------------------------------ |
| array     | array | The array of values to shuffle |

### Return value

Returns an array with the same elements as the input array in a random order.

### Description

A simple method for shuffling the order of an array.

### Examples

#### Shuffle an array

```javascript
var myArray = [1,2,3,4,5];
var shuffledArray = jsPsych.randomization.shuffle(myArray);
// output: shuffledArray = [3,2,4,1,5]
```

---

## jsPsych.randomization.shuffleNoRepeats

```javascript
jsPsych.randomization.shuffleNoRepeats(array, equalityTest)
```

### Parameters

| Parameter    | Type     | Description                              |
| ------------ | -------- | ---------------------------------------- |
| array        | array    | The array of values to shuffle           |
| equalityTest | function | A function to use to evaluate the equality of neighbors in the array. The function should accept two parameters, which are the two elements to be tested. It should return `true` if they are equal and `false` if not. The default function, if none is specified, is to use the `===` operator. This will work for primitive values, but fail for Objects and Arrays. An example function is given below in the examples. |

### Return value

Returns an array with the same elements as the input array in a random order, with no repeating neighbors.

### Description

Shuffle an array, ensuring that neighboring elements in the array are different.

*Warning: if you provide an array that has very few valid permutations with no neighboring elements, then this method will fail and cause the browser to hang.*

### Examples

#### Basic example

```javascript
var myArray = [1,2,3,4,5,1,2,3,4,5,1,2,3,4,5];
var shuffledArray = jsPsych.randomization.shuffleNoRepeats(myArray);
// output: shuffledArray = [2, 3, 5, 1, 2, 4, 1, 5, 4, 1, 3, 5, 4, 3, 2]
```

#### Custom equalityTest

```javascript
var myObjects = [
  {color:"blue"},
	{color:"red"},
	{color:"yellow"},
	{color:"orange"}
];

var repeatedSet = jsPsych.randomization.repeat(myObjects,3);
var shuffled = jsPsych.randomization.shuffleNoRepeats(repeatedSet, function(a,b) { return a.color === b.color });

// console.log(JSON.stringify(shuffled))
// "[{"color":"red"},{"color":"yellow"},{"color":"blue"},{"color":"yellow"},{"color":"orange"},{"color":"red"},{"color":"yellow"},{"color":"orange"},{"color":"blue"},{"color":"orange"},{"color":"red"},{"color":"blue"}]"
```
