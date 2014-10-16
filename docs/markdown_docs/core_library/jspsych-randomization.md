# jsPsych.randomization

The jsPsych.randomization module contains methods that are useful for generating random lists of trial variables.

---

## jsPsych.randomization.factorial

```
jsPsych.randomization.factorial(factors, repetitions, unpack)
```

### Parameters

Parameter | Type | Description
----------|------|------------
factors | object | The `factors` object should contain a property for each different factor. Each property-factor should have a value of an array, with each element of the array corresponding to a level of the factor.
repetitions | integer | The number of times to repeat each unique combination of the factors in the output sample.
unpack | boolean | If `true` then the output will be an object with a property for each factor in the original `factors` object. The value of each property-factor will be an array containing the levels of the factor in a random order. The order will be consistent across each property-factor (e.g. the first element of each property-factor will specify one unique combination of the factors). If `false`, then the return value will be an array of objects where each property-factor contains only a single value.

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
## jsPsych.randomization.repeat

```
jsPsych.randomization.repeat(array, repetitions, unpack)
```

### Parameters

Parameter | Type | Description
----------|------|------------
array | array | The array of values to randomize & repeat.
repetitions | integer or array | The number of times to repeat each element of the `array` in the final sample. If this parameter is defined as an integer, then each element of `array` is repeated the same number of times. This parameter can also be an array of the same length as `array`, in which case each element of `array` will be repeated the number of times defined in the corresponding position of the `repetitions` array.
unpack | boolean | If each element of `array` is an object with an equivalent set of properties, then setting `unpack` to `true` will make the return value an object with a property for each of the unique properties among the elements of the `array`. Each property in the output object will be an array containing the values for that property in the randomized order. The order will be consistent across properties. If this is `false` then the output is just an array containing a randomized order of the original `array` elements.

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
	correct_key: 80,
	person_name: 'Joe'
}

var trial2 = {
	stimulus: 'img/faceB.jpg',
	correct_key: 80,
	person_name: 'Fred'
}

var trial3 = {
	stimulus: 'img/faceC.jpg',
	correct_key: 81,
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
	correct_key: 80,
	person_name: 'Joe'
}

var trial2 = {
	stimulus: 'img/faceB.jpg',
	correct_key: 80,
	person_name: 'Fred'
}

var trial3 = {
	stimulus: 'img/faceC.jpg',
	correct_key: 81,
	person_name: 'Mary'
}

var myArray = [ trial1, trial2, trial3 ];
var shuffledArray = jsPsych.randomization.repeat(myArray, 2, true);

/*
output: shuffledArray = {
	stimulus: ['img/faceB.jpg','img/faceA.jpg','img/faceC.jpg','img/faceA.jpg','img/faceC.jpg','img/faceB.jpg'],
	correct_key: [80, 80, 81, 80, 81, 80],
	person_name: ['Fred','Joe', 'Mary', 'Joe', 'Mary', 'Fred']
}
*/
```





